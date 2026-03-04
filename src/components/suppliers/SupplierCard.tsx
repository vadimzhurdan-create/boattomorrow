import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '../ui/Badge'
import { supplierTypeLabels } from '@/lib/utils'

interface SupplierCardProps {
  supplier: {
    slug: string
    name: string
    type: string
    tagline: string | null
    logoUrl: string | null
    regions: string[]
  }
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <Link href={`/suppliers/${supplier.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md p-6">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            {supplier.logoUrl ? (
              <Image src={supplier.logoUrl} alt={supplier.name} fill className="object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full text-primary-600 font-bold text-xl">
                {supplier.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Badge className="bg-primary-50 text-primary-700 mb-2">
              {supplierTypeLabels[supplier.type] || supplier.type}
            </Badge>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {supplier.name}
            </h3>
            {supplier.tagline && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{supplier.tagline}</p>
            )}
            {supplier.regions.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {supplier.regions.slice(0, 3).join(' · ')}
                {supplier.regions.length > 3 && ` +${supplier.regions.length - 3}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
