import { QuizConfig } from './types'

export const manufacturerArticleQuiz: QuizConfig = {
  supplierType: 'manufacturer',
  quizType: 'article',
  steps: [
    {
      id: 'contentType',
      question: 'What type of content would you like to create?',
      type: 'choice',
      options: ['Yacht review', 'Buying guide', 'Gear & Technology'],
      required: true,
    },
    {
      id: 'modelName',
      question: 'Which yacht model or category is this about?',
      type: 'text',
      placeholder: 'e.g., Jeanneau Sun Odyssey 440',
      required: true,
    },
    {
      id: 'targetAudience',
      question: 'Who is this yacht for — experience level, goals, regions?',
      type: 'text',
      placeholder: 'Describe the ideal buyer...',
      required: true,
    },
    {
      id: 'keyFeatures',
      question: 'Key technical features and advantages?',
      type: 'text',
      placeholder: 'List the standout features...',
      required: true,
    },
    {
      id: 'competitiveEdge',
      question: 'What sets it apart from competitors?',
      type: 'text',
      placeholder: 'Unique selling points...',
      required: true,
    },
    {
      id: 'customerStories',
      question: 'Any real customer stories or case studies?',
      type: 'text',
      placeholder: 'Share real experiences...',
    },
    {
      id: 'pricing',
      question: 'Price range and what is included?',
      type: 'text',
      placeholder: 'Starting from..., includes...',
    },
    {
      id: 'photos',
      question: 'Upload photos of the yacht',
      type: 'upload',
      required: false,
    },
  ],
  systemPrompt: `You are a senior editor at BOATTOMORROW, a sailing and yachting content platform.

Your editorial voice references: Yachting World boat tests, Yachting Monthly gear reviews, Outside Magazine.
You write in British-inflected international English.
You are friendly, intelligent, modern, and explanatory — never promotional.

Voice rules:
- Write like a knowledgeable friend who sails — curious, warm, direct, and always worth reading.
- Technical but readable. Concrete benefits over spec-sheet language.
- Be specific: "the twin-rudder setup gives lighter helm feel above 15 knots" beats "excellent handling."
- Active voice as default. Vary rhythm. Short sentences have power.
- Honest assessments — who should buy this, who shouldn't.
- Translate technical terms briefly in-context for non-expert readers.

Strictly avoid:
- "World-class", "state-of-the-art", "unparalleled", "revolutionary"
- Promotional language, superlatives without evidence
- Filler transitions, exclamation marks
- Marketing copy dressed up as editorial

STYLE RULES (critical for natural voice):
- Never use em dashes (--)
- Never use: delve, tapestry, realm, pivotal, crucial, comprehensive, leverage, utilize, furthermore, moreover, additionally, in conclusion, seamless, transformative, groundbreaking, beacon, vibrant, testament, meticulous, intricate
- Never open a section with "When it comes to" or "In today's world"
- Vary sentence length. Mix short and long sentences. Two-sentence paragraphs are fine.
- Prefer specific facts over general claims.
- Write in the register of Yachting World or Yachting Monthly, not a PR release.

AUTHENTICITY REQUIREMENTS:
The supplier has given you specific, first-hand knowledge. Use it.
1. Reference the supplier's own experience at least once.
2. Include at least one specific technical detail that wouldn't appear in a generic review.
3. Include at least one honest assessment: who this is for and who should look elsewhere.
4. If the supplier mentioned customer stories, weave them in naturally.

If the supplier's source material is in a language other than English, translate faithfully, then naturalise into fluent English editorial prose. Preserve genuine technical knowledge; discard marketing language. Do not invent facts the supplier did not provide.

Numbers: lengths in metres (feet in brackets); displacement in tonnes; draft in metres; sail area in m².`,

  generatePrompt: (answers, imageUrls) => {
    const contentTypeMap: Record<string, string> = {
      'Yacht review': 'boat',
      'Buying guide': 'tips',
      'Gear & Technology': 'gear',
    }
    const category = contentTypeMap[answers.contentType] || 'boat'

    const structureGuide = category === 'boat'
      ? `Structure (800–1,200 words):
- Opening: who this boat is for, in one sentence
- Design and construction: what's notable, not a spec sheet
- On the water: how it actually sails
- Living aboard: interior, ergonomics, practical use
- The verdict: honest summary — who should and shouldn't consider it`
      : `Structure (800–1,200 words):
- Opening: a specific, useful insight that hooks the reader
- 4–6 sections with H2 headings, each delivering a concrete point
- Closing: one honest, memorable takeaway`

    return `Transform this manufacturer/distributor's raw quiz answers into a polished BOATTOMORROW editorial article for the "${category}" category.

Supplier's raw answers:
${JSON.stringify(answers, null, 2)}

Photos provided: ${imageUrls.length}

${structureGuide}

GEO/AEO requirements:
- answerCapsule: Write a 40–60 word paragraph that directly answers the main question of the article. This sits after the H1 and before the first section. AI systems extract this for citation. Be factual, specific, and self-contained.
- In the article content, after all main sections, add a "## Frequently Asked Questions" section with 4–5 Q&A pairs. Questions should be phrased as a user would ask in ChatGPT or Perplexity. Answers: 2–3 sentences, self-contained.
- faqItems: Extract the same FAQ pairs as a JSON array of {q, a} objects.
- keyFacts: Generate 6–8 key facts as [{label, value}] pairs relevant to the category.

Output requirements:
- title: compelling H1, max 60 characters, includes model/topic keyword
- slug: lowercase, hyphenated, Latin characters only
- answerCapsule: 40–60 word direct answer (plain text, no markdown)
- content: full Markdown article body following the structure above, including FAQ section. Include a one-sentence attribution to the supplier.
- excerpt: 1–2 sentence hook for article cards (max 200 chars)
- metaTitle: SEO title, max 60 characters
- metaDescription: SEO description, max 155 characters
- tags: exactly 5 relevant tags
- category: "${category}"
- region: geographic region if applicable, or null
- keyFacts: array of 6–8 {label, value} pairs
- faqItems: array of 4–5 {q, a} pairs matching the FAQ in content
- bylineText: one sentence like "Based on insights from [Company Name], specialists in [type]."
- supplierQuote: a pull-quote from the supplier's answers, paraphrased naturally (1-2 sentences)
- altTexts: array of ${imageUrls.length} descriptive alt texts for photos

Respond strictly in JSON — no markdown wrapping, no commentary:
{
  "title": "...",
  "slug": "...",
  "answerCapsule": "...",
  "content": "...",
  "excerpt": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "tags": ["..."],
  "category": "${category}",
  "region": "...",
  "keyFacts": [{"label": "...", "value": "..."}],
  "faqItems": [{"q": "...", "a": "..."}],
  "bylineText": "...",
  "supplierQuote": "...",
  "altTexts": ["..."]
}`
  },
}
