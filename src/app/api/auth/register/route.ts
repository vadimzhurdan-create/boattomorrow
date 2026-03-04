import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import slugify from 'slugify'
import { prisma } from '@/lib/prisma'
import { SupplierType } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, type } = body

    if (!email || !password || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, type' },
        { status: 400 }
      )
    }

    const validTypes: SupplierType[] = ['charter', 'manufacturer', 'school']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid supplier type. Must be charter, manufacturer, or school' },
        { status: 400 }
      )
    }

    const existingSupplier = await prisma.supplier.findUnique({
      where: { email },
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'A supplier with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    let slug = slugify(name, { lower: true, strict: true })

    const existingSlug = await prisma.supplier.findUnique({
      where: { slug },
    })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const supplier = await prisma.supplier.create({
      data: {
        email,
        passwordHash,
        name,
        slug,
        type: type as SupplierType,
        status: 'active',
      },
    })

    const { passwordHash: _, ...supplierData } = supplier

    return NextResponse.json({ data: supplierData }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register supplier' },
      { status: 500 }
    )
  }
}
