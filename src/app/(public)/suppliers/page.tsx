import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SupplierCard } from '@/components/suppliers/SupplierCard'
import { supplierTypeLabels } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Our Suppliers',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Our Suppliers</h1>
        <p className="mt-3 text-lg text-gray-600">
          Trusted partners in the yachting industry, from charter companies to sailing schools.
        </p>
      </div>

      {/* Type Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/suppliers"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedType
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Types
        </Link>
        {supplierTypes.map((type) => (
          <Link
            key={type.value}
            href={`/suppliers?type=${type.value}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === type.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </Link>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-6">
        {suppliers.length} {suppliers.length === 1 ? 'supplier' : 'suppliers'} found
        {selectedType && ` (${supplierTypeLabels[selectedType] || selectedType})`}
      </p>

      {/* Suppliers Grid */}
      {suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.slug} supplier={supplier} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No suppliers found</h3>
          <p className="mt-2 text-gray-500">
            {selectedType
              ? `No ${supplierTypeLabels[selectedType] || selectedType} suppliers yet.`
              : 'No suppliers published yet. Check back soon!'}
          </p>
        </div>
      )}
    </div>
  )
}
