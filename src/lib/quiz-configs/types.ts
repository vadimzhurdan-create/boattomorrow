export interface QuizStep {
  id: string
  question: string
  type: 'choice' | 'text' | 'upload'
  options?: string[]
  placeholder?: string
  required?: boolean
}

export interface QuizConfig {
  supplierType: 'charter' | 'manufacturer' | 'school'
  quizType: 'article' | 'profile'
  steps: QuizStep[]
  systemPrompt: string
  generatePrompt: (answers: Record<string, string>, imageUrls: string[]) => string
}
