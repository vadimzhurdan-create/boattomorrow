import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supplierId = (session.user as any).supplierId
    if (!supplierId) {
      return NextResponse.json({ error: 'Not a supplier' }, { status: 403 })
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const { passwordHash, ...data } = supplier
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Supplier me fetch error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supplierId = (session.user as any).supplierId
    if (!supplierId) {
      return NextResponse.json({ error: 'Not a supplier' }, { status: 403 })
    }

    const body = await request.json()

    const allowedFields = [
      'tagline', 'description', 'logoUrl', 'coverImageUrl',
      'imageUrls', 'website', 'contactEmail', 'contactPhone',
      'regions', 'typeMeta', 'profileStatus',
    ]

    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData,
    })

    const { passwordHash, ...data } = supplier
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Supplier me update error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
