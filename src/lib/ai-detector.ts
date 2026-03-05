const AI_WORDS = [
  'delve', 'tapestry', 'realm', 'pivotal', 'crucial', 'comprehensive',
  'leverage', 'utilize', 'moreover', 'furthermore', 'additionally',
  'bolster', 'garner', 'intricate', 'meticulous', 'testament',
  'vibrant', 'seamless', 'transformative', 'groundbreaking',
  'beacon', 'fostering', 'showcasing', 'underscore', 'enduring',
  'interplay', 'cutting-edge', 'revolutionary', 'game-changer',
  'facilitate', 'demonstrate',
]

const AI_PHRASES = [
  'it is worth noting',
  'it is important to note',
  'in conclusion',
  'in summary',
  "in today's world",
  'when it comes to',
  'first and foremost',
  'could potentially',
  'might possibly',
  'may perhaps',
  'whether you\'re a',
  'in the realm of',
  'needless to say',
  'dive deep',
]

const EM_DASH_REGEX = /\u2014/g

export interface AIDetectionResult {
  score: number
  issues: { type: string; matches: string[] }[]
}

export function detectAIMarkers(text: string): AIDetectionResult {
  const lower = text.toLowerCase()
  const issues: { type: string; matches: string[] }[] = []

  // Check banned words
  const foundWords = AI_WORDS.filter((w) => {
    // Match whole words only
    const regex = new RegExp(`\\b${w}\\b`, 'i')
    return regex.test(lower)
  })
  if (foundWords.length > 0) {
    issues.push({ type: 'AI words', matches: foundWords })
  }

  // Check banned phrases
  const foundPhrases = AI_PHRASES.filter((p) => lower.includes(p))
  if (foundPhrases.length > 0) {
    issues.push({ type: 'AI phrases', matches: foundPhrases })
  }

  // Check em dash overuse
  const emDashes = text.match(EM_DASH_REGEX)
  if (emDashes && emDashes.length > 1) {
    issues.push({ type: 'Em dash overuse', matches: [`${emDashes.length} occurrences`] })
  }

  // Check sentence length uniformity (low burstiness)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  if (sentences.length > 5) {
    const lengths = sentences.map((s) => s.trim().split(/\s+/).length)
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length
    if (variance < 15) {
      issues.push({ type: 'Low burstiness', matches: ['Sentence lengths too uniform'] })
    }
  }

  // Calculate score: start at 100, deduct for issues
  const score = Math.max(
    0,
    100 - issues.length * 15 - foundWords.length * 5 - foundPhrases.length * 5
  )

  return { score, issues }
}
