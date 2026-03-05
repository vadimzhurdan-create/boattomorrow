'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

interface EmailGateProps {
  category: string
  destination?: string
  articleId?: string
}

const leadMagnetTitles: Record<string, string> = {
  destination: 'Checklist: how to plan a charter in {destination}',
  boat: 'Guide: what to look for when choosing a yacht',
  learning: 'PDF: 10 things you need to know before your first course',
  route: 'Route map + anchorage list (PDF)',
  tips: 'Sailor\'s checklist: what to bring aboard',
  gear: 'Equipment comparison table',
}

export function EmailGate({ category, destination, articleId }: EmailGateProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleScroll = useCallback(() => {
    if (isDismissed || isSubmitted) return
    const scrollPercentage =
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    if (scrollPercentage >= 60) {
      setIsVisible(true)
    }
  }, [isDismissed, isSubmitted])

  useEffect(() => {
    // Check if already subscribed in this session
    const alreadySubscribed = sessionStorage.getItem('bt_subscribed')
    if (alreadySubscribed) return

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'lead_magnet',
          leadMagnet: category,
          articleId,
          categorySlug: category,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      setIsSubmitted(true)
      sessionStorage.setItem('bt_subscribed', '1')
      toast.success('Check your email for the guide!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVisible || isDismissed || isSubmitted) return null

  // Build title with destination substitution
  let title = leadMagnetTitles[category] || 'Free sailing guide'
  if (destination) {
    title = title.replace('{destination}', destination)
  } else {
    title = title.replace(' in {destination}', '')
  }

  return (
    <div className="my-12 border border-accent/30 bg-bg-alt p-6 md:p-8 relative not-prose">
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 text-muted hover:text-text transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <p className="text-xs uppercase tracking-widest text-accent mb-2">/ free guide</p>
      <h4 className="font-display text-lg font-light mb-4">{title}</h4>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="flex-1 border-0 border-b border-border bg-transparent py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-white px-5 py-2 text-sm font-medium tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 whitespace-nowrap"
        >
          {isSubmitting ? 'Sending...' : 'Download free'}
        </button>
      </form>

      <p className="text-[10px] text-muted mt-3">No spam. One-click unsubscribe.</p>
    </div>
  )
}
