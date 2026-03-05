'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Clock, Shield, CheckCircle, Loader2, ArrowRight } from 'lucide-react'

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
    title: (dest: string) => `Get charter prices in ${dest || 'this destination'}`,
    buttonText: 'Get Quotes',
    fields: ['dates', 'groupSize', 'email'] as const,
  },
  school: {
    title: (dest: string) => `Find a sailing course${dest ? ` in ${dest}` : ''}`,
    buttonText: 'See Courses',
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
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Success ── */
  if (isSubmitted) {
    return (
      <div className="my-10 bg-[#FFF8F5] border border-[#E8500A]/20 rounded-xl p-6 md:p-8 text-center not-prose">
        <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <p className="text-lg font-bold text-[#111]">Inquiry sent!</p>
        <p className="text-sm text-[#4A4A4A] mt-1">We&apos;ll be in touch within 24 hours.</p>
      </div>
    )
  }

  /* ── Form ── */
  const inputClass = `rounded-lg bg-[#FAFAF8] text-sm text-[#111] font-body
    px-3 py-2.5 border-[1.5px] border-[#D0D0D0]
    transition-all duration-200 placeholder:text-[#999]
    focus:outline-none focus:border-[#E8500A] focus:shadow-[0_0_0_3px_rgba(232,80,10,0.12)] focus:bg-white
    [&:not(:placeholder-shown)]:border-[#111] [&:not(:placeholder-shown)]:bg-white`

  const selectClass = `rounded-lg bg-[#FAFAF8] text-sm font-body appearance-none
    px-3 py-2.5 border-[1.5px] border-[#D0D0D0] cursor-pointer
    transition-all duration-200
    focus:outline-none focus:border-[#E8500A] focus:shadow-[0_0_0_3px_rgba(232,80,10,0.12)] focus:bg-white`

  return (
    <div className="my-10 bg-[#FFF8F5] border border-[#E8500A]/20 rounded-xl p-6 md:p-8 not-prose">
      <h4 className="text-xl font-bold text-[#111] mb-1">
        {config.title(destination || '', boatModel)}
      </h4>
      <p className="text-sm text-[#4A4A4A] mb-5">
        Free quotes from verified companies — no obligation.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        {/* Honeypot */}
        <div className="hidden">
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>

        {supplierType === 'charter' && (
          <>
            <input
              name="dates"
              placeholder="Dates (e.g. Jun 2026)"
              className={`flex-1 ${inputClass}`}
            />
            <select
              name="groupSize"
              className={`w-full sm:w-auto ${selectClass} text-[#999]`}
              defaultValue=""
              onChange={(e) => {
                e.target.style.color = e.target.value ? '#111' : '#999'
              }}
            >
              <option value="" disabled>Guests</option>
              <option value="2">2</option>
              <option value="4">3–4</option>
              <option value="6">5–6</option>
              <option value="8">7–8</option>
              <option value="10">10+</option>
            </select>
          </>
        )}

        {supplierType === 'school' && (
          <select
            name="level"
            className={`flex-1 ${selectClass} text-[#999]`}
            defaultValue=""
            onChange={(e) => {
              e.target.style.color = e.target.value ? '#111' : '#999'
            }}
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
          className={`flex-1 ${inputClass}`}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#E8500A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold
            hover:bg-[#D04500] shadow-sm hover:shadow-md active:scale-[0.98]
            transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
            whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              {config.buttonText} <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#999]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> Reply within 24h
        </span>
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" /> No spam, ever
        </span>
      </div>
    </div>
  )
}
