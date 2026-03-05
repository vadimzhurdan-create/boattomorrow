import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropic } from '@/lib/anthropic'

const SOCIAL_MODEL = 'claude-sonnet-4-6'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        supplierId: true,
        status: true,
        content: true,
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Only owner or admin
    if (
      session.user.role !== 'superadmin' &&
      article.supplierId !== session.user.supplierId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'
    const articleUrl = `${siteUrl}/articles/${article.slug}`

    const anthropic = getAnthropic()

    const response = await anthropic.messages.create({
      model: SOCIAL_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Based on this article titled "${article.title}", generate 3 social media post variants for Facebook/Instagram.

Article excerpt: ${article.excerpt || article.content.slice(0, 500)}

Article URL: ${articleUrl}

Generate exactly 3 variants:
1. Informational (fact + link)
2. Engaging (question to audience + link)
3. Expert (author quote + link)

Length: 150-250 characters each. Language: English. No emojis. Tone: professional but warm.

Respond ONLY with valid JSON array:
[{"type": "informational", "text": "..."}, {"type": "engaging", "text": "..."}, {"type": "expert", "text": "..."}]`,
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    // Parse JSON from response
    const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse social posts' }, { status: 500 })
    }

    const socialPosts = JSON.parse(jsonMatch[0])

    // Save to article
    await prisma.article.update({
      where: { id },
      data: { socialPosts },
    })

    return NextResponse.json({ data: socialPosts })
  } catch (error) {
    console.error('Social posts generation error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
