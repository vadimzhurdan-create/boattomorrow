'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

const navLinks = [
  { href: '/destinations', label: 'Destinations' },
  { href: '/boats', label: 'Boats' },
  { href: '/learning', label: 'Learning' },
  { href: '/routes', label: 'Routes' },
  { href: '/tips', label: 'Tips' },
]

export function Header() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text hover:opacity-50 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-6">
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
        <div className="md:hidden fixed inset-0 top-16 bg-bg z-40">
          <nav className="flex flex-col px-6 py-8 gap-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl font-display font-light text-text py-3 border-b border-border hover:opacity-50 transition-opacity section-animate"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-8 space-y-4">
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
            <div className="absolute bottom-8 left-6 text-xs text-muted">
              info@boattomorrow.com
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
