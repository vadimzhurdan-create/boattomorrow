import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'

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

    const lead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Only the owning supplier or superadmin can update
    if (
      session.user.role !== 'superadmin' &&
      session.user.supplierId !== lead.supplierId
    ) {
      return NextResponse.json(
        { error: 'Not authorized to update this lead' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    const validStatuses: LeadStatus[] = ['new_lead', 'seen', 'contacted', 'closed']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: new_lead, seen, contacted, closed' },
        { status: 400 }
      )
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: { status: status as LeadStatus },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Lead update error:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
