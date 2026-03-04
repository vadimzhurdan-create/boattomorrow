import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SupplierStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Superadmin access required' },
        { status: 403 }
      )
    }

    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        type: true,
        name: true,
        slug: true,
        email: true,
        role: true,
        status: true,
        tagline: true,
        profileStatus: true,
        regions: true,
        website: true,
        contactEmail: true,
        contactPhone: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            leads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: suppliers })
  } catch (error) {
    console.error('Admin suppliers list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Superadmin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { supplierId, status } = body

    if (!supplierId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: supplierId, status' },
        { status: 400 }
      )
    }

    const validStatuses: SupplierStatus[] = ['active', 'blocked']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active or blocked' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: { status: status as SupplierStatus },
    })

    const { passwordHash: _, ...supplierData } = updated

    return NextResponse.json({ data: supplierData })
  } catch (error) {
    console.error('Admin supplier update error:', error)
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}
