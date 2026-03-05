import { QuizConfig } from './types'

export const profileQuiz: QuizConfig = {
  supplierType: 'charter',
  quizType: 'profile',
  steps: [
    {
      id: 'companyName',
      question: 'What is your company\'s official name?',
      type: 'text',
      placeholder: 'Your company name',
      required: true,
    },
    {
      id: 'tagline',
      question: 'A short tagline for your profile header (up to 80 characters)',
      type: 'text',
      placeholder: 'e.g., Sailing excellence in the Mediterranean since 2005',
      required: true,
    },
    {
      id: 'history',
      question: 'Tell us about your company history and why you are in yachting',
      type: 'text',
      placeholder: 'Your story...',
      required: true,
    },
    {
      id: 'advantages',
      question: 'What are your key advantages for clients?',
      type: 'text',
      placeholder: 'What makes you stand out...',
      required: true,
    },
    {
      id: 'regions',
      question: 'In which regions or countries do you operate?',
      type: 'text',
      placeholder: 'Croatia, Greece, Turkey...',
      required: true,
    },
    {
      id: 'specificInfo1',
      question: 'Tell us about your fleet / brands / courses (depending on your type)',
      type: 'text',
      placeholder: 'Details about what you offer...',
      required: true,
    },
    {
      id: 'specificInfo2',
      question: 'What services or packages do you offer?',
      type: 'text',
      placeholder: 'Bareboat charter, crewed, courses...',
    },
    {
      id: 'specificInfo3',
      question: 'What languages do you support? Any certifications?',
      type: 'text',
      placeholder: 'EN, HR, RU; IATA certified...',
    },
    {
      id: 'contactInfo',
      question: 'Your contact information (email, phone, website)',
      type: 'text',
      placeholder: 'info@example.com, +385...',
      required: true,
    },
    {
      id: 'photos',
      question: 'Upload your logo, cover image, and gallery photos',
      type: 'upload',
      required: false,
    },
  ],
  systemPrompt: `You are a senior editor at BOATTOMORROW, a sailing and yachting content platform.

Your editorial voice references: Monocle company profiles, Condé Nast Traveler partner features.
You write in British-inflected international English.
You are warm, factual, and trusted — this reads like a well-written "about" page, not a sales pitch.

Voice rules:
- One sentence that captures what makes this company distinct.
- Factual, specific, no superlatives without evidence.
- Describe what the experience is actually like in practical terms.
- Use the company's real details; do not invent or embellish.

Strictly avoid:
- "World-class", "premier", "leading", "unmatched"
- Promotional language, empty superlatives
- Exclamation marks, breathless enthusiasm
- Generic descriptions that could apply to any company

If the supplier's source material is in a language other than English, translate faithfully, then naturalise into fluent English editorial prose. Preserve the company's genuine character; discard marketing language.`,

  generatePrompt: (answers) => {
    return `Transform these raw quiz answers into a polished BOATTOMORROW supplier profile.

Supplier's raw answers:
${JSON.stringify(answers, null, 2)}

Structure (250–400 words):
- Opening line: one sentence that captures what makes this company distinct
- What they do: factual, specific, no superlatives
- Where they operate: regions, bases, context
- What the experience is like: in practical terms
- Contact / how to reach them

Output requirements:
- tagline: max 80 characters, captures the company's essence
- description: Markdown, 250–400 words, following the structure above

Respond strictly in JSON — no markdown wrapping, no commentary:
{
  "tagline": "...",
  "description": "..."
}`
  },
}
