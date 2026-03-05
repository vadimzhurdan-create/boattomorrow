import Anthropic from '@anthropic-ai/sdk'

let _anthropic: Anthropic | null = null

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return _anthropic
}

// Model selection by task
// Quiz chat — Sonnet (cheap, fast, sufficient for step-by-step Q&A)
export const QUIZ_MODEL = 'claude-sonnet-4-6'
// Article generation — Opus (single request, quality is critical)
export const ARTICLE_GEN_MODEL = 'claude-opus-4-6'
// Supplier profile generation — Sonnet (shorter output, less critical)
export const PROFILE_GEN_MODEL = 'claude-sonnet-4-6'
