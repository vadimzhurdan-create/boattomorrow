import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const { referrer, utmSource, utmMedium } = body

    // Create view record and increment counter in parallel
    await Promise.all([
      prisma.articleView.create({
        data: {
          articleId: id,
          referrer: referrer || null,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
        },
      }),
      prisma.article.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    // Non-critical — don't break the page
    console.error('View tracking error:', error)
    return NextResponse.json({ ok: true })
  }
}
