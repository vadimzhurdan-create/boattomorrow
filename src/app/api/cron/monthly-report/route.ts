import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMonthlyReport } from '@/lib/email'

// Vercel Cron: runs on 1st of each month at 09:00 UTC
// Sends performance summary to each active supplier

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    const monthName = monthStart.toLocaleString('en', { month: 'long', year: 'numeric' })

    // Get all active suppliers with published articles
    const suppliers = await prisma.supplier.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        email: true,
        contactEmail: true,
        articles: {
          where: { status: 'published' },
          select: { id: true },
        },
      },
    })

    let sent = 0

    for (const supplier of suppliers) {
      if (supplier.articles.length === 0) continue

      const articleIds = supplier.articles.map((a) => a.id)

      // Current month stats
      const [views, leads, prevViews, prevLeads] = await Promise.all([
        prisma.articleView.count({
          where: {
            articleId: { in: articleIds },
            createdAt: { gte: monthStart, lt: monthEnd },
          },
        }),
        prisma.lead.count({
          where: {
            supplierId: supplier.id,
            createdAt: { gte: monthStart, lt: monthEnd },
          },
        }),
        // Previous month for comparison
        prisma.articleView.count({
          where: {
            articleId: { in: articleIds },
            createdAt: { gte: prevMonthStart, lt: monthStart },
          },
        }),
        prisma.lead.count({
          where: {
            supplierId: supplier.id,
            createdAt: { gte: prevMonthStart, lt: monthStart },
          },
        }),
      ])

      await sendMonthlyReport({
        supplierEmail: supplier.contactEmail || supplier.email,
        supplierName: supplier.name,
        monthName,
        views,
        leads,
        prevViews,
        prevLeads,
        articleCount: supplier.articles.length,
      })

      sent++
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    console.error('Monthly report cron error:', error)
    return NextResponse.json({ error: 'Monthly report failed' }, { status: 500 })
  }
}
