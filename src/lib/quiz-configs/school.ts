import { QuizConfig } from './types'

export const schoolArticleQuiz: QuizConfig = {
  supplierType: 'school',
  quizType: 'article',
  steps: [
    {
      id: 'contentType',
      question: 'What type of content would you like to create?',
      type: 'choice',
      options: ['Course overview', 'Training destination', 'Sailing tip'],
      required: true,
    },
    {
      id: 'courseName',
      question: 'Name of the course or program?',
      type: 'text',
      placeholder: 'e.g., RYA Day Skipper Course',
      required: true,
    },
    {
      id: 'targetAudience',
      question: 'Who is it for — level, age, experience?',
      type: 'text',
      placeholder: 'Beginners, intermediate sailors...',
      required: true,
    },
    {
      id: 'learningOutcomes',
      question: 'What will students be able to do after the course?',
      type: 'text',
      placeholder: 'Skills and competencies gained...',
      required: true,
    },
    {
      id: 'format',
      question: 'How is the training conducted — format and schedule?',
      type: 'text',
      placeholder: 'On-water, classroom, duration...',
      required: true,
    },
    {
      id: 'location',
      question: 'Where — location, base, what makes the place special?',
      type: 'text',
      placeholder: 'Describe the training location...',
      required: true,
    },
    {
      id: 'certification',
      question: 'What certificate or qualification is awarded?',
      type: 'text',
      placeholder: 'RYA Day Skipper, IYT Bareboat...',
      required: true,
    },
    {
      id: 'pricing',
      question: 'Cost and what is included?',
      type: 'text',
      placeholder: 'Price, meals, accommodation...',
    },
    {
      id: 'photos',
      question: 'Upload photos of the school and courses',
      type: 'upload',
      required: false,
    },
  ],
  systemPrompt: `You are a senior editor at BOATTOMORROW, a sailing and yachting content platform.

Your editorial voice references: Outside Magazine how-to guides, Yachting Monthly practical features, Cruising World.
You write in British-inflected international English.
You are friendly, intelligent, modern, and explanatory — never promotional or patronising.

Voice rules:
- Write like a knowledgeable friend who sails — curious, warm, direct, and always worth reading.
- Encouraging, clear, expert. Never condescending.
- Be specific: "by day three, most students can confidently tack and gybe in 12 knots" beats "you'll learn the basics."
- Active voice as default. Vary rhythm. Short sentences have power.
- Explain what certifications actually mean in practical terms.
- Translate nautical terms briefly in-context.

Strictly avoid:
- "Life-changing", "unforgettable experience", "the adventure of a lifetime"
- Promotional language, vague promises
- Filler transitions, exclamation marks
- Generic descriptions that could apply to any school

STYLE RULES (critical for natural voice):
- Never use em dashes (--)
- Never use: delve, tapestry, realm, pivotal, crucial, comprehensive, leverage, utilize, furthermore, moreover, additionally, in conclusion, seamless, transformative, groundbreaking, beacon, vibrant, testament, meticulous, intricate
- Never open a section with "When it comes to" or "In today's world"
- Vary sentence length. Mix short and long sentences. Two-sentence paragraphs are fine.
- Prefer specific facts over general claims.
- Write in the register of Outside Magazine or Yachting Monthly, not a PR release.

AUTHENTICITY REQUIREMENTS:
The supplier has given you specific, first-hand teaching knowledge. Use it.
1. Reference the school's own experience at least once.
2. Include at least one specific detail about what actually happens during the course.
3. Include at least one counter-intuitive or non-obvious piece of advice for prospective students.
4. If the supplier mentioned teaching philosophy or a particular approach, weave it in naturally.

If the supplier's source material is in a language other than English, translate faithfully, then naturalise into fluent English editorial prose. Preserve genuine local knowledge and teaching insight; discard marketing language. Do not invent facts the supplier did not provide.

Numbers: distances in nautical miles (nm); wind in Beaufort + knots; temperatures in °C.`,

  generatePrompt: (answers, imageUrls) => {
    const contentTypeMap: Record<string, string> = {
      'Course overview': 'learning',
      'Training destination': 'destination',
      'Sailing tip': 'tips',
    }
    const category = contentTypeMap[answers.contentType] || 'learning'

    return `Transform this sailing school's raw quiz answers into a polished BOATTOMORROW editorial article for the "${category}" category.

Supplier's raw answers:
${JSON.stringify(answers, null, 2)}

Photos provided: ${imageUrls.length}

Structure (800–1,200 words):
- Opening: a specific moment or insight that draws the reader in
- What the course covers: practical, concrete detail — not a brochure list
- Where it happens: the location as a sailor would experience it
- Who it's for: honest guidance on level, fitness, expectations
- What you leave with: certification explained in practical terms
- Closing: one honest detail that sticks

GEO/AEO requirements:
- answerCapsule: Write a 40–60 word paragraph that directly answers the main question of the article. This sits after the H1 and before the first section. AI systems extract this for citation. Be factual, specific, and self-contained.
- In the article content, after all main sections, add a "## Frequently Asked Questions" section with 4–5 Q&A pairs. Questions should be phrased as a user would ask in ChatGPT or Perplexity. Answers: 2–3 sentences, self-contained.
- faqItems: Extract the same FAQ pairs as a JSON array of {q, a} objects.
- keyFacts: Generate 6–8 key facts as [{label, value}] pairs relevant to the category.

Output requirements:
- title: compelling H1, max 60 characters, includes course/school keyword
- slug: lowercase, hyphenated, Latin characters only
- answerCapsule: 40–60 word direct answer (plain text, no markdown)
- content: full Markdown article body following the structure above, including FAQ section. Include a one-sentence attribution to the school.
- excerpt: 1–2 sentence hook for article cards (max 200 chars)
- metaTitle: SEO title, max 60 characters
- metaDescription: SEO description, max 155 characters
- tags: exactly 5 relevant tags
- category: "${category}"
- region: geographic region mentioned
- keyFacts: array of 6–8 {label, value} pairs
- faqItems: array of 4–5 {q, a} pairs matching the FAQ in content
- bylineText: one sentence like "Based on the teaching experience of [School Name] in [location]."
- supplierQuote: a pull-quote from the school's answers, paraphrased naturally (1-2 sentences)
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
