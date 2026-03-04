import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendLeadNotification } from '@/lib/email'
import { LeadSourceType, LeadIntent, Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      supplierId,
      articleId,
      sourceType,
      intent,
      name,
      email,
      phone,
      message,
      destination,
      dates,
      groupSize,
      honeypot,
    } = body

    // Honeypot check - silently reject spam
    if (honeypot) {
      return NextResponse.json({ data: { id: 'ok' } })
    }

    if (!supplierId || !sourceType || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: supplierId, sourceType, name, email' },
        { status: 400 }
      )
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Verify article exists if provided
    let article = null
    if (articleId) {
      article = await prisma.article.findUnique({
        where: { id: articleId },
      })
      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        supplierId,
        articleId: articleId || null,
        sourceType: sourceType as LeadSourceType,
        intent: (intent as LeadIntent) || 'general',
        name,
        email,
        phone: phone || null,
        message: message || null,
        destination: destination || null,
        dates: dates || null,
        groupSize: groupSize ? parseInt(groupSize, 10) : null,
      },
    })

    // Increment article leads count if applicable
    if (articleId) {
      await prisma.article.update({
        where: { id: articleId },
        data: { leadsCount: { increment: 1 } },
      })
    }

    // Send email notification to supplier (fire and forget)
    sendLeadNotification({
      supplierEmail: supplier.contactEmail || supplier.email,
      supplierName: supplier.name,
      leadName: name,
      leadEmail: email,
      leadMessage: message || '',
      articleTitle: article?.title,
    }).catch((err) => console.error('Lead notification error:', err))

    return NextResponse.json({ data: lead }, { status: 201 })
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Prisma.LeadWhereInput = {}

    // Supplier sees only their leads, superadmin sees all
    if (session.user.role === 'supplier') {
      where.supplierId = session.user.supplierId
    }

    if (status) {
      where.status = status as any
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: leads })
  } catch (error) {
    console.error('Leads list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
