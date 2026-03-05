/**
 * Generate Tier 2 editorial articles from content briefs.
 * Run: npx tsx scripts/generate-tier2.ts
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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (!process.env[key]) process.env[key] = val
}

import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const GEN_MODEL = 'claude-opus-4-6'
const HUMANIZE_MODEL = 'claude-sonnet-4-6'

// Prompt templates (identical to editorial route / tier1 script)

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
- Prefer specific over general.
- Use concrete details from the source material.
- Every paragraph should contain at least one concrete number, name, or sensory detail.
- Never use passive voice where active works.
- Prices in EUR, distances in nautical miles (NM), wind in Beaufort scale.
- British English for nautical terms (harbour, metre) but otherwise natural English.

STRUCTURE:
- The intro should drop the reader into a scene or a specific fact.
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
  difficulty: string
  brief: string
}

const BRIEFS: Brief[] = [
  {
    slug: 'yacht-vs-hotel-sailing-holiday-value',
    voice: 'inspirational',
    category: 'tips',
    region: null,
    difficulty: 'beginner',
    brief: `Yacht vs Hotel: Why Sailing Is the Best-Value Holiday You've Never Tried

Target reader: dreamer comparing holiday options.
Length: 2000-2500 words.
SEO Target: "yacht vs hotel holiday", "is sailing cheaper than hotel", "sailing holiday value"

Answer Capsule (use this exactly):
A sailing holiday for a group of 4-8 people often costs less per person than a comparable hotel stay — while covering multiple destinations instead of one. A week on a 40-foot yacht in Croatia averages €150-200 per person per day including accommodation, transport between islands, and kitchen facilities. Hotel equivalents in the same region start from €180-250 per person.

STRUCTURE:

Introduction (Inspirational, 3 paragraphs): Contrast two pictures of the same holiday. Option A: hotel pool on one island. Option B: wake up in a new cove every morning, jump in the water from the stern, lunch in a village only reachable by sea. Option B costs the same or less.

h2: The numbers: yacht vs hotel, side by side
Main comparison table — a week for 6 people:
<table><thead><tr><th>Expense</th><th>4★ Hotel (Croatia)</th><th>40ft Yacht (skippered)</th></tr></thead><tbody><tr><td>Accommodation</td><td>€1,400-2,100/person</td><td>€500-800/person</td></tr><tr><td>Skipper</td><td>—</td><td>€175-235/person</td></tr><tr><td>Transport between locations</td><td>€300-500/person (ferries, taxis)</td><td>€0 (yacht = transport)</td></tr><tr><td>Food</td><td>€350-500/person</td><td>€200-350/person</td></tr><tr><td>Marinas/fuel</td><td>—</td><td>€50-100/person</td></tr><tr><td>Activities</td><td>€100-200/person</td><td>€0 (snorkelling, kayaking free)</td></tr><tr><td><strong>TOTAL</strong></td><td><strong>€2,150-3,300/person</strong></td><td><strong>€925-1,485/person</strong></td></tr></tbody></table>
Note: Croatia, June-September 2026. Greece is 10-15% cheaper in both columns. At 6 people, yacht almost always cheaper. At 2, comparable. Bigger group (up to 8-10) = better value.

h2: What you get for your money (beyond the price)
5 subsections (h3), each 2-3 sentences:
- Number of places: hotel = 1 island. Yacht = 5-7 islands per week.
- Privacy: hotel = strangers by the pool. Yacht = anchorage in a cove where you're alone.
- Flexibility: hotel = breakfast schedule, checkout at 11. Yacht = wake up, jump in, sail wherever.
- Food: hotel = hotel restaurant + taxi to town. Yacht = fish market, cooking on board, konoba accessible only by sea.
- Memories per person: hotel = pool photo like everyone else. Yacht = sunset from cockpit in a bay not on TripAdvisor.

h2: When a hotel wins (let's be honest)
Honest block:
- Solo or couple (yacht doesn't pay off)
- Need specific comfort: 24/7 AC, large bathroom, room service
- Very small children (under 3-4) — yacht requires constant supervision
- You want to not move — lie by the pool for a week
- Bad motion sickness (though at anchor there's no rocking)

h2: How to try sailing without committing to a full week
- Day charter (€150-400 per group, 1 day)
- Weekend charter (Fri-Sun, 2 nights, off-season)
- Flotilla (group sailing with lead boat)

Closing (Inspirational, 2 paragraphs): Comparing a yacht to a hotel is like comparing a road trip to a flight. Both get you from A to B. But one is a journey. Link to <a href="/start">Start Here</a>.

FAQ:
- Is chartering a yacht cheaper than staying in a hotel?
- How many people do you need to make a yacht charter worth it?
- What's included in a yacht charter price?
- Can you charter a yacht for just a weekend?
- Is a sailing holiday good for families with kids?

Key Facts:
- Yacht cost/person/day (6 ppl): €150-210
- Hotel cost/person/day (4★, Croatia): €300-470
- Islands per week (yacht): 5-7
- Islands per week (hotel): 1
- Min group for cost efficiency: 4 people
- Most affordable region: Turkey (from €1,400/week)
- Best value period: May and October
- Break-even group size: 3-4 people`,
  },
  {
    slug: 'skipper-or-bareboat-charter-guide',
    voice: 'expert',
    category: 'tips',
    region: null,
    difficulty: 'beginner',
    brief: `Skipper or Bareboat: Which Charter Type Is Right for You?

Target reader: someone choosing their next charter format.
Length: 2000-2500 words.
SEO Target: "skippered vs bareboat charter", "do I need a skipper", "bareboat charter requirements", "types of yacht charter"

Answer Capsule (use this exactly):
Bareboat charters suit sailors with a valid licence (ICC, RYA Day Skipper, or equivalent) who want full independence. Skippered charters add a professional captain for €150-200 per day, ideal for first-timers or groups wanting to relax. Crewed charters include a skipper plus cook/hostess, while flotillas offer guided group sailing with individual boats.

STRUCTURE:

Introduction (3 paragraphs): Charter type is the most important booking decision. It determines budget, freedom level, responsibility, and how relaxed you'll be.

h2: The four charter types explained
4 subsections (h3):

h3: Bareboat — full freedom
Requirements: licence (ICC, RYA Day Skipper, IYT Bareboat Skipper). Price: yacht only €1,600-5,000/week. For: experienced sailors. Pros: freedom, savings, privacy. Cons: responsibility for navigation, mooring, weather decisions.

h3: Skippered — freedom + peace of mind
No requirements. Price: yacht + €150-200/day skipper (€2,650-6,400/week total). For: first charter, groups, families. Pros: relax from minute one, local knowledge. Cons: stranger on board 24/7 (skipper has own cabin), less privacy. Note: skipper is not a guide or cook.

h3: Crewed — yacht as hotel
Skipper + hostess/cook. Price: €5,000-15,000/week all-inclusive. For: premium experience, celebrations. Pros: restaurant-level food on board, zero effort. Cons: significantly more expensive, 2 strangers on board.

h3: Flotilla — for social beginners
5-15 yachts, same route, lead boat coordinates. Price: €2,000-4,500/week. For: couples wanting to meet people, families (kids find friends). Pros: social atmosphere, support. Cons: less freedom, fixed route, fixed dates.

h2: Comparison table
Include this HTML table:
<table><thead><tr><th>Criteria</th><th>Bareboat</th><th>Skippered</th><th>Crewed</th><th>Flotilla</th></tr></thead><tbody><tr><td>Licence needed?</td><td>Yes</td><td>No</td><td>No</td><td>Depends</td></tr><tr><td>Cost (40ft, week)</td><td>€2,000-4,000</td><td>€3,000-5,500</td><td>€5,000-12,000</td><td>€2,500-4,500</td></tr><tr><td>Route freedom</td><td>Full</td><td>Full</td><td>Full</td><td>Limited</td></tr><tr><td>Privacy</td><td>Maximum</td><td>High (-1 cabin)</td><td>Medium (-1-2 cabins)</td><td>High</td></tr><tr><td>Stress level</td><td>High</td><td>Minimal</td><td>Zero</td><td>Minimal</td></tr><tr><td>Best for first time?</td><td>No</td><td>Yes ★</td><td>Yes (if budget)</td><td>Yes</td></tr></tbody></table>

h2: How to decide: a quick flowchart
Text decision tree: Have licence + 3+ charters? → Bareboat. No licence / first time? → Want full service with food? → Crewed. Want freedom without stress? → Skippered. Want to meet people? → Flotilla.

h2: The skipper question: what to expect
Practical tips: communication (captain, not servant), skipper cabin (usually forward, smallest), tips (€100-200/week), learning from skipper (yes, most enjoy teaching), feeding the skipper (unwritten rule).

h2: Licences: what counts and where
Brief table:
<table><thead><tr><th>Licence</th><th>Where recognised</th><th>How to get</th></tr></thead><tbody><tr><td>ICC</td><td>Most Mediterranean</td><td>National federation</td></tr><tr><td>RYA Day Skipper</td><td>Widely</td><td>5-day course</td></tr><tr><td>IYT Bareboat Skipper</td><td>Widely</td><td>5-7 day course</td></tr><tr><td>Croatian B cat</td><td>Croatia</td><td>Exam in Croatia</td></tr></tbody></table>
Link to <a href="/articles/rya-vs-iyt-sailing-certificate-guide">RYA vs IYT detailed comparison</a>.

Closing: No wrong choice. Many start skippered, go bareboat after a year, buy their own yacht in five. Each format is a step.

FAQ:
- Do I need a sailing licence to charter a yacht?
- How much does a skipper cost per day?
- Is a skippered charter worth the extra money?
- Can I learn to sail during a skippered charter?
- What is a flotilla sailing holiday?

Key Facts:
- Skipper daily rate: €150-200
- Bareboat licence: ICC, RYA Day Skipper, or equivalent
- Crewed premium vs bareboat: +60-150%
- Flotilla group size: 5-15 boats
- Skipper tip: €100-200/week
- Most popular for first-timers: skippered
- Bareboat min experience: 2-3 prior charters
- Available worldwide: all four in Med, Caribbean, SE Asia`,
  },
  {
    slug: 'split-to-dubrovnik-7-day-sailing-route',
    voice: 'inspirational',
    category: 'route',
    region: 'Mediterranean',
    difficulty: 'intermediate',
    brief: `The 7-Day Split to Dubrovnik Route: Day by Day

Target reader: someone planning a specific charter in Croatia.
Length: 2500-3000 words.
SEO Target: "Split to Dubrovnik sailing route", "Croatia sailing itinerary 7 days", "Dalmatian coast sailing route"

Answer Capsule (use this exactly):
The Split to Dubrovnik route covers approximately 120 nautical miles along Croatia's southern Dalmatian coast over seven days. Key stops include Hvar, Vis, Korčula, and Mljet National Park. Daily passages average 15-25 NM (2-4 hours of sailing). This one-way route requires a relocation fee but rewards with Croatia's most dramatic coastline and least-crowded islands.

VOICE: Inspirational for intro and place descriptions, Expert for distances, prices, and practical tips.

STRUCTURE:

Introduction (Inspirational, 2 paragraphs): The route local skippers consider Croatia's best. Not the shortest or easiest, but the most beautiful. You start in busy Split and finish under the walls of Dubrovnik, with a week of islands, coves, and villages unchanged for decades.

h2: Route overview
Route: Split → Hvar → Vis → Korčula → Lastovo → Mljet → Dubrovnik
Include overview table:
<table><thead><tr><th>Detail</th><th>Value</th></tr></thead><tbody><tr><td>Total distance</td><td>~120 NM</td></tr><tr><td>Daily average</td><td>15-25 NM (2-4 hours)</td></tr><tr><td>Recommended yacht</td><td>38-45ft, mono or cat</td></tr><tr><td>Charter type</td><td>Bareboat or skippered</td></tr><tr><td>Difficulty</td><td>Intermediate (open crossings to Vis, Lastovo)</td></tr><tr><td>Best period</td><td>May-June, September-October</td></tr><tr><td>One-way fee</td><td>€200-500</td></tr></tbody></table>

h2: Day by day
Each day as h3 with consistent structure:

Day 1 — Split → Hvar Town (22 NM): Yacht check-in at ACI Split or Marina Kaštela. Provisions at Konzum. Depart after lunch. 3-4 hours via Split Channel along Brač. Arrive Hvar before 14:00 in summer (marina fills). Alternative: anchor at Pakleni Islands (Palmižana). Dinner in old town, sunset from Fortica fortress. Marina: €80-150/night; Palmižana: free anchor.

Day 2 — Hvar → Vis Town (25 NM): 3.5-4 hours, open stretch, possible waves. Depart early (before maestral). Vis: most remote inhabited island, military base until 1989, authentic fishing atmosphere. Berth: Vis Town waterfront (stern-to, free with restaurant purchase). Dinner at konoba Jastožera (lobster from tank). Option: Stiniva bay if weather allows (Croatia's most beautiful beach, water access only).

Day 3 — Vis: Blue Cave + Komiža (8 NM): Morning to Biševo, Blue Cave (Modra Špilja, €15/person, arrive before 10 AM). Komiža: fishing town on west side. Try hrapoćuša (local fish stew). Walk to Komuna fortress. Overnight Komiža or south Vis bay.

Day 4 — Vis → Korčula Town (30 NM): Longest passage. Depart 7-8 AM. 4-5 hours. Open water between Vis and Korčula. If forecast >F5, consider alternative via Hvar. Korčula Town: mini-Dubrovnik, medieval peninsula. Impressive sea approach. ACI Marina (€60-120/night) or anchor in Luka bay. Evening walk in old town, dinner with Pelješac view.

Day 5 — Korčula → Lastovo (25 NM): 3-4 hours, open crossing. Lastovo: most remote island, population ~800, nature park, almost no tourists. Anchor in Skrivena Luka (Hidden Harbour). Dinner at only restaurant in Zaklopatica. Zero light pollution — spectacular night sky. Warning: limited infrastructure, fill water and fuel in Korčula.

Day 6 — Lastovo → Mljet, Polače (20 NM): 3 hours. Mljet national park: two salt lakes (Veliko and Malo Jezero), Benedictine monastery on island in the lake (12th century). Berth: Polače with Roman ruins, park buoys (€30-40/night). Rent bikes (€5/hour), cycle both lakes, swim in Veliko Jezero (warmer than sea). Alternative: Okuklje bay.

Day 7 — Mljet → Dubrovnik (20 NM): Last passage. 3 hours along Pelješac peninsula. ACI Marina Dubrovnik (Komolac, 20 min bus to old town). Yacht return usually by 9 AM next day. Afternoon: Dubrovnik walls, Stradun, Srđ cable car. Farewell dinner.

h2: Practical planning
Yacht: 40-42ft mono for 4-6, catamaran 42-45ft for 6-8. One-way fee: €200-500.
Budget (6 people, skippered): yacht €2,500-4,000 + skipper €1,050-1,400 + marinas €200-400 + fuel €100-200 + provisions €1,200-1,800 + one-way €300. Total: €5,350-8,100 or €125-190/person/day.
Provisioning: water 50L+, wine (Plavac Mali, Pošip €5-8/bottle), basics for 3-4 days. Restock in Korčula.
Weather: check Windy.com and Prognoza.hr daily. Bora (N/NE) can cancel crossings. Jugo (SE) brings rain and swell.
Link to <a href="/articles/sailing-in-croatia-first-timers-guide">Croatia sailing guide</a> and <a href="/articles/how-much-does-it-cost-to-charter-a-yacht">cost guide</a>.

h2: What if the weather changes?
Plan B for each difficult crossing: Vis (F6+ = stay another day), Lastovo (skip, go Korčula → Mljet 15 NM sheltered), General (skipper decides; one extra day in a beautiful place beats 5 hours in a storm).

FAQ:
- How long does it take to sail from Split to Dubrovnik?
- Is the Split to Dubrovnik route good for beginners?
- How much does a one-way charter fee cost in Croatia?
- What is the best month to sail from Split to Dubrovnik?
- Can you sail from Split to Dubrovnik in less than 7 days?

Key Facts:
- Total distance: ~120 NM
- Daily average: 15-25 NM
- Sailing hours/day: 2-4
- One-way fee: €200-500
- Key stops: Hvar, Vis, Korčula, Lastovo, Mljet
- Recommended boat: 38-45ft
- Difficulty: Intermediate
- Budget/person/day (6 ppl, skippered): €125-190`,
  },
  {
    slug: 'athens-to-mykonos-sailing-route-7-days',
    voice: 'inspirational',
    category: 'route',
    region: 'Mediterranean',
    difficulty: 'intermediate',
    brief: `Athens to Mykonos: A Week Under Sail

Target reader: someone planning Greece charter.
Length: 2500-3000 words.
SEO Target: "Athens to Mykonos sailing", "Cyclades sailing route", "Greece sailing itinerary"

Answer Capsule (use this exactly):
The Athens to Mykonos route crosses the Saronic Gulf and western Cyclades over seven days, covering approximately 130 nautical miles. The itinerary combines sheltered Saronic stops with Cycladic islands Kea, Kythnos, Syros, and Mykonos. Meltemi winds from July through August make this route intermediate-level; May-June and September offer gentler conditions.

VOICE: Inspirational for intro and place descriptions, Expert for distances, weather, and practical sections.

STRUCTURE:

Introduction (Inspirational, 2 paragraphs): Two worlds in one week. Start in green, calm Saronic Gulf waters with Athens on the horizon. By day four: white Cycladic cubes, turquoise water, wind filling the sails.

h2: Route overview
Athens (Lavrion) → Kea → Kythnos → Syros → Mykonos
Or gentle version: Athens (Alimos) → Aegina → Poros → Hydra → Kythnos → Syros → Mykonos

Include overview table:
<table><thead><tr><th>Detail</th><th>Value</th></tr></thead><tbody><tr><td>Total distance</td><td>~130 NM (direct) / ~150 NM (via Saronic)</td></tr><tr><td>Daily average</td><td>15-30 NM</td></tr><tr><td>Wind</td><td>Meltemi (Jul-Aug): F4-7 N/NE. Off-season: F2-4</td></tr><tr><td>Recommended yacht</td><td>40-45ft, catamaran preferred</td></tr><tr><td>Charter type</td><td>Skippered recommended (Meltemi!)</td></tr><tr><td>Difficulty</td><td>Intermediate-high (season dependent)</td></tr><tr><td>Best period</td><td>May-June, September</td></tr><tr><td>One-way fee</td><td>€300-600</td></tr></tbody></table>

h2: Day by day
Day 1 — Athens (Lavrion) → Kea, Korissia (15 NM): Lavrion closer to Cyclades (recommended). Kea: first Cycladic island but not typical architecture. Quiet, green. Anchor in Vourkari bay. Dinner at Vourkari — best fish tavernas in Greece.

Day 2 — Kea → Kythnos, Loutra (15 NM): Short hop. Kythnos: hot thermal springs flowing into the sea at Loutra. Anchor or buoy. Chora village (4 km, taxi or walk) — quiet white streets without tourists. Fresh fish dinner €10-15.

Day 3 — Kythnos → Syros, Ermoupoli (20 NM): Open water crossing, first serious Meltemi section. Ermoupoli: capital of Cyclades, neoclassical architecture, few tourists. Syros marina (one of best in Cyclades). Evening walk, Miaouli square, Apollo theatre (mini La Scala). Dinner at Mazi or Allou Yialou.

Day 4 — Syros rest day or Delos excursion: Explore Ano Syros (medieval hilltop town) or day trip to Delos (25 NM each way — long day). Delos: sacred island, UNESCO site, no overnight stays. Alternative: buoys at Delos, 3-4 hours ashore, overnight Mykonos or return to Syros.

Day 5 — Syros → Mykonos (25 NM): Potential Meltemi crossing. At F6+, depart at dawn (5-6 AM, wind lighter in morning). Mykonos: new port Tourlos or anchor at Ornos bay (south shore, Meltemi shelter).

Day 6 — Mykonos full day: Little Venice, windmills, Matoyianni street. Beaches: Psarou (premium), Paradise (party), Agios Sostis (quiet). Dinner: Kiki's Tavern (no electricity, no reservations, worth the queue) or Niko's (old town classic).

Day 7 — Yacht return by 9 AM. Return to Athens: fast ferry 2.5 hours €40-60 or flight 30 min €50-100.

h2: The Meltemi factor
Critical section for Greece: Northern wind, July-August, F4-7 (sometimes F8). Blows daytime, calms at night. South passages comfortable (downwind). North passages difficult. Strategy: depart early morning, shelter on south shores, have plan B. For beginners: choose May-June or September.

h2: Practical planning
Yacht: catamaran preferred (stability in waves). Budget (6 people, skippered): yacht €2,200-4,500 + skipper €1,050-1,400 + marinas €100-300 + fuel €80-150 + provisions €1,000-1,500 + one-way €400. Total: €4,830-7,750 or €115-185/person/day.
Food cheaper than Croatia. Taverna €10-15/person.
Link to <a href="/articles/sailing-in-greece-first-timers-guide">Greece sailing guide</a> and <a href="/articles/how-much-does-it-cost-to-charter-a-yacht">cost guide</a>.

FAQ:
- Can you sail from Athens to Mykonos in a week?
- Is the Meltemi wind dangerous for sailing?
- What is the best month to sail the Cyclades?
- How much does it cost to charter a yacht from Athens to Mykonos?
- Should I choose a catamaran or monohull for the Cyclades?

Key Facts:
- Total distance: ~130 NM
- Sailing days: 5 (+ 2 rest days)
- Meltemi season: mid-July to August
- One-way fee: €300-600
- Key stops: Kea, Kythnos, Syros, Delos, Mykonos
- Budget/person/day: €115-185
- Recommended boat: catamaran 40-45ft
- Ferry Mykonos → Athens: 2.5 hours, €40-60`,
  },
  {
    slug: 'rya-vs-iyt-sailing-certificate-guide',
    voice: 'expert',
    category: 'learning',
    region: null,
    difficulty: 'beginner',
    brief: `RYA vs IYT: Which Sailing Certificate Do You Need?

Target reader: someone who wants to get a sailing licence.
Length: 2000-2500 words.
SEO Target: "RYA vs IYT", "sailing licence for charter", "RYA Day Skipper", "IYT bareboat skipper"

Answer Capsule (use this exactly):
RYA (Royal Yachting Association) and IYT (International Yacht Training) are the two most widely recognised sailing certification systems worldwide. RYA Day Skipper and IYT Bareboat Skipper both qualify you for chartering in most Mediterranean and Caribbean destinations. RYA is more established in Europe; IYT offers greater flexibility in course locations and faster certification paths.

STRUCTURE:

Introduction (3 paragraphs): You've decided to get certified. First question: which system? RYA and IYT are the two major global systems. Both recognised almost everywhere. Both qualify for bareboat charter. Difference is in the details.

h2: The quick answer
Europe-based, planning Mediterranean? → RYA Day Skipper (gold standard).
Outside UK/Europe, want exotic course location (Thailand, Caribbean)? → IYT Bareboat Skipper.
Not sure you want a licence at all? → ICC through national federation.

h2: RYA system — the full pathway
Include this table:
<table><thead><tr><th>Level</th><th>Name</th><th>What it gives</th><th>Duration</th><th>Cost</th></tr></thead><tbody><tr><td>1</td><td>Competent Crew</td><td>Crew member</td><td>5 days</td><td>€700-1,200</td></tr><tr><td>2</td><td>Day Skipper (theory)</td><td>Theory base</td><td>40 hours (online or class)</td><td>€300-500</td></tr><tr><td>3</td><td>Day Skipper (practical)</td><td>Daytime, familiar waters</td><td>5 days</td><td>€800-1,500</td></tr><tr><td>4</td><td>Coastal Skipper</td><td>Coastal, night passages</td><td>5 days</td><td>€1,000-1,800</td></tr><tr><td>5</td><td>Yachtmaster Offshore</td><td>Professional level</td><td>Exam</td><td>€500-800</td></tr><tr><td>6</td><td>Yachtmaster Ocean</td><td>Ocean crossings</td><td>Exam + astro theory</td><td>€600-1,000</td></tr></tbody></table>
For chartering: Day Skipper practical (level 3) is sufficient. Most people stop here.
Where: UK, Croatia, Greece, Turkey, Gibraltar, Canaries, Thailand.
Pros: maximum recognition, structured programme, huge school network, logbook system.
Cons: more expensive, theory separate from practical (two courses needed).

h2: IYT system — the alternative
Include table:
<table><thead><tr><th>Level</th><th>Name</th><th>What it gives</th><th>Duration</th><th>Cost</th></tr></thead><tbody><tr><td>1</td><td>Basic Crew</td><td>Crew member</td><td>3-5 days</td><td>€500-900</td></tr><tr><td>2</td><td>Bareboat Skipper</td><td>Chartering</td><td>5-7 days (theory+practical together)</td><td>€800-1,400</td></tr><tr><td>3</td><td>Coastal Captain</td><td>Coastal sailing</td><td>7-10 days</td><td>€1,200-2,000</td></tr><tr><td>4</td><td>Offshore Captain</td><td>Offshore passages</td><td>Exam + experience</td><td>€800-1,500</td></tr><tr><td>5</td><td>Master of Yachts</td><td>Professional (commercial)</td><td>Exam + experience</td><td>€1,000-2,000</td></tr></tbody></table>
For chartering: Bareboat Skipper (level 2). Key difference: theory and practical integrated in one 5-7 day course.
Where: wider geography — Thailand, Croatia, Greece, Turkey, BVI, Seychelles, Australia, South Africa.
Pros: faster, cheaper, exotic locations, integrated theory+practical.
Cons: less known in UK, some charter companies may not recognize immediately.

h2: Head-to-head comparison
Include table:
<table><thead><tr><th>Criteria</th><th>RYA Day Skipper</th><th>IYT Bareboat Skipper</th></tr></thead><tbody><tr><td>Total duration</td><td>~10 days (theory + practical)</td><td>5-7 days (all together)</td></tr><tr><td>Total cost</td><td>€1,100-2,000</td><td>€800-1,400</td></tr><tr><td>Europe recognition</td><td>Excellent</td><td>Good</td></tr><tr><td>Non-Europe recognition</td><td>Good</td><td>Excellent</td></tr><tr><td>Online theory</td><td>Yes (RYA Interactive)</td><td>Depends on school</td></tr><tr><td>Includes ICC</td><td>No (separate, €50-100)</td><td>Yes (often included)</td></tr><tr><td>Minimum age</td><td>16</td><td>18</td></tr><tr><td>Logbook required</td><td>Yes (strict)</td><td>Yes (less formal)</td></tr></tbody></table>

h2: What about ICC?
International Certificate of Competence — minimal certificate many countries require. Not a full licence — it's proof of basic competence. How to get: via RYA (automatic if you have Day Skipper, €50-100), national federation (1-day exam, €100-300), or IYT (often included). Where needed: Croatia (mandatory), Spain, Italy, France. Greece: formally needed, in practice RYA/IYT accepted. BVI: not needed.

h2: Which countries accept what
Include table:
<table><thead><tr><th>Country</th><th>RYA Day Skipper</th><th>IYT Bareboat</th><th>ICC</th><th>Own licence</th></tr></thead><tbody><tr><td>Croatia</td><td>✓</td><td>✓</td><td>Mandatory</td><td>Croatian B cat</td></tr><tr><td>Greece</td><td>✓</td><td>✓</td><td>Recommended</td><td>—</td></tr><tr><td>Turkey</td><td>✓</td><td>✓</td><td>Recommended</td><td>—</td></tr><tr><td>Italy</td><td>✓</td><td>✓</td><td>Mandatory</td><td>Patente nautica</td></tr><tr><td>Spain</td><td>✓</td><td>✓</td><td>Mandatory</td><td>PER/PNB</td></tr><tr><td>France</td><td>✓</td><td>✓</td><td>Mandatory</td><td>Permis côtier</td></tr><tr><td>BVI</td><td>✓</td><td>✓</td><td>Not needed</td><td>—</td></tr><tr><td>Thailand</td><td>✓</td><td>✓</td><td>Not needed</td><td>—</td></tr></tbody></table>

h2: My recommendation
Direct advice by situation: UK resident → RYA. European, Mediterranean → RYA Day Skipper. Want course as holiday → IYT in exotic location. Budget limited → IYT. Professional career → RYA to Yachtmaster. Annual bareboat only → either + ICC.

Closing: Don't overthink the system choice. Both work. The important thing is to go and do it. A week on a course in Croatia or Greece is training, holiday, and a new habit.
Link to <a href="/articles/skipper-or-bareboat-charter-guide">charter types guide</a>.

FAQ:
- What sailing licence do I need to charter a yacht?
- Is RYA or IYT better for Mediterranean sailing?
- How long does it take to get a sailing certificate?
- Do I need an ICC to charter in Croatia?
- Can I get a sailing licence in one week?

Key Facts:
- RYA Day Skipper duration: ~10 days
- IYT Bareboat Skipper: 5-7 days
- RYA cost: €1,100-2,000
- IYT cost: €800-1,400
- ICC cost: €50-300
- Min age RYA: 16
- Min age IYT: 18
- Countries requiring ICC: Croatia, Italy, Spain, France`,
  },
]

// ---------------------------------------------------------------------------
// Generate one article
// ---------------------------------------------------------------------------

async function generateArticle(brief: Brief, articleList: string): Promise<string> {
  const label = brief.slug
  console.log(`\n📝 [${label}] Generating with Opus...`)

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

  const wordCount = humanizedContent.replace(/<[^>]*>/g, '').split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  let slug = brief.slug
  const existing = await prisma.article.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
    console.log(`⚠️  [${label}] Slug taken, using: ${slug}`)
  }

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
      difficulty: brief.difficulty,
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
  console.log('=== BOATTOMORROW Tier 2 Content Generation ===\n')

  const recentArticles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 30,
    select: { slug: true, title: true },
  })

  const articleList = recentArticles.map((a) => `- ${a.title} → /articles/${a.slug}`).join('\n')
  console.log(`Found ${recentArticles.length} existing articles for interlinking\n`)

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
