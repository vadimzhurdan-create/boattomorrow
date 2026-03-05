import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropic, ARTICLE_GEN_MODEL } from '@/lib/anthropic'
import { slugify } from '@/lib/utils'
import { HUMANIZER_SYSTEM_PROMPT } from '@/lib/prompts/humanizer'

const HUMANIZE_MODEL = 'claude-sonnet-4-6'

// ---------------------------------------------------------------------------
// Full prompt templates from BOATTOMORROW_PROMPT_TEMPLATES.md
// Placeholders {content_brief} and {existing_articles} are replaced at runtime
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

function buildPrompt(template: string, brief: string, articleList: string): string {
  return template
    .replace('{content_brief}', brief)
    .replace('{existing_articles}', articleList || '(no articles yet)')
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { brief, voice, category, destinationId } = body

    if (!brief || !voice || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Load recent published articles for interlinking
    const recentArticles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      select: { slug: true, title: true },
    })

    const articleList = recentArticles
      .map((a) => `- ${a.title} → /articles/${a.slug}`)
      .join('\n')

    // 2. Build full prompt from template with placeholders replaced
    const template = voice === 'inspirational' ? INSPIRATIONAL_TEMPLATE : EXPERT_TEMPLATE
    const fullPrompt = buildPrompt(template, brief, articleList)

    // 3. User message — JSON output spec (structure requirements are already in the system prompt)
    const userPrompt = `Category for this article: ${category}

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

    // 4. Generate with Opus
    const anthropic = getAnthropic()
    const genResponse = await anthropic.messages.create({
      model: ARTICLE_GEN_MODEL,
      max_tokens: 8192,
      system: fullPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const genText = genResponse.content.find((b) => b.type === 'text')
    if (!genText || genText.type !== 'text') {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 500 })
    }

    // Parse JSON from response
    const jsonMatch = genText.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 })
    }

    const articleData = JSON.parse(jsonMatch[0])

    // 5. Humanize content with Sonnet (using shared HUMANIZER_SYSTEM_PROMPT)
    const humanizeResponse = await anthropic.messages.create({
      model: HUMANIZE_MODEL,
      max_tokens: 8192,
      system: HUMANIZER_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Rewrite this article draft following your editorial rules.
Preserve all factual information, the structure, and the SEO elements
(H2 headings, FAQ section, key facts). Only change the style and language.

ARTICLE:
${articleData.content}`,
        },
      ],
    })

    const humanText = humanizeResponse.content.find((b) => b.type === 'text')
    const humanizedContent = humanText && humanText.type === 'text' ? humanText.text : articleData.content

    // Calculate reading time
    const wordCount = humanizedContent.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    // 6. Ensure unique slug
    let slug = slugify(articleData.slug || articleData.title)
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Get destination region if specified
    let region: string | undefined
    if (destinationId) {
      const dest = await prisma.destination.findUnique({
        where: { id: destinationId },
        select: { region: true },
      })
      region = dest?.region || undefined
    }

    // 7. Create article as editorial draft
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug,
        content: humanizedContent,
        excerpt: articleData.excerpt || null,
        metaTitle: articleData.metaTitle || null,
        metaDescription: articleData.metaDescription || null,
        answerCapsule: articleData.answerCapsule || null,
        category: category as any,
        region: region || null,
        tags: articleData.tags || [],
        faqItems: articleData.faqItems || null,
        keyFacts: articleData.keyFacts || null,
        status: 'draft',
        isEditorial: true,
        readingTime,
        supplierType: 'charter', // default type for editorial
        supplierId: null,
        destinationId: destinationId || null,
      },
    })

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Editorial generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    )
  }
}
