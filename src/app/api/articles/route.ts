import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplierId')
    const region = searchParams.get('region')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const skip = (page - 1) * limit

    const where: Prisma.ArticleWhereInput = {}

    // Public requests only see published articles
    // Logged-in suppliers can see their own articles in any status
    if (session?.user?.supplierId && session.user.role === 'supplier') {
      if (supplierId === session.user.supplierId) {
        // Supplier viewing their own articles - show all statuses
        where.supplierId = session.user.supplierId
        if (status) {
          where.status = status as any
        }
      } else {
        // Supplier viewing other articles - only published
        where.status = 'published'
        if (supplierId) where.supplierId = supplierId
      }
    } else if (session?.user?.role === 'superadmin') {
      // Superadmin can see all
      if (status) where.status = status as any
      if (supplierId) where.supplierId = supplierId
    } else {
      // Public - only published
      where.status = 'published'
      if (supplierId) where.supplierId = supplierId
    }

    if (category) {
      where.category = category as any
    }

    if (region) {
      where.region = region
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          supplier: {
            select: {
              name: true,
              slug: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({
      data: articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Articles list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
