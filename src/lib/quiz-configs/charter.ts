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
      required: true,
    },
  ],
  systemPrompt: `You are a professional SEO copywriter for a yachting magazine.
Write engagingly and expertly, for people who love the sea.
Always respond in the language that matches the content - if the destination/content is about an English-speaking region, write in English.`,
  generatePrompt: (answers, imageUrls) => {
    const contentTypeMap: Record<string, string> = {
      'Destination guide': 'destination',
      'Sailing route': 'route',
      'Yachting tip': 'tips',
    }
    const category = contentTypeMap[answers.contentType] || 'destination'
    return `Based on the charter company's answers, write an article for the "${category}" category.

Quiz answers:
${JSON.stringify(answers, null, 2)}

Number of photos provided: ${imageUrls.length}

Requirements:
- H1 (up to 60 chars, with keyword for the destination/product)
- Introduction 2-3 paragraphs
- 4-6 sections with H2 headings
- Conclusion with call to action
- metaTitle (60 chars)
- metaDescription (160 chars)
- tags: 5 items
- slug (latin, hyphenated)
- altTexts for each uploaded photo (${imageUrls.length} photos)

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
