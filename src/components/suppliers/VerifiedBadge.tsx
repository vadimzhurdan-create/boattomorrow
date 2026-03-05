interface VerifiedBadgeProps {
  /** Pass supplier data to compute verification status */
  supplier: {
    logoUrl?: string | null
    description?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    tagline?: string | null
    profileStatus?: string
  }
  /** Number of published articles */
  publishedArticles?: number
  size?: 'sm' | 'md'
}

export function isVerified(supplier: VerifiedBadgeProps['supplier'], publishedArticles = 0): boolean {
  let score = 0
  if (supplier.logoUrl) score++
  if (supplier.description && supplier.description.length > 50) score++
  if (supplier.contactEmail) score++
  if (supplier.contactPhone) score++
  if (supplier.tagline) score++
  if (supplier.profileStatus === 'published') score++
  if (publishedArticles >= 1) score++
  // 80% = 5.6 out of 7 fields
  return score >= 5
}

export function VerifiedBadge({ supplier, publishedArticles = 0, size = 'sm' }: VerifiedBadgeProps) {
  if (!isVerified(supplier, publishedArticles)) return null

  const sizeClasses = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'

  return (
    <span
      className="inline-flex items-center gap-1 text-accent"
      title="Verified Supplier"
    >
      <svg
        className={sizeClasses}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
      {size === 'md' && <span className="text-xs font-medium uppercase tracking-wider">Verified</span>}
    </span>
  )
}
