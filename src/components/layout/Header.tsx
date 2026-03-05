'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'

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
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null)
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null)

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
                  <svg className={`w-3.5 h-3.5 transition-transform ${openDropdown === group.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === group.label && (
                  <div className="absolute top-full left-0 bg-bg border border-border shadow-sm min-w-[220px] py-2 z-50">
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

          {/* Desktop Auth + Start Here button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/start"
              className="bg-accent text-white px-4 py-2 text-sm font-medium tracking-wide hover:opacity-85 transition-opacity"
            >
              Start Here
            </Link>
            {session ? (
              <>
                {(session.user as any).role === 'superadmin' && (
                  <Link
                    href="/admin/articles"
                    className="text-sm font-medium text-muted hover:text-text transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/supplier/dashboard"
                  className="text-sm font-medium text-text hover:opacity-50 transition-opacity"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted hover:text-text transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-text hover:opacity-50 transition-opacity inline-flex items-center gap-1"
                >
                  Get Started
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </>
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
            {/* Start Here — prominent first item */}
            <Link
              href="/start"
              className="bg-accent text-white text-lg font-medium py-3 px-4 mb-4 text-center"
              onClick={() => setMobileOpen(false)}
            >
              Start Here
            </Link>

            {/* Accordion groups */}
            {navGroups.map((group) => (
              <div key={group.label} className="border-b border-border">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === group.label ? null : group.label)}
                  className="w-full flex items-center justify-between text-lg font-display font-light text-text py-4"
                >
                  {group.label}
                  <svg
                    className={`w-4 h-4 transition-transform ${mobileAccordion === group.label ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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

            <div className="pt-6 space-y-4">
              {session ? (
                <>
                  <Link
                    href="/supplier/dashboard"
                    className="block text-sm font-medium text-text"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}
                    className="block text-sm text-muted"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-sm text-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="block text-sm font-medium text-text"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started &rarr;
                  </Link>
                </>
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
