import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const supplier = await prisma.supplier.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { status: 'published' },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            category: true,
            region: true,
            tags: true,
            coverImageUrl: true,
            viewsCount: true,
            publishedAt: true,
          },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Only show suppliers with published profiles
    if (supplier.profileStatus !== 'published') {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Exclude sensitive fields
    const {
      passwordHash,
      profileQuizSessionId,
      ...supplierData
    } = supplier

    return NextResponse.json({ data: supplierData })
  } catch (error) {
    console.error('Supplier fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    )
  }
}
