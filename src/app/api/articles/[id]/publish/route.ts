import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    // Only the owning supplier can submit for review
    if (session.user.supplierId !== article.supplierId) {
      return NextResponse.json(
        { error: 'Not authorized to submit this article for review' },
        { status: 403 }
      )
    }

    if (article.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft articles can be submitted for review' },
        { status: 400 }
      )
    }

    const updated = await prisma.article.update({
      where: { id },
      data: { status: 'review' },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Article publish error:', error)
    return NextResponse.json(
      { error: 'Failed to submit article for review' },
      { status: 500 }
    )
  }
}
