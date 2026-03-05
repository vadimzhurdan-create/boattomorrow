'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface InlineLeadCaptureProps {
  supplierId: string
  articleId: string
  supplierType: 'charter' | 'manufacturer' | 'school'
  destination?: string
  boatModel?: string
  capturePoint: 'inline_cta_1' | 'inline_cta_2'
}

const ctaConfig = {
  charter: {
    title: (dest: string) => `Find out charter prices in ${dest || 'this destination'}`,
    buttonText: 'Get offers',
    fields: ['dates', 'groupSize', 'email'] as const,
  },
  school: {
    title: (dest: string) => `Enroll in a sailing course${dest ? ` in ${dest}` : ''}`,
    buttonText: 'See schedule & prices',
    fields: ['level', 'email'] as const,
  },
  manufacturer: {
    title: (_dest: string, model?: string) => `Request specs for ${model || 'this yacht'}`,
    buttonText: 'Get PDF',
    fields: ['email'] as const,
  },
}

export function InlineLeadCapture({
  supplierId,
  articleId,
  supplierType,
  destination,
  boatModel,
  capturePoint,
}: InlineLeadCaptureProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const config = ctaConfig[supplierType]

  const intentMap = {
    charter: 'charter_booking' as const,
    manufacturer: 'boat_purchase' as const,
    school: 'school_enrollment' as const,
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      supplierId,
      articleId,
      sourceType: 'article',
      intent: intentMap[supplierType],
      name: (formData.get('email') as string)?.split('@')[0] || 'Inquiry',
      email: formData.get('email'),
      dates: formData.get('dates') || null,
      groupSize: formData.get('groupSize') ? Number(formData.get('groupSize')) : null,
      destination: destination || null,
      message: formData.get('level')
        ? `Level: ${formData.get('level')}`
        : null,
      capturePoint,
      honeypot: formData.get('website_url'),
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
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
      <div className="my-10 border border-border bg-bg-alt p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">Thank you</p>
        <p className="text-sm text-text">We'll be in touch within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="my-10 border border-border bg-bg-alt p-6 md:p-8 not-prose">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">/ quick inquiry</p>
      <h4 className="font-display text-lg font-light mb-4">
        {config.title(destination || '', boatModel)}
      </h4>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
        {/* Honeypot */}
        <div className="hidden">
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>

        {supplierType === 'charter' && (
          <>
            <input
              name="dates"
              placeholder="Dates (e.g. Jun 15-22)"
              className="flex-1 border-0 border-b border-border bg-transparent py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors"
            />
            <select
              name="groupSize"
              className="border-0 border-b border-border bg-transparent py-2 text-sm text-muted focus:outline-none focus:border-text transition-colors"
              defaultValue=""
            >
              <option value="" disabled>Guests</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10+</option>
            </select>
          </>
        )}

        {supplierType === 'school' && (
          <select
            name="level"
            className="flex-1 border-0 border-b border-border bg-transparent py-2 text-sm text-muted focus:outline-none focus:border-text transition-colors"
            defaultValue=""
          >
            <option value="" disabled>Your level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        )}

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
          {isSubmitting ? 'Sending...' : config.buttonText}
        </button>
      </form>

      <p className="text-[10px] text-muted mt-3">
        Your data is shared with the supplier to process your inquiry.
      </p>
    </div>
  )
}
