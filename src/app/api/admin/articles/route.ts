import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArticleStatus } from '@prisma/client'

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

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
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

    const updateData: Record<string, any> = {}

    if (action === 'approve') {
      updateData.status = 'published'
      updateData.publishedAt = new Date()
    } else {
      updateData.status = 'rejected'
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin article moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to moderate article' },
      { status: 500 }
    )
  }
}
