import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-xl font-bold text-white">BOAT</span>
              <span className="text-xl font-bold text-accent-400">TOMORROW</span>
            </div>
            <p className="text-sm text-gray-400">
              Your gateway to the yachting world. Discover destinations, boats, and sailing education.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
              <li><Link href="/boats" className="hover:text-white transition-colors">Boats</Link></li>
              <li><Link href="/learning" className="hover:text-white transition-colors">Learning</Link></li>
              <li><Link href="/routes" className="hover:text-white transition-colors">Routes</Link></li>
              <li><Link href="/tips" className="hover:text-white transition-colors">Tips</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">For Suppliers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Join as Supplier</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Supplier Login</Link></li>
              <li><Link href="/suppliers" className="hover:text-white transition-colors">All Suppliers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>info@boattomorrow.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} BOATTOMORROW. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
