import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeadingProps {
  children: React.ReactNode
  label?: string
  viewAllHref?: string
}

export function SectionHeading({ children, label, viewAllHref }: SectionHeadingProps) {
  return (
    <div className="mb-10">
      {label && (
        <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-3">
          {label}
        </p>
      )}
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-3xl md:text-[2.5rem] font-light tracking-tight text-text">
          {children}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-[#E8500A] uppercase tracking-wide hover:text-[#111] transition-colors flex items-center gap-1"
          >
            view all
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="w-12 h-[3px] bg-[#E8500A] mt-3" />
    </div>
  )
}
