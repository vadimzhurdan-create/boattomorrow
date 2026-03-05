import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            tagline: true,
            logoUrl: true,
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

    // Public can only see published articles
    const session = await getServerSession(authOptions)
    if (article.status !== 'published') {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      // Only the owning supplier or superadmin can see unpublished
      if (
        session.user.role !== 'superadmin' &&
        session.user.supplierId !== article.supplierId
      ) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Article fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    const article = await prisma.article.findUnique({
      where: { id },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Only the owning supplier or superadmin can update
    if (
      session.user.role !== 'superadmin' &&
      session.user.supplierId !== article.supplierId
    ) {
      return NextResponse.json(
        { error: 'Not authorized to update this article' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      tags,
      coverImageUrl,
      imageUrls,
      difficulty,
    } = body

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) {
      updateData.content = content
      // Recalculate reading time on content change
      updateData.readingTime = Math.ceil(content.split(/\s+/).length / 200)
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (tags !== undefined) updateData.tags = tags
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls
    if (difficulty !== undefined) updateData.difficulty = difficulty

    const updated = await prisma.article.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Article update error:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    const article = await prisma.article.findUnique({
      where: { id },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Only the owning supplier or superadmin can delete
    if (
      session.user.role !== 'superadmin' &&
      session.user.supplierId !== article.supplierId
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this article' },
        { status: 403 }
      )
    }

    // Can only delete draft or rejected articles
    if (article.status !== 'draft' && article.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Only draft or rejected articles can be deleted' },
        { status: 400 }
      )
    }

    await prisma.article.delete({
      where: { id },
    })

    return NextResponse.json({ data: { message: 'Article deleted successfully' } })
  } catch (error) {
    console.error('Article delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
