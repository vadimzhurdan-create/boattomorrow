import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const destinations = await prisma.destination.findMany({
      select: { id: true, canonicalName: true, slug: true },
      orderBy: { canonicalName: 'asc' },
    })

    return NextResponse.json({ data: destinations })
  } catch (error) {
    console.error('Admin destinations list error:', error)
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 })
  }
}
