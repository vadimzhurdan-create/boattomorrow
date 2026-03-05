import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendLeadMagnet } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, leadMagnet, articleId, categorySlug } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check for existing subscriber
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    })

    if (existing) {
      // Already subscribed — still send the lead magnet but don't create duplicate
      sendLeadMagnet({ email, leadMagnet: leadMagnet || categorySlug }).catch(
        (err) => console.error('Lead magnet send error:', err)
      )
      return NextResponse.json({ data: { id: existing.id, existing: true } })
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        source: source || 'lead_magnet',
        leadMagnet: leadMagnet || null,
        articleId: articleId || null,
        categorySlug: categorySlug || null,
      },
    })

    // Send lead magnet email
    sendLeadMagnet({ email, leadMagnet: leadMagnet || categorySlug }).catch(
      (err) => console.error('Lead magnet send error:', err)
    )

    return NextResponse.json({ data: subscriber }, { status: 201 })
  } catch (error) {
    console.error('Subscriber creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    )
  }
}
