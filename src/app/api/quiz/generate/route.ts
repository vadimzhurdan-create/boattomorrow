import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropic, ARTICLE_GEN_MODEL, QUIZ_MODEL } from '@/lib/anthropic'
import { getQuizConfig } from '@/lib/quiz-configs'
import { HUMANIZER_SYSTEM_PROMPT } from '@/lib/prompts/humanizer'
import slugify from 'slugify'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
    })

    if (!quizSession) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      )
    }

    if (quizSession.supplierId !== session.user.supplierId) {
      return NextResponse.json(
        { error: 'Not authorized to access this quiz session' },
        { status: 403 }
      )
    }

    if (quizSession.status === 'completed') {
      return NextResponse.json(
        { error: 'Quiz session is already completed' },
        { status: 400 }
      )
    }

    const config = getQuizConfig(quizSession.quizType)
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid quiz configuration' },
        { status: 400 }
      )
    }

    const answers = quizSession.answers as Record<string, string>
    const imageUrls = quizSession.imageUrls || []
    let generatePrompt = config.generatePrompt(answers, imageUrls)

    // Fetch published articles for contextual interlinking
    const existingArticles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { title: true, slug: true, tags: true, category: true, region: true },
      take: 30,
      orderBy: { publishedAt: 'desc' },
    })

    if (existingArticles.length > 0) {
      const contextLinks = existingArticles
        .map((a) => `- [${a.title}](/articles/${a.slug}) [${a.category}${a.region ? `, ${a.region}` : ''}]`)
        .join('\n')

      generatePrompt += `\n\nContextual interlinking — use 2–4 of these links naturally in the article text where relevant. Do not force them:\n${contextLinks}`
    }

    // Step 1: Generate article with Opus
    const anthropic = getAnthropic()
    const response = await anthropic.messages.create({
      model: ARTICLE_GEN_MODEL,
      max_tokens: 8192,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: generatePrompt }],
    })

    // Parse the text response as JSON
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to generate content from AI' },
        { status: 500 }
      )
    }

    let generatedData: any
    try {
      let jsonText = textContent.text.trim()
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
      generatedData = JSON.parse(jsonText)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      )
    }

    // Step 2: Humanizer pass with Sonnet — rewrite content for natural voice
    let humanizedContent = generatedData.content
    try {
      const humanizerResponse = await anthropic.messages.create({
        model: QUIZ_MODEL,
        max_tokens: 8192,
        system: HUMANIZER_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Rewrite this article draft following your editorial rules.
Preserve all factual information, the structure, and the SEO elements
(H2 headings, FAQ section, key facts). Only change the style and language.

ARTICLE:
${generatedData.content}`,
          },
        ],
      })

      const humanizerText = humanizerResponse.content.find((block) => block.type === 'text')
      if (humanizerText && humanizerText.type === 'text') {
        humanizedContent = humanizerText.text
      }
    } catch (humanizerError) {
      // If humanizer fails, proceed with original content
      console.warn('Humanizer pass failed, using original content:', humanizerError)
    }

    // Generate a unique slug
    let articleSlug = generatedData.slug || slugify(generatedData.title, { lower: true, strict: true })
    const existingSlug = await prisma.article.findUnique({
      where: { slug: articleSlug },
    })
    if (existingSlug) {
      articleSlug = `${articleSlug}-${Date.now()}`
    }

    // Create article record with GEO/AEO + humanization fields
    const article = await prisma.article.create({
      data: {
        supplierId: session.user.supplierId,
        supplierType: session.user.supplierType,
        title: (generatedData.title || '').slice(0, 255),
        slug: articleSlug.slice(0, 255),
        content: humanizedContent,
        excerpt: generatedData.excerpt || null,
        metaTitle: generatedData.metaTitle ? generatedData.metaTitle.slice(0, 255) : null,
        metaDescription: generatedData.metaDescription ? generatedData.metaDescription.slice(0, 500) : null,
        category: generatedData.category || 'destination',
        region: generatedData.region ? generatedData.region.slice(0, 100) : null,
        tags: generatedData.tags || [],
        status: 'draft',
        coverImageUrl: imageUrls[0] || null,
        imageUrls: imageUrls,
        quizSessionId: quizSession.id,
        // GEO/AEO fields
        answerCapsule: generatedData.answerCapsule || null,
        faqItems: generatedData.faqItems || null,
        keyFacts: generatedData.keyFacts || null,
        // E-E-A-T / humanization fields
        bylineText: generatedData.bylineText || null,
        supplierQuote: generatedData.supplierQuote || null,
      },
    })

    // Update quiz session
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        generatedDraft: textContent.text,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({ data: article })
  } catch (error: any) {
    console.error('Quiz generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate article', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
