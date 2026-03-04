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
      required: true,
    },
  ],
  systemPrompt: `You are an editor for a yachting B2B platform company page.
Write professionally and engagingly about the company.`,
  generatePrompt: (answers) => {
    return `Write a company profile based on these answers:

${JSON.stringify(answers, null, 2)}

Respond strictly in JSON:
{
  "tagline": "...(up to 80 chars)...",
  "description": "...(Markdown, 300-500 words)..."
}`
  },
}
