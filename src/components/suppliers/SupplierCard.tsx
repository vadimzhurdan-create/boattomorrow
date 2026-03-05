import Image from 'next/image'
import Link from 'next/link'
import { VerifiedBadge } from './VerifiedBadge'

interface SupplierCardProps {
  supplier: {
    slug: string
    name: string
    type: string
    tagline?: string | null
    logoUrl: string | null
    regions: string[]
    description?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    profileStatus?: string
    _count?: { articles: number }
  }
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <Link
      href={`/suppliers/${supplier.slug}`}
      className="group flex gap-4 items-start py-5 border-t border-border"
    >
      {/* Logo */}
      <div className="w-12 h-12 flex-shrink-0 border border-border flex items-center justify-center overflow-hidden">
        {supplier.logoUrl ? (
          <Image
            src={supplier.logoUrl}
            alt={supplier.name}
            width={48}
            height={48}
            className="object-contain"
          />
        ) : (
          <span className="text-text font-medium text-lg">
            {supplier.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-accent mb-0.5">
          {supplier.type}
        </p>
        <h3 className="text-base font-medium text-text transition-opacity duration-200 group-hover:opacity-50 truncate flex items-center gap-1.5">
          {supplier.name}
          <VerifiedBadge
            supplier={supplier}
            publishedArticles={supplier._count?.articles}
          />
        </h3>
        {supplier.regions.length > 0 && (
          <p className="mt-0.5 text-xs text-muted font-light">
            {supplier.regions.slice(0, 3).join(' · ')}
            {supplier.regions.length > 3 && ` +${supplier.regions.length - 3}`}
          </p>
        )}
      </div>
    </Link>
  )
}
