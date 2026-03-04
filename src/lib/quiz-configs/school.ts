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
      required: true,
    },
  ],
  systemPrompt: `You are a professional SEO copywriter for a yachting magazine.
Write engagingly and expertly about sailing education and training.`,
  generatePrompt: (answers, imageUrls) => {
    const contentTypeMap: Record<string, string> = {
      'Course overview': 'learning',
      'Training destination': 'destination',
      'Sailing tip': 'tips',
    }
    const category = contentTypeMap[answers.contentType] || 'learning'
    return `Based on the sailing school's answers, write an article for the "${category}" category.

Quiz answers:
${JSON.stringify(answers, null, 2)}

Number of photos provided: ${imageUrls.length}

Requirements:
- H1 (up to 60 chars, with the course/school keyword)
- Introduction 2-3 paragraphs
- 4-6 sections with H2 headings
- Conclusion with call to action
- metaTitle (60 chars)
- metaDescription (160 chars)
- tags: 5 items
- slug (latin, hyphenated)
- altTexts for each photo (${imageUrls.length} photos)

Respond strictly in JSON:
{
  "title": "...",
  "slug": "...",
  "content": "...(Markdown)...",
  "excerpt": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "tags": ["..."],
  "category": "${category}",
  "region": "...",
  "altTexts": ["..."]
}`
  },
}
