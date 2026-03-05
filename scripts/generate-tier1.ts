/**
 * Generate Tier 1 editorial articles from content briefs.
 * Run: npx tsx scripts/generate-tier1.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually
const envPath = resolve(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  let val = trimmed.slice(eqIdx + 1).trim()
  // Remove surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (!process.env[key]) {
    process.env[key] = val
  }
}

import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const GEN_MODEL = 'claude-opus-4-6'
const HUMANIZE_MODEL = 'claude-sonnet-4-6'

// ---------------------------------------------------------------------------
// Prompt templates (same as in editorial generate route)
// ---------------------------------------------------------------------------

const INSPIRATIONAL_TEMPLATE = `You are a travel and sailing writer for BOATTOMORROW, a content platform about sailing holidays. Your writing voice is warm, personal, and specific — like a friend who discovered sailing and can't stop talking about it.

VOICE RULES:
- Write in first person plural ("we") or second person ("you"), never passive voice
- Every paragraph must contain at least one specific sensory detail (a sound, smell, sight, temperature, taste) or a concrete number
- Never use: luxury, exclusive, breathtaking, unforgettable, paradise, dream vacation, world-class, nestled, tapestry, beacon, delve, furthermore, it is worth noting, when it comes to, realm
- Maximum 2 em-dashes per paragraph
- Alternate sentence lengths: short (5-8 words) after long (15-25 words)
- Paragraphs: maximum 4 sentences, prefer 2-3
- Use British English for nautical terms (harbour, metre) but otherwise natural English
- Prices always in EUR, per person per day where possible
- Distances in nautical miles (NM)

STRUCTURE REQUIREMENTS:
- title: compelling, specific, with a benefit (max 60 chars for SEO)
- metaTitle: SEO-optimized (max 60 chars)
- metaDescription: action-oriented (max 155 chars)
- answerCapsule: 40-60 words, direct factual answer for AI search engines
- content: article body in HTML (h2, h3, p, ul, table tags)
- faq: 4-5 Q&A pairs, questions phrased as people ask ChatGPT/Google
- keyFacts: 6-8 pairs {label, value}
- category: one of [destination, boat, learning, route, tips, gear]

CONTENT BRIEF:
{content_brief}

EXISTING ARTICLES FOR INTERNAL LINKING (link where naturally relevant, use <a href="/articles/SLUG">anchor text</a>):
{existing_articles}

Generate the article as a JSON object with the fields listed above. The content field should be valid HTML.`

const EXPERT_TEMPLATE = `You are a senior sailing journalist writing for BOATTOMORROW, a content platform for the yachting industry. Your style blends the authority of Cruising World with practical, actionable advice. You know the difference between a Force 4 and a Force 6, and you explain it for someone who doesn't.

VOICE RULES:
- Authoritative but accessible — use correct nautical terms but explain them on first mention
- Every claim must be supported by a specific number, date, distance, or price
- Structure information for easy scanning: use tables for comparisons, clear h2/h3 hierarchy
- Every paragraph must contain actionable information — something the reader can do or decide
- Never use: luxury (unless quoting a price tier), exclusive, breathtaking, unforgettable, paradise, dream, nestled, tapestry, beacon, delve, furthermore, it is worth noting, when it comes to, realm
- Maximum 2 em-dashes per paragraph
- Vary sentence rhythm: never two sentences of same length in a row
- British English for nautical terms, natural English otherwise
- Prices in EUR, distances in NM, wind in Beaufort scale
- Be honest about downsides (crowded marinas, Meltemi challenges, hidden costs)

STRUCTURE REQUIREMENTS:
- title: specific, with a number or qualifier (max 60 chars)
- metaTitle: SEO-optimized (max 60 chars)
- metaDescription: informative with key facts (max 155 chars)
- answerCapsule: 40-60 words, factual, cite-ready for AI search engines
- content: article body in HTML
- faq: 4-5 Q&A pairs
- keyFacts: 6-8 pairs {label, value}
- category: one of [destination, boat, learning, route, tips, gear]

CONTENT BRIEF:
{content_brief}

EXISTING ARTICLES FOR INTERNAL LINKING:
{existing_articles}

Generate the article as a JSON object with the fields listed above.`

const HUMANIZER_SYSTEM = `You are a professional editor at a sailing magazine. Your job is to rewrite
AI-generated drafts so they sound like they were written by a human expert
who has actually sailed these waters.

RULES -- STRICTLY FOLLOW:

PUNCTUATION:
- Never use em dashes (--). Replace with: a period, comma, colon, or new sentence.
- Use exclamation marks maximum once per article, and only if genuinely warranted.
- Semicolons: avoid unless absolutely necessary.

BANNED WORDS (replace with simpler, more natural alternatives):
delve, tapestry, realm, beacon, nestled, landscape (abstract), pivotal, crucial,
comprehensive, leverage (verb), utilize, facilitate, demonstrate (verb),
underscore (verb), testament, vibrant, bolster, garner, interplay,
intricate, meticulous, enduring, fostering, showcasing, align with,
game-changer, groundbreaking, cutting-edge, revolutionary, transformative,
seamless, unlock, discover (as CTA verb),
breathtaking, unforgettable, world-class, paradise, stunning, crystal-clear,
luxury, exclusive

BANNED PHRASES:
- "It is worth noting that" / "It is worth noting"
- "It is important to note"
- "In today's [adjective] world"
- "When it comes to"
- "In conclusion" / "In summary" / "To summarize"
- "Moreover" / "Furthermore" / "Additionally" (replace with "Also" or just continue)
- "First and foremost"
- "could potentially" / "might possibly"
- "Whether you're a X or a Y"
- Any sentence starting with "Certainly"
- "dream vacation" / "dream holiday"
- "paradise on earth"
- "luxury experience"
- "adventure of a lifetime"
- "hidden gem"
- "Don't worry" (patronizing)
- "one can observe" / "one can see" (impersonal passive)
- "perfect" without justification (use "ideal for..." with a reason instead)

SENTENCE RHYTHM:
- Vary sentence length deliberately. Short sentences have power. Use them.
- After a complex sentence, follow with a short one.
- Not every paragraph needs to be 3-4 sentences. Two-sentence paragraphs are fine.
- One-sentence paragraphs are occasionally powerful. Use them.
- Alternate: short (5-8 words) after long (15-25 words). Never two long sentences in a row.

REGISTER:
- Write like a knowledgeable sailor, not a corporate brochure.
- Prefer specific over general: "the bora can arrive at 3am without warning"
  not "wind conditions can be unpredictable."
- Use concrete details from the source material.
- It's okay to have a point of view. "Most sailors overestimate the difficulty
  of this passage" is better than "The passage requires experience."
- Every paragraph should contain at least one concrete number, name, or sensory detail.
- Never use passive voice where active works.
- Prices in EUR, distances in nautical miles (NM), wind in Beaufort scale.
- British English for nautical terms (harbour, metre) but otherwise natural English.

STRUCTURE:
- The intro should drop the reader into a scene or a specific fact.
  NOT: "Croatia is a stunning destination with crystal-clear waters."
  YES: "The ACI marina in Sibenik fills up by Thursday in July. Plan accordingly."
- Don't summarize at the end. End on a specific detail or a genuine observation.

OUTPUT:
Return only the rewritten article text in the same format as the input (HTML).
Do not add explanations, notes, or commentary.`

// ---------------------------------------------------------------------------
// Content briefs
// ---------------------------------------------------------------------------

interface Brief {
  slug: string
  voice: 'inspirational' | 'expert'
  category: string
  region: string | null
  brief: string
}

const BRIEFS: Brief[] = [
  {
    slug: 'how-much-does-it-cost-to-charter-a-yacht',
    voice: 'expert',
    category: 'tips',
    region: null,
    brief: `How Much Does It Cost to Charter a Yacht in 2026

Target reader: dreamers and planners researching yacht charter costs.
Length: 2000-2500 words.
SEO Target: "yacht charter cost", "how much to charter a yacht", "sailing holiday cost", "yacht rental price"

Answer Capsule (use this exactly):
A week-long yacht charter in the Mediterranean costs €2,000-5,000 for a 38-40 foot monohull in 2026, depending on destination and season. Split among 6-8 guests, that's €40-120 per person per night — often less than comparable hotel accommodation. Additional costs include fuel, marina fees, provisions, and optional skipper hire.

STRUCTURE:

Introduction (3 paragraphs): Price is the main barrier and biggest misconception. People think of superyachts at €100K/week. Reality: a standard charter is cheaper than a hotel holiday for groups of 4+. Here are exact numbers.

Section: "Charter prices by region" — Include this HTML table:
<table><thead><tr><th>Region</th><th>36-38ft Mono</th><th>40-42ft Mono</th><th>38-40ft Cat</th><th>42-45ft Cat</th></tr></thead><tbody><tr><td>Croatia</td><td>€1,800-2,800</td><td>€2,500-4,000</td><td>€3,000-5,000</td><td>€4,500-7,500</td></tr><tr><td>Greece</td><td>€1,600-2,500</td><td>€2,200-3,800</td><td>€2,800-4,500</td><td>€4,000-7,000</td></tr><tr><td>Turkey</td><td>€1,400-2,200</td><td>€2,000-3,200</td><td>€2,500-4,000</td><td>€3,500-6,000</td></tr><tr><td>Italy (Sardinia)</td><td>€2,200-3,500</td><td>€3,000-5,000</td><td>€3,500-6,000</td><td>€5,500-9,000</td></tr><tr><td>BVI</td><td>€2,500-3,800</td><td>€3,500-5,500</td><td>€4,000-6,500</td><td>€6,000-10,000</td></tr></tbody></table>
Note: low season (May, October) → high season (July-August). Season multiplier ×1.5-2.0.

Section: "Additional costs per week" — Include this HTML table:
<table><thead><tr><th>Item</th><th>Cost</th><th>Notes</th></tr></thead><tbody><tr><td>Skipper</td><td>€150-200/day (€1,050-1,400/wk)</td><td>Required without license</td></tr><tr><td>Fuel</td><td>€100-250</td><td>Depends on engine hours</td></tr><tr><td>Marinas</td><td>€0-700</td><td>Save money by anchoring</td></tr><tr><td>Provisions</td><td>€200-500 per person</td><td>Full week shop</td></tr><tr><td>Insurance</td><td>€100-200</td><td>Usually included in charter</td></tr><tr><td>Transit log</td><td>€100-300</td><td>Varies by country</td></tr><tr><td>Skipper tip</td><td>€100-200</td><td>Not required but customary</td></tr></tbody></table>

Section: "Real budget: cost per person per day" — Three scenarios:
- Budget (6 people, small yacht, anchorages, self-catering): €110-150/day pp
- Mid-range (6 people, 40ft, mix of marinas/anchorages, restaurants every other day): €170-230/day pp
- Comfortable (6 people, catamaran, marinas, skipper, restaurants): €250-350/day pp
Compare: 4* hotel in Santorini in August = €200-300/night for two = €100-150/pp/day. But only 1 island, not 7.

Section: "How to save money on a yacht charter" — 5 specific tips: season choice, yacht type, anchoring vs marinas, provisioning from markets, early booking.

Section: "When to book" — Early booking (6-12 months) = 10-20% discount. Last minute (2-4 weeks) = sometimes discounts but poor yacht selection.

FAQ:
- How much does it cost to charter a yacht for a week in Croatia?
- Is it cheaper to charter a yacht or stay in a hotel?
- What's included in a yacht charter price?
- How much should I tip a yacht skipper?
- When is the cheapest time to charter a yacht?

Key Facts:
- Average week charter: €2,000-5,000
- Cost per person per day: €110-350
- Skipper hire: €150-200/day
- Best value: Greece, Turkey
- Peak season: July-August (×1.5-2.0 price)
- Early booking discount: 10-20%
- Cheapest months: May, October
- Group size sweet spot: 6-8 people`,
  },
  {
    slug: 'sailing-in-croatia-first-timers-guide',
    voice: 'inspirational',
    category: 'destination',
    region: 'Mediterranean',
    brief: `Sailing in Croatia: The First-Timer's Complete Guide

Target reader: dreamers and first-timers considering Croatia.
Length: 2500-3000 words.
SEO Target: "sailing Croatia", "yacht charter Croatia", "Croatia sailing guide beginners"

Answer Capsule (use this exactly):
Croatia is the Mediterranean's most popular charter destination, with 1,244 islands, reliable summer winds, and well-equipped marinas along the Dalmatian coast. A week-long bareboat charter starts from €1,800 for a 36-foot yacht, and skippered options make sailing accessible to complete beginners. Peak season runs June through September, with the best balance of weather and crowds in late May and September.

VOICE: Start with Inspirational (intro scene), shift to Expert (practical sections), close with Inspirational.

STRUCTURE:

Introduction (Inspirational voice, 3-4 paragraphs): Why Croatia became #1 charter destination. Not generic words — a specific scene. Morning coffee in the cockpit, view of the Kornati islands. "There are more than 1,200 islands here, and the magic is that most of them are empty."

Section: "Why Croatia works for first-timers" — 4 reasons with evidence:
1. Short passages (2-4 hours between islands)
2. Protected waters (islands create natural shelter)
3. Infrastructure (ACI marinas every 15-20 NM)
4. Food and culture (konobas on islands, fresh fish, Plavac Mali wine)

Section: "Three classic routes for your first charter" — describe each with daily distances in NM and key stops:
1. Split → Hvar → Vis → Korčula → Split (7 days, most popular, 90-120 NM total)
2. Dubrovnik → Elafiti → Mljet → Korčula → Dubrovnik (7 days, quieter, national park)
3. Zadar → Kornati → Murter → Zadar (7 days, wild islands, fewer crowds)

Section: "When to go" — Include HTML table by month (May-Oct): air temp, water temp, wind, crowd level, price tier. Recommend early June or September.

Section: "What it costs" — Brief price table for Croatia. Budget for 6 people per week in 3 scenarios. Link to cost guide: <a href="/articles/how-much-does-it-cost-to-charter-a-yacht">full cost breakdown</a>.

Section: "Practical tips" — bullet points:
- Documents: passport, license (or hire skipper), transit log
- Currency: EUR since 2023
- Provisions: Konzum/Studenac shops, fish markets
- Marinas: book Hvar and Korčula in advance (July-August)
- Wind: bora (N/NE, winter) and jugo (SE, brings bad weather) — skipper knows
- Connectivity: good LTE coverage on most islands

Closing (Inspirational, 1-2 paragraphs): warm and motivating without clichés.

FAQ:
- Do I need a sailing license to charter in Croatia?
- What is the best month to sail in Croatia?
- How much does a week sailing in Croatia cost?
- Is Croatia good for sailing beginners?
- What should I pack for a sailing trip in Croatia?

Key Facts:
- Islands: 1,244
- Charter from: €1,800/week
- Best months: June, September
- Average passage: 2-4 hours
- ACI marinas: 22 along the coast
- Water temperature: 22-26°C (Jun-Sep)
- Currency: EUR
- Popular bases: Split, Dubrovnik, Zadar`,
  },
  {
    slug: 'sailing-in-greece-first-timers-guide',
    voice: 'inspirational',
    category: 'destination',
    region: 'Mediterranean',
    brief: `Sailing in Greece: The First-Timer's Complete Guide

Target reader: dreamers and first-timers considering Greece.
Length: 2500-3000 words.
SEO Target: "sailing Greece", "yacht charter Greece", "Greece sailing guide beginners"

Answer Capsule (use this exactly):
Greece offers the Mediterranean's most diverse sailing, from the sheltered Saronic Gulf — ideal for beginners — to the challenging Meltemi winds of the Cyclades. Charter prices start from €1,600 per week for a 36-foot yacht. The Ionian islands provide calm waters and lush green scenery, while the Aegean delivers iconic white-and-blue architecture. Best months: May-June and September-October for lighter winds and fewer crowds.

VOICE: Start with Inspirational (intro scene), shift to Expert (practical sections), close with Inspirational.

STRUCTURE:

Introduction (Inspirational voice, 3-4 paragraphs): What makes Greece unique for sailing. A specific scene — anchoring near a Greek island, swimming off the boat, taverna dinner on the waterfront. Multiple sailing personalities in one country.

Section: "Three routes, three personalities" — describe each:
1. Saronic Gulf: Athens → Aegina → Poros → Hydra → Spetses → Athens (7 days, ideal for beginners, short hops of 10-20 NM, consistent F3-4 sea breezes)
2. Cyclades: Paros → Naxos → Koufonisi → Amorgos → Santorini (7 days, intermediate, WARNING about Meltemi F5-7 in July-August)
3. Ionian: Lefkada → Ithaca → Kefalonia → Zakynthos (7 days, calm waters, green islands, excellent for families)

Section: "The Meltemi factor" — KEY difference from Croatia. Meltemi blows F5-7 from the north, mid-July through August in the Aegean. Saronic Gulf and Ionian are calmer. For beginners: avoid Cyclades in August without an experienced skipper.

Section: "When to go" — HTML table by month (May-Oct): air temp, water temp, Meltemi risk, crowd level, price tier. Recommend May-June or Sep-Oct.

Section: "What it costs" — Slightly cheaper than Croatia. Greece = best value-for-money in the Med. Food on islands is cheaper. Brief price table + link to cost guide: <a href="/articles/how-much-does-it-cost-to-charter-a-yacht">full cost breakdown</a>.

Section: "Practical tips" — bullet points:
- Documents: EU license or ICC (International Certificate of Competence)
- Marinas less developed than Croatia → more anchorages (cheaper!)
- Greek food: tavernas on the dock, €10-15 for lunch with wine
- Ferry connections allow starting charters from different ports
- Water: some islands have limited fresh water supply
- Connectivity: good on main islands, spotty on smaller ones

Closing (Inspirational, 1-2 paragraphs): warm and motivating.

FAQ:
- What is the best Greek island for first-time sailing?
- Is sailing in Greece safe for beginners?
- How much does a week sailing in Greece cost?
- What is the Meltemi wind and when does it blow?
- What should I pack for a sailing trip in Greece?

Key Facts:
- Charter from: €1,600/week
- Islands: 6,000+ (227 inhabited)
- Best for beginners: Saronic Gulf, Ionian
- Meltemi season: mid-July to August
- Water temperature: 21-26°C (Jun-Sep)
- Taverna meal: €10-15 per person
- Currency: EUR
- Popular bases: Athens (Lavrion), Lefkada, Kos`,
  },
]

// ---------------------------------------------------------------------------
// Generate one article
// ---------------------------------------------------------------------------

async function generateArticle(brief: Brief, articleList: string): Promise<string> {
  const label = brief.slug
  console.log(`\n📝 [${label}] Generating with Opus...`)

  // Build prompt
  const template = brief.voice === 'inspirational' ? INSPIRATIONAL_TEMPLATE : EXPERT_TEMPLATE
  const fullPrompt = template
    .replace('{content_brief}', brief.brief)
    .replace('{existing_articles}', articleList || '(no articles yet)')

  const userPrompt = `Category for this article: ${brief.category}

Output ONLY valid JSON with this exact structure:
{
  "title": "Article title",
  "slug": "url-friendly-slug",
  "excerpt": "1-2 sentence teaser (under 200 chars)",
  "metaTitle": "SEO title (max 60 chars)",
  "metaDescription": "SEO description (max 155 chars)",
  "answerCapsule": "40-60 word factual summary for AI search engines",
  "content": "Full article body as valid HTML. 1500-2500 words. Use <h2>, <h3>, <p>, <ul>, <table> tags. Include internal links as <a href=\\"/articles/slug\\">anchor text</a>.",
  "tags": ["tag1", "tag2", "tag3"],
  "faqItems": [{"q": "question", "a": "answer"}],
  "keyFacts": [{"label": "label", "value": "value"}]
}`

  // 1. Generate with Opus
  const genResponse = await anthropic.messages.create({
    model: GEN_MODEL,
    max_tokens: 8192,
    system: fullPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const genText = genResponse.content.find((b) => b.type === 'text')
  if (!genText || genText.type !== 'text') throw new Error(`[${label}] No text from Opus`)

  const jsonMatch = genText.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`[${label}] Failed to parse JSON from Opus`)

  const articleData = JSON.parse(jsonMatch[0])
  console.log(`✅ [${label}] Opus done: "${articleData.title}" (${articleData.content.length} chars)`)

  // 2. Humanize with Sonnet
  console.log(`🔄 [${label}] Humanizing with Sonnet...`)
  const humanizeResponse = await anthropic.messages.create({
    model: HUMANIZE_MODEL,
    max_tokens: 8192,
    system: HUMANIZER_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Rewrite this article draft following your editorial rules.
Preserve all factual information, the structure, and the SEO elements
(H2 headings, FAQ section, key facts, tables). Only change the style and language.
Preserve all HTML tags and links exactly.

ARTICLE:
${articleData.content}`,
      },
    ],
  })

  const humanText = humanizeResponse.content.find((b) => b.type === 'text')
  const humanizedContent =
    humanText && humanText.type === 'text' ? humanText.text : articleData.content
  console.log(`✅ [${label}] Humanized (${humanizedContent.length} chars)`)

  // 3. Calculate reading time
  const wordCount = humanizedContent.replace(/<[^>]*>/g, '').split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  // 4. Ensure unique slug
  let slug = brief.slug
  const existing = await prisma.article.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
    console.log(`⚠️  [${label}] Slug taken, using: ${slug}`)
  }

  // 5. Save to DB
  const article = await prisma.article.create({
    data: {
      title: articleData.title,
      slug,
      content: humanizedContent,
      excerpt: articleData.excerpt || null,
      metaTitle: articleData.metaTitle || null,
      metaDescription: articleData.metaDescription || null,
      answerCapsule: articleData.answerCapsule || null,
      category: brief.category as any,
      region: brief.region,
      tags: articleData.tags || [],
      faqItems: articleData.faqItems || null,
      keyFacts: articleData.keyFacts || null,
      status: 'published',
      publishedAt: new Date(),
      isEditorial: true,
      isFeatured: false,
      readingTime,
      difficulty: 'beginner',
      supplierType: 'charter',
      supplierId: null,
      destinationId: null,
    },
  })

  console.log(`🚀 [${label}] Published: /articles/${article.slug} (${readingTime} min read)`)
  return article.id
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== BOATTOMORROW Tier 1 Content Generation ===\n')

  // Load existing articles for interlinking
  const recentArticles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 30,
    select: { slug: true, title: true },
  })

  const articleList = recentArticles.map((a) => `- ${a.title} → /articles/${a.slug}`).join('\n')
  console.log(`Found ${recentArticles.length} existing articles for interlinking`)

  // Generate articles sequentially (to stay within rate limits)
  const ids: string[] = []
  for (const brief of BRIEFS) {
    try {
      const id = await generateArticle(brief, articleList)
      ids.push(id)
    } catch (err) {
      console.error(`❌ Failed to generate ${brief.slug}:`, err)
    }
  }

  console.log(`\n=== Done: ${ids.length}/${BRIEFS.length} articles generated and published ===`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
