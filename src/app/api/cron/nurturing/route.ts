import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNurturingEmail } from '@/lib/email'

// Vercel Cron: runs daily at 10:00 UTC
// Sends nurturing emails to subscribers based on their step and timing

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    let sent = 0

    // Step 0 -> 1: send email #2 after 3 days
    const step1Subscribers = await prisma.subscriber.findMany({
      where: {
        nurturingStep: 0,
        unsubscribedAt: null,
        lastEmailAt: { lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      },
      take: 50, // batch limit
    })

    for (const sub of step1Subscribers) {
      await sendNurturingEmail({ email: sub.email, step: 1, categorySlug: sub.categorySlug })
      await prisma.subscriber.update({
        where: { id: sub.id },
        data: { nurturingStep: 1, lastEmailAt: now },
      })
      sent++
    }

    // Step 1 -> 2: send email #3 after 5 days (from email #2)
    const step2Subscribers = await prisma.subscriber.findMany({
      where: {
        nurturingStep: 1,
        unsubscribedAt: null,
        lastEmailAt: { lte: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      },
      take: 50,
    })

    for (const sub of step2Subscribers) {
      await sendNurturingEmail({ email: sub.email, step: 2, categorySlug: sub.categorySlug })
      await prisma.subscriber.update({
        where: { id: sub.id },
        data: { nurturingStep: 2, lastEmailAt: now },
      })
      sent++
    }

    // Step 2 -> 3: send email #4 (direct offer) after 7 days (from email #3)
    const step3Subscribers = await prisma.subscriber.findMany({
      where: {
        nurturingStep: 2,
        unsubscribedAt: null,
        lastEmailAt: { lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
      take: 50,
    })

    for (const sub of step3Subscribers) {
      await sendNurturingEmail({ email: sub.email, step: 3, categorySlug: sub.categorySlug })
      await prisma.subscriber.update({
        where: { id: sub.id },
        data: { nurturingStep: 3, lastEmailAt: now },
      })
      sent++
    }

    return NextResponse.json({
      ok: true,
      sent,
      breakdown: {
        step1: step1Subscribers.length,
        step2: step2Subscribers.length,
        step3: step3Subscribers.length,
      },
    })
  } catch (error) {
    console.error('Nurturing cron error:', error)
    return NextResponse.json({ error: 'Nurturing cron failed' }, { status: 500 })
  }
}
