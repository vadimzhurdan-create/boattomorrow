import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArticleStatus } from '@prisma/client'
import { sendArticlePublished } from '@/lib/email'
import { getAnthropic } from '@/lib/anthropic'

const SOCIAL_MODEL = 'claude-sonnet-4-6'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Superadmin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, any> = {}
    if (status) {
      where.status = status as ArticleStatus
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: articles })
  } catch (error) {
    console.error('Admin articles list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Superadmin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { articleId, action } = body

    if (!articleId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: articleId, action' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject' && action !== 'toggleFeatured') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Handle toggleFeatured
    if (action === 'toggleFeatured') {
      const { isFeatured } = body
      if (isFeatured) {
        // Check max 4 featured articles
        const featuredCount = await prisma.article.count({ where: { isFeatured: true } })
        if (featuredCount >= 4) {
          return NextResponse.json(
            { error: 'Maximum 4 featured articles allowed. Remove one first.' },
            { status: 400 }
          )
        }
      }
      const updated = await prisma.article.update({
        where: { id: articleId },
        data: { isFeatured: !!isFeatured },
      })
      return NextResponse.json({ data: updated })
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        supplier: {
          select: {
            name: true,
            email: true,
            contactEmail: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, any> = {}

    if (action === 'approve') {
      updateData.status = 'published'
      updateData.publishedAt = new Date()
      // Calculate reading time on publish
      const wordCount = article.content.split(/\s+/).length
      updateData.readingTime = Math.ceil(wordCount / 200)
    } else {
      updateData.status = 'rejected'
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
    })

    // On approval: auto-generate social posts + send email (fire & forget)
    if (action === 'approve' && article.supplier) {
      // Generate social posts
      generateSocialPosts(article.id, article.title, article.excerpt || article.content.slice(0, 500), article.slug)
        .catch((err) => console.error('Auto social post generation error:', err))

      // Send publication email to supplier
      sendArticlePublished({
        supplierEmail: article.supplier.contactEmail || article.supplier.email,
        supplierName: article.supplier.name,
        articleTitle: article.title,
        articleSlug: article.slug,
      }).catch((err) => console.error('Article published email error:', err))
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin article moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to moderate article' },
      { status: 500 }
    )
  }
}

async function generateSocialPosts(articleId: string, title: string, excerpt: string, slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'
  const articleUrl = `${siteUrl}/articles/${slug}`

  const anthropic = getAnthropic()
  const response = await anthropic.messages.create({
    model: SOCIAL_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Based on this article titled "${title}", generate 3 social media post variants for Facebook/Instagram.

Article excerpt: ${excerpt}
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
  if (!textBlock || textBlock.type !== 'text') return

  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return

  const socialPosts = JSON.parse(jsonMatch[0])

  await prisma.article.update({
    where: { id: articleId },
    data: { socialPosts },
  })
}
