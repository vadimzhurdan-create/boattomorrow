import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SupplierCard } from '@/components/suppliers/SupplierCard'
import { supplierTypeLabels } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Suppliers',
  description: 'Browse trusted yacht charter companies, boat manufacturers, and sailing schools on BOATTOMORROW.',
}

const supplierTypes = [
  { value: 'charter', label: 'Charter Companies' },
  { value: 'manufacturer', label: 'Boat Manufacturers' },
  { value: 'school', label: 'Sailing Schools' },
]

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function SuppliersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const selectedType = params.type || undefined

  const where = {
    profileStatus: 'published' as const,
    ...(selectedType ? { type: selectedType as 'charter' | 'manufacturer' | 'school' } : {}),
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      slug: true,
      name: true,
      type: true,
      tagline: true,
      logoUrl: true,
      regions: true,
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-2xl font-light font-body tracking-tight">
          <span className="text-accent mr-1">/</span> suppliers
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/suppliers"
          className={`px-3 py-1.5 text-xs border transition-all ${
            !selectedType
              ? 'bg-text text-bg border-text'
              : 'bg-transparent text-text border-border hover:bg-text hover:text-bg hover:border-text'
          }`}
        >
          All Types
        </Link>
        {supplierTypes.map((type) => (
          <Link
            key={type.value}
            href={`/suppliers?type=${type.value}`}
            className={`px-3 py-1.5 text-xs border transition-all ${
              selectedType === type.value
                ? 'bg-text text-bg border-text'
                : 'bg-transparent text-text border-border hover:bg-text hover:text-bg hover:border-text'
            }`}
          >
            {type.label}
          </Link>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-muted uppercase tracking-widest mb-8">
        {suppliers.length} {suppliers.length === 1 ? 'supplier' : 'suppliers'}
        {selectedType && ` (${supplierTypeLabels[selectedType] || selectedType})`}
      </p>

      {/* Suppliers Grid */}
      {suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.slug} supplier={supplier} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-t border-border">
          <h3 className="font-display text-xl font-light mb-2">No suppliers found</h3>
          <p className="text-sm text-muted">
            {selectedType
              ? `No ${supplierTypeLabels[selectedType] || selectedType} suppliers yet.`
              : 'No suppliers published yet. Check back soon!'}
          </p>
        </div>
      )}
    </div>
  )
}
