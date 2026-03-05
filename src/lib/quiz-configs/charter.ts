import { QuizConfig } from './types'

export const charterArticleQuiz: QuizConfig = {
  supplierType: 'charter',
  quizType: 'article',
  steps: [
    {
      id: 'contentType',
      question: 'What type of content would you like to create?',
      type: 'choice',
      options: ['Destination guide', 'Sailing route', 'Yachting tip'],
      required: true,
    },
    {
      id: 'placeName',
      question: 'What is the name of the place or region?',
      type: 'text',
      placeholder: 'e.g., Dalmatian Coast, Croatia',
      required: true,
    },
    {
      id: 'specialFeatures',
      question: 'What makes this place special for sailors?',
      type: 'text',
      placeholder: 'Describe the unique aspects...',
      required: true,
    },
    {
      id: 'season',
      question: 'Best season, winds, and weather specifics?',
      type: 'text',
      placeholder: 'Describe the sailing conditions...',
      required: true,
    },
    {
      id: 'marinas',
      question: 'Marinas and anchorages worth visiting?',
      type: 'text',
      placeholder: 'List key marinas and anchorages...',
      required: true,
    },
    {
      id: 'shoreAttractions',
      question: 'What interesting things are there on shore?',
      type: 'text',
      placeholder: 'Restaurants, sights, activities...',
      required: true,
    },
    {
      id: 'yachtTypes',
      question: 'What types of yachts work best for this route?',
      type: 'text',
      placeholder: 'Sailboat, catamaran, motor yacht...',
      required: true,
    },
    {
      id: 'audience',
      question: 'Who is this destination for? (target audience)',
      type: 'text',
      placeholder: 'Families, couples, experienced sailors...',
      required: true,
    },
    {
      id: 'insiderTip',
      question: 'Share an insider tip from a captain',
      type: 'text',
      placeholder: 'Your secret local knowledge...',
      required: true,
    },
    {
      id: 'photos',
      question: 'Upload 3-10 photos of this destination',
      type: 'upload',
      required: false,
    },
  ],
  systemPrompt: `You are a senior editor at BOATTOMORROW, a sailing and yachting content platform.

Your editorial voice references: Cruising World, Yachting World, Condé Nast Traveler, Monocle.
You write in British-inflected international English.
You are friendly, intelligent, modern, and explanatory — never promotional.

Voice rules:
- Write like a knowledgeable friend who sails — curious, warm, direct, and always worth reading.
- Be specific over general. "The mistral typically arrives between 09:00 and noon in July" beats "winds can be strong in summer."
- Active voice as default. Short sentences alongside longer ones. Vary rhythm.
- Use named places and real details: "the anchorage at Palmizana" not "a lovely anchorage."
- Translate nautical terms briefly in-context for non-expert readers.
- Use contractions naturally. This is not a legal document.

Strictly avoid:
- "Paradise", "hidden gem", "breathtaking", "world-class", "unparalleled", "state-of-the-art"
- Promotional language ("You won't be disappointed")
- Filler transitions ("In conclusion", "All in all")
- Exclamation marks
- Sailing clichés ("salty", "nautical miles of fun", "the call of the sea")

If the supplier's source material is in a language other than English, translate it faithfully, then naturalise into fluent English editorial prose. Preserve genuine local knowledge; discard marketing language. Do not invent facts the supplier did not provide.

Numbers: distances in nautical miles (nm); wind in Beaufort + knots; depth in metres; boat lengths in metres (feet in brackets); temperatures in °C.`,

  generatePrompt: (answers, imageUrls) => {
    const contentTypeMap: Record<string, string> = {
      'Destination guide': 'destination',
      'Sailing route': 'route',
      'Yachting tip': 'tips',
    }
    const category = contentTypeMap[answers.contentType] || 'destination'

    const structureGuide = category === 'destination'
      ? `Structure (1,200–1,800 words):
- Opening paragraph: a specific scene or moment that places the reader there
- Section 1: Why here — what makes this destination distinctive for sailors
- Section 2: When to go — seasons, wind patterns, what changes month to month
- Section 3: The waters — anchorages, marinas, passage notes
- Section 4: On the shore — what to do, eat, see when not sailing
- Section 5: Who it suits — honest guidance on experience level, boat type, group type
- Closing paragraph: an insider's note, a detail that sticks`
      : category === 'route'
      ? `Structure (800–1,200 words):
- Opening: the route in one vivid sentence, then practical overview
- The passage told chronologically or by leg (each leg: start → passage notes → destination + what to know)
- Key considerations: weather window, tides, hazards
- End note: what makes this route worth it`
      : `Structure (800–1,200 words):
- Opening: a specific, useful insight that hooks the reader
- 4–6 sections with H2 headings, each delivering a distinct practical point
- Closing: one memorable takeaway`

    return `Transform this charter company's raw quiz answers into a polished BOATTOMORROW editorial article for the "${category}" category.

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
- title: compelling H1, max 60 characters, includes destination/topic keyword
- slug: lowercase, hyphenated, Latin characters only
- answerCapsule: 40–60 word direct answer (plain text, no markdown)
- content: full Markdown article body following the structure above, including FAQ section
- excerpt: 1–2 sentence hook for article cards (max 200 chars)
- metaTitle: SEO title, max 60 characters
- metaDescription: SEO description, max 155 characters
- tags: exactly 5 relevant tags
- category: "${category}"
- region: geographic region mentioned
- keyFacts: array of 6–8 {label, value} pairs
- faqItems: array of 4–5 {q, a} pairs matching the FAQ in content
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
  "altTexts": ["..."]
}`
  },
}
