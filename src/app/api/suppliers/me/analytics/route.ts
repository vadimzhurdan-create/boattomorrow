import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.supplierId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supplierId = session.user.supplierId
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Get supplier's article IDs
    const articles = await prisma.article.findMany({
      where: { supplierId, status: 'published' },
      select: { id: true, title: true, slug: true, viewsCount: true, leadsCount: true },
    })

    const articleIds = articles.map((a) => a.id)

    // Get views in period
    const [viewsInPeriod, leadsInPeriod, viewsByDay, topReferrers] = await Promise.all([
      prisma.articleView.count({
        where: {
          articleId: { in: articleIds },
          createdAt: { gte: since },
        },
      }),
      prisma.lead.count({
        where: {
          supplierId,
          createdAt: { gte: since },
        },
      }),
      // Views by day for chart
      prisma.articleView.groupBy({
        by: ['createdAt'],
        where: {
          articleId: { in: articleIds },
          createdAt: { gte: since },
        },
        _count: true,
        orderBy: { createdAt: 'asc' },
      }),
      // Top referrers
      prisma.articleView.groupBy({
        by: ['referrer'],
        where: {
          articleId: { in: articleIds },
          createdAt: { gte: since },
          referrer: { not: null },
        },
        _count: true,
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
      }),
    ])

    // Aggregate views by day (group by date string)
    const dailyViews: Record<string, number> = {}
    viewsByDay.forEach((v) => {
      const dateStr = v.createdAt.toISOString().split('T')[0]
      dailyViews[dateStr] = (dailyViews[dateStr] || 0) + v._count
    })

    // Top articles by leads
    const topArticles = articles
      .filter((a) => a.leadsCount > 0)
      .sort((a, b) => b.leadsCount - a.leadsCount)
      .slice(0, 5)

    const conversionRate =
      viewsInPeriod > 0
        ? ((leadsInPeriod / viewsInPeriod) * 100).toFixed(2)
        : '0.00'

    return NextResponse.json({
      data: {
        period: days,
        views: viewsInPeriod,
        leads: leadsInPeriod,
        conversionRate,
        dailyViews,
        topArticles,
        topReferrers: topReferrers.map((r) => ({
          referrer: r.referrer || 'Direct',
          count: r._count,
        })),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
