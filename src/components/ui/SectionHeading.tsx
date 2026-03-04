import Link from 'next/link'

interface SectionHeadingProps {
  children: React.ReactNode
  viewAllHref?: string
}

export function SectionHeading({ children, viewAllHref }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between border-t border-border pt-6 mb-6">
      <h2 className="text-2xl font-light font-body tracking-tight">
        <span className="text-accent mr-1">/</span>
        {children}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm text-muted hover:text-text transition-colors"
        >
          view all &rarr;
        </Link>
      )}
    </div>
  )
}
