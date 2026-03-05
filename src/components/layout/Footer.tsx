import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* Top row */}
        <div className="flex items-baseline justify-between mb-12">
          <div className="flex items-center">
            <span className="text-lg font-medium tracking-tight text-text">BOAT</span>
            <span className="text-lg font-medium tracking-tight text-accent">TOMORROW</span>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-muted mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/destinations" className="hover:text-text transition-colors">Destinations</Link></li>
              <li><Link href="/boats" className="hover:text-text transition-colors">Boats</Link></li>
              <li><Link href="/learning" className="hover:text-text transition-colors">Learning</Link></li>
              <li><Link href="/routes" className="hover:text-text transition-colors">Routes</Link></li>
              <li><Link href="/tips" className="hover:text-text transition-colors">Tips</Link></li>
              <li><Link href="/start" className="hover:text-text transition-colors">Start Here</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
              For Charter Companies & Sailing Schools
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/join" className="hover:text-text transition-colors inline-flex items-center gap-1 font-medium text-text">
                  Join as Supplier <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li><Link href="/login" className="hover:text-text transition-colors">Supplier Login</Link></li>
              <li><Link href="/suppliers" className="hover:text-text transition-colors">All Suppliers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-muted mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="mailto:info@boattomorrow.com" className="hover:text-text transition-colors">
                  info@boattomorrow.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} BOATTOMORROW. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
