'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, LayoutDashboard, FileText, Users, Building2, LogOut, Shield } from 'lucide-react'

const navGroups = [
  {
    label: 'Where to Go',
    items: [
      { href: '/destinations', label: 'Destinations', desc: 'Sailing regions around the world' },
      { href: '/routes', label: 'Routes', desc: 'Curated sailing itineraries' },
    ],
  },
  {
    label: 'What to Know',
    items: [
      { href: '/learning', label: 'Learning', desc: 'Courses and sailing education' },
      { href: '/tips', label: 'Tips', desc: 'Practical advice for sailors' },
    ],
  },
  {
    label: 'Boats & Gear',
    items: [
      { href: '/boats', label: 'Boats', desc: 'Yachts, catamarans and more' },
      { href: '/gear', label: 'Gear', desc: 'Equipment and accessories' },
    ],
  },
]

export function Header() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null)
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null)
  const avatarTimeout = useRef<NodeJS.Timeout | null>(null)

  const isLoggedIn = !!session?.user
  const isSuperadmin = (session?.user as any)?.role === 'superadmin'
  const userEmail = (session?.user as any)?.email || ''
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleMouseEnter(label: string) {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setOpenDropdown(label)
  }

  function handleMouseLeave() {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150)
  }

  function handleAvatarEnter() {
    if (avatarTimeout.current) clearTimeout(avatarTimeout.current)
    setAvatarOpen(true)
  }

  function handleAvatarLeave() {
    avatarTimeout.current = setTimeout(() => setAvatarOpen(false), 150)
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-bg transition-[border-color] duration-200 border-b ${
        scrolled ? 'border-border' : 'border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-lg font-medium tracking-tight text-text">BOAT</span>
            <span className="text-lg font-medium tracking-tight text-accent">TOMORROW</span>
          </Link>

          {/* Desktop Nav — dropdown groups */}
          <nav className="hidden md:flex items-center gap-6">
            {navGroups.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="text-sm font-medium text-text hover:opacity-50 transition-opacity flex items-center gap-1 py-4"
                  onClick={() => setOpenDropdown(openDropdown === group.label ? null : group.label)}
                >
                  {group.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === group.label ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === group.label && (
                  <div className="absolute top-full left-0 bg-bg border border-border shadow-sm min-w-[220px] py-2 z-50 rounded-lg">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2.5 hover:bg-bg-alt transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <span className="text-sm font-medium text-text">{item.label}</span>
                        <span className="block text-xs text-muted mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Dashboard link */}
                <Link
                  href={isSuperadmin ? '/admin/articles' : '/supplier/dashboard'}
                  className="text-sm font-medium text-text hover:opacity-50 transition-opacity"
                >
                  Dashboard
                </Link>

                {/* Avatar dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleAvatarEnter}
                  onMouseLeave={handleAvatarLeave}
                >
                  <button
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    className="w-8 h-8 rounded-full bg-[#E8500A] text-white flex items-center justify-center text-sm font-medium hover:bg-[#D04500] transition-colors"
                  >
                    {userInitial}
                  </button>

                  {avatarOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-bg border border-border shadow-md min-w-[200px] py-2 z-50 rounded-lg">
                      {isSuperadmin ? (
                        <>
                          <Link
                            href="/admin/articles"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-alt transition-colors"
                            onClick={() => setAvatarOpen(false)}
                          >
                            <Shield className="w-4 h-4 text-muted" />
                            Admin Panel
                          </Link>
                          <Link
                            href="/admin/articles"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-alt transition-colors"
                            onClick={() => setAvatarOpen(false)}
                          >
                            <FileText className="w-4 h-4 text-muted" />
                            Moderation
                          </Link>
                          <Link
                            href="/suppliers"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-alt transition-colors"
                            onClick={() => setAvatarOpen(false)}
                          >
                            <Building2 className="w-4 h-4 text-muted" />
                            Suppliers
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/supplier/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-alt transition-colors"
                            onClick={() => setAvatarOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-muted" />
                            Dashboard
                          </Link>
                          <Link
                            href="/supplier/articles"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-alt transition-colors"
                            onClick={() => setAvatarOpen(false)}
                          >
                            <FileText className="w-4 h-4 text-muted" />
                            My Articles
                          </Link>
                          <Link
                            href="/supplier/leads"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-alt transition-colors"
                            onClick={() => setAvatarOpen(false)}
                          >
                            <Users className="w-4 h-4 text-muted" />
                            My Leads
                          </Link>
                          <Link
                            href="/supplier/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-alt transition-colors"
                            onClick={() => setAvatarOpen(false)}
                          >
                            <Building2 className="w-4 h-4 text-muted" />
                            Company Profile
                          </Link>
                        </>
                      )}
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setAvatarOpen(false) }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:text-text hover:bg-bg-alt transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Not logged in — only Start Here button, no Sign in / Get Started */
              <Link
                href="/start"
                className="bg-accent text-white px-4 py-2 text-sm font-medium tracking-wide rounded-lg hover:bg-[#D04500] transition-colors"
              >
                Start Here
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-bg z-[60] overflow-y-auto">
          <nav className="flex flex-col px-6 py-6 gap-0 min-h-full">
            {isLoggedIn ? (
              /* Logged-in supplier mobile menu */
              <>
                <Link
                  href={isSuperadmin ? '/admin/articles' : '/supplier/dashboard'}
                  className="bg-accent text-white text-lg font-medium py-3 px-4 mb-4 text-center rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>

                {isSuperadmin ? (
                  <div className="border-b border-border pb-3 mb-3 space-y-1">
                    <Link href="/admin/articles" className="block py-2 text-base text-text" onClick={() => setMobileOpen(false)}>
                      Admin Panel
                    </Link>
                    <Link href="/admin/articles" className="block py-2 text-base text-text" onClick={() => setMobileOpen(false)}>
                      Moderation
                    </Link>
                    <Link href="/suppliers" className="block py-2 text-base text-text" onClick={() => setMobileOpen(false)}>
                      Suppliers
                    </Link>
                  </div>
                ) : (
                  <div className="border-b border-border pb-3 mb-3 space-y-1">
                    <Link href="/supplier/articles" className="block py-2 text-base text-text" onClick={() => setMobileOpen(false)}>
                      My Articles
                    </Link>
                    <Link href="/supplier/leads" className="block py-2 text-base text-text" onClick={() => setMobileOpen(false)}>
                      My Leads
                    </Link>
                    <Link href="/supplier/profile" className="block py-2 text-base text-text" onClick={() => setMobileOpen(false)}>
                      Company Profile
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* Not logged in — Start Here first */
              <Link
                href="/start"
                className="bg-accent text-white text-lg font-medium py-3 px-4 mb-4 text-center rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Start Here
              </Link>
            )}

            {/* Accordion groups */}
            {navGroups.map((group) => (
              <div key={group.label} className="border-b border-border">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === group.label ? null : group.label)}
                  className="w-full flex items-center justify-between text-lg font-display font-light text-text py-4"
                >
                  {group.label}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileAccordion === group.label ? 'rotate-180' : ''}`}
                  />
                </button>
                {mobileAccordion === group.label && (
                  <div className="pb-3 pl-4 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2 text-base text-muted hover:text-text transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Bottom section */}
            <div className="pt-6 space-y-4">
              {isLoggedIn ? (
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}
                  className="block text-sm text-muted"
                >
                  Sign Out
                </button>
              ) : (
                /* For Suppliers link — small, at bottom */
                <Link
                  href="/join"
                  className="block text-sm text-muted hover:text-text transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  For Suppliers &rarr;
                </Link>
              )}
            </div>

            <div className="mt-auto pt-8 pb-4 text-xs text-muted">
              info@boattomorrow.com
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
