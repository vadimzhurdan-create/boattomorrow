'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface LeadFormProps {
  supplierId: string
  articleId?: string
  intent: 'charter_booking' | 'boat_purchase' | 'school_enrollment' | 'general'
  sourceType: 'article' | 'profile' | 'search'
  prefillDestination?: string
  prefillModel?: string
  prefillCourse?: string
}

export function LeadForm({ supplierId, articleId, intent, sourceType, prefillDestination, prefillModel, prefillCourse }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const intentLabels: Record<string, string> = {
    charter_booking: 'Send inquiry',
    boat_purchase: 'Request a quote',
    school_enrollment: 'Enroll now',
    general: 'Send inquiry',
  }

  const intentTitles: Record<string, string> = {
    charter_booking: 'Interested in chartering here?',
    boat_purchase: 'Want to learn more about this boat?',
    school_enrollment: 'Ready to start sailing?',
    general: 'Get in touch',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      supplierId,
      articleId,
      sourceType,
      intent,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      destination: formData.get('destination'),
      dates: formData.get('dates'),
      groupSize: formData.get('groupSize') ? Number(formData.get('groupSize')) : undefined,
      honeypot: formData.get('website_url'),
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to submit')

      setIsSubmitted(true)
      toast.success('Your inquiry has been sent!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="border-t border-b border-border py-10 my-12 text-center">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">Thank you</p>
        <h3 className="font-display text-xl font-light">Inquiry sent successfully</h3>
        <p className="text-sm text-muted mt-2">The supplier will contact you within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="border-t border-b border-border py-10 my-8">
      <h3 className="font-display text-xl font-light mb-6">
        {intentTitles[intent]}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-1">
        {/* Honeypot */}
        <div className="hidden">
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>

        <input
          name="name"
          required
          placeholder="Name"
          className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone (optional)"
          className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
        />

        {(intent === 'charter_booking' || intent === 'general') && (
          <>
            <input
              name="destination"
              placeholder="Destination / Region"
              defaultValue={prefillDestination || ''}
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
            />
            <input
              name="dates"
              placeholder="Approximate dates"
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
            />
            <input
              name="groupSize"
              type="number"
              min="1"
              placeholder="Group size"
              className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
            />
          </>
        )}

        {intent === 'boat_purchase' && (
          <input
            name="destination"
            placeholder="Model of interest"
            defaultValue={prefillModel || ''}
            className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
          />
        )}

        {intent === 'school_enrollment' && (
          <input
            name="destination"
            placeholder="Course of interest"
            defaultValue={prefillCourse || ''}
            className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
          />
        )}

        <textarea
          name="message"
          rows={3}
          placeholder="Tell us about your plans..."
          className="w-full border-0 border-b border-border bg-transparent py-3 text-base placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors resize-none"
        />

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 text-sm font-medium tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                {intentLabels[intent]} <span aria-hidden="true">&rarr;</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-muted text-right pt-2">
          Your data will be shared with the supplier to process your inquiry.
        </p>
      </form>
    </div>
  )
}
