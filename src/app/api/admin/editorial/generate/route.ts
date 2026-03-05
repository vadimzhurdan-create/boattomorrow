import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropic, ARTICLE_GEN_MODEL } from '@/lib/anthropic'
import { slugify } from '@/lib/utils'

const HUMANIZE_MODEL = 'claude-sonnet-4-6'

const INSPIRATIONAL_SYSTEM = `You are an editorial writer for BOATTOMORROW, a yacht industry content platform. Your voice is warm, evocative, and personal. You write like a seasoned travel journalist who genuinely loves the sea. You make sailing feel accessible and exciting, never elitist.

Style rules:
- Use sensory language: sounds, smells, textures
- Short paragraphs (2-3 sentences max)
- Mix practical information with emotional storytelling
- Address the reader directly ("you") but naturally
- Vary sentence length for rhythm
- Never use cliches like "hidden gem" or "crystal-clear waters"
- Include specific details (marina names, local dishes, exact costs)
- Tone: confident but humble, enthusiastic but not over-the-top`

const EXPERT_SYSTEM = `You are a technical sailing expert writing for BOATTOMORROW, a yacht industry content platform. Your voice is authoritative, precise, and clear. You write like an experienced captain explaining things to a competent crew.

Style rules:
- Lead with the most useful information
- Use precise nautical terminology but explain it when first used
- Include specifications, measurements, and comparisons
- Structure content with clear headings and logical flow
- Back claims with evidence or experience
- Tone: knowledgeable, direct, helpful
- Never condescend, never oversimplify
- Include practical "what to do" sections`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { brief, voice, category, destinationId } = body

    if (!brief || !voice || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Load recent published articles for interlinking
    const recentArticles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      select: { slug: true, title: true },
    })

    const articleList = recentArticles
      .map((a) => `- ${a.title} → /articles/${a.slug}`)
      .join('\n')

    // 2. Select system prompt
    const systemPrompt = voice === 'inspirational' ? INSPIRATIONAL_SYSTEM : EXPERT_SYSTEM

    // 3. Build user prompt
    const userPrompt = `Write an article based on this brief:

${brief}

Category: ${category}

Existing articles on the site (use for internal linking where natural):
${articleList || '(no articles yet)'}

Output ONLY valid JSON with this structure:
{
  "title": "Article title (compelling, under 80 chars)",
  "slug": "url-friendly-slug",
  "excerpt": "1-2 sentence teaser (under 200 chars)",
  "metaTitle": "SEO title (under 60 chars)",
  "metaDescription": "SEO description (under 155 chars)",
  "answerCapsule": "40-60 word summary answering the main question",
  "content": "Full article in markdown. 1500-2500 words. Use ## for h2 and ### for h3. Include internal links as [text](/articles/slug).",
  "tags": ["tag1", "tag2", "tag3"],
  "faqItems": [{"q": "question", "a": "answer"}, ...],
  "keyFacts": [{"label": "label", "value": "value"}, ...]
}`

    // 4. Generate with Opus
    const anthropic = getAnthropic()
    const genResponse = await anthropic.messages.create({
      model: ARTICLE_GEN_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const genText = genResponse.content.find((b) => b.type === 'text')
    if (!genText || genText.type !== 'text') {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 500 })
    }

    // Parse JSON from response
    const jsonMatch = genText.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 })
    }

    const articleData = JSON.parse(jsonMatch[0])

    // 5. Humanize content with Sonnet
    const humanizeResponse = await anthropic.messages.create({
      model: HUMANIZE_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Rewrite this article to make it sound more natural and human-written. Preserve all information, links, and structure. Keep markdown formatting (## and ###). Make sentences flow naturally, vary paragraph lengths, add subtle personal touches. Do NOT add disclaimers or meta-commentary. Output ONLY the rewritten article text in markdown:

${articleData.content}`,
        },
      ],
    })

    const humanText = humanizeResponse.content.find((b) => b.type === 'text')
    const humanizedContent = humanText && humanText.type === 'text' ? humanText.text : articleData.content

    // Calculate reading time
    const wordCount = humanizedContent.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    // 6. Ensure unique slug
    let slug = slugify(articleData.slug || articleData.title)
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Get destination region if specified
    let region: string | undefined
    if (destinationId) {
      const dest = await prisma.destination.findUnique({
        where: { id: destinationId },
        select: { region: true },
      })
      region = dest?.region || undefined
    }

    // 7. Create article as editorial draft
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug,
        content: humanizedContent,
        excerpt: articleData.excerpt || null,
        metaTitle: articleData.metaTitle || null,
        metaDescription: articleData.metaDescription || null,
        answerCapsule: articleData.answerCapsule || null,
        category: category as any,
        region: region || null,
        tags: articleData.tags || [],
        faqItems: articleData.faqItems || null,
        keyFacts: articleData.keyFacts || null,
        status: 'draft',
        isEditorial: true,
        readingTime,
        supplierType: 'charter', // default type for editorial
        supplierId: null,
        destinationId: destinationId || null,
      },
    })

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Editorial generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    )
  }
}
