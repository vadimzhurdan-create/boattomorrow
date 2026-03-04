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
      required: true,
    },
  ],
  systemPrompt: `You are a professional SEO copywriter for a yachting magazine.
Write engagingly and expertly about boats and marine technology.`,
  generatePrompt: (answers, imageUrls) => {
    const contentTypeMap: Record<string, string> = {
      'Yacht review': 'boat',
      'Buying guide': 'tips',
      'Gear & Technology': 'gear',
    }
    const category = contentTypeMap[answers.contentType] || 'boat'
    return `Based on the manufacturer/distributor's answers, write an article for the "${category}" category.

Quiz answers:
${JSON.stringify(answers, null, 2)}

Number of photos provided: ${imageUrls.length}

Requirements:
- H1 (up to 60 chars, with the yacht model or category keyword)
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
