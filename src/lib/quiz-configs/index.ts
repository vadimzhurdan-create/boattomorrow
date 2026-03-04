import { QuizConfig } from './types'
import { charterArticleQuiz } from './charter'
import { manufacturerArticleQuiz } from './manufacturer'
import { schoolArticleQuiz } from './school'
import { profileQuiz } from './profile'

export type { QuizConfig, QuizStep } from './types'

const quizConfigs: Record<string, QuizConfig> = {
  article_charter: charterArticleQuiz,
  article_manufacturer: manufacturerArticleQuiz,
  article_school: schoolArticleQuiz,
  profile: profileQuiz,
}

export function getQuizConfig(quizType: string): QuizConfig | undefined {
  return quizConfigs[quizType]
}

export function getArticleQuizType(supplierType: string): string {
  return `article_${supplierType}`
}
