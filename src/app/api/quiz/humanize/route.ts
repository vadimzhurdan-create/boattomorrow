import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropic, QUIZ_MODEL } from '@/lib/anthropic'
import { HUMANIZER_SYSTEM_PROMPT } from '@/lib/prompts/humanizer'

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
    const { articleId } = body

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId is required' },
        { status: 400 }
      )
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (article.supplierId !== session.user.supplierId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Call humanizer pass with Sonnet
    const anthropic = getAnthropic()
    const response = await anthropic.messages.create({
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
${article.content}`,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to humanize content' },
        { status: 500 }
      )
    }

    // Update article with humanized content
    await prisma.article.update({
      where: { id: articleId },
      data: { content: textContent.text },
    })

    return NextResponse.json({
      data: { content: textContent.text },
    })
  } catch (error: any) {
    console.error('Humanize error:', error)
    return NextResponse.json(
      { error: 'Failed to humanize article', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
