'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Clock, Shield, CheckCircle, AlertCircle, MapPin, Calendar, Users, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LeadFormProps {
  supplierId: string
  articleId?: string
  intent: 'charter_booking' | 'boat_purchase' | 'school_enrollment' | 'general'
  sourceType: 'article' | 'profile' | 'search'
  prefillDestination?: string
  prefillModel?: string
  prefillCourse?: string
}

/* ── Floating label input ── */
function FloatingInput({
  name,
  label,
  type = 'text',
  required,
  defaultValue,
  icon: Icon,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  defaultValue?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  const [error, setError] = useState('')

  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-[18px] w-4 h-4 text-[#999] pointer-events-none z-10" />
      )}
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder=" "
        onInvalid={(e) => {
          e.preventDefault()
          setError(type === 'email' ? 'Please enter a valid email' : 'This field is required')
        }}
        onInput={() => setError('')}
        className={`peer w-full rounded-lg bg-[#FAFAF8] text-[#111] text-base font-body
          transition-all duration-200
          ${Icon ? 'pl-10 pr-4' : 'px-4'} pt-5 pb-2
          border-[1.5px] ${error ? 'border-red-500 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]' : 'border-[#D0D0D0]'}
          focus:outline-none focus:border-[#E8500A] focus:shadow-[0_0_0_3px_rgba(232,80,10,0.12)] focus:bg-white
          [&:not(:placeholder-shown)]:border-[#111] [&:not(:placeholder-shown)]:bg-white
          placeholder:text-transparent`}
      />
      <label
        htmlFor={name}
        className={`absolute ${Icon ? 'left-10' : 'left-4'} top-[14px] text-[#999] text-base
          transition-all duration-200 pointer-events-none
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#E8500A] peer-focus:font-medium
          peer-[:not(:placeholder-shown)]:top-1.5
          peer-[:not(:placeholder-shown)]:text-xs
          peer-[:not(:placeholder-shown)]:text-[#6B6B6B]
          peer-[:not(:placeholder-shown)]:font-medium`}
      >
        {label}{required && <span className="text-[#E8500A] ml-0.5">*</span>}
      </label>
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  )
}

/* ── Floating label select ── */
function FloatingSelect({
  name,
  label,
  options,
  icon: Icon,
}: {
  name: string
  label: string
  options: { value: string; label: string }[]
  icon?: React.ComponentType<{ className?: string }>
}) {
  const [hasValue, setHasValue] = useState(false)

  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-[18px] w-4 h-4 text-[#999] pointer-events-none z-10" />
      )}
      <select
        name={name}
        defaultValue=""
        onChange={(e) => setHasValue(e.target.value !== '')}
        className={`w-full rounded-lg bg-[#FAFAF8] text-base font-body appearance-none
          transition-all duration-200 cursor-pointer
          ${Icon ? 'pl-10 pr-10' : 'pl-4 pr-10'} pt-5 pb-2
          border-[1.5px] border-[#D0D0D0]
          focus:outline-none focus:border-[#E8500A] focus:shadow-[0_0_0_3px_rgba(232,80,10,0.12)] focus:bg-white
          ${hasValue ? 'text-[#111] border-[#111] bg-white' : 'text-[#999]'}`}
      >
        <option value="" disabled hidden>{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-[#111]">
            {opt.label}
          </option>
        ))}
      </select>
      <label
        className={`absolute ${Icon ? 'left-10' : 'left-4'} pointer-events-none transition-all duration-200
          ${hasValue
            ? 'top-1.5 text-xs text-[#6B6B6B] font-medium'
            : 'top-[14px] text-base text-[#999]'
          }`}
      >
        {label}
      </label>
      {/* Chevron */}
      <svg className="absolute right-4 top-[18px] w-4 h-4 text-[#999] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

/* ── Floating label textarea ── */
function FloatingTextarea({
  name,
  label,
  hint,
}: {
  name: string
  label: string
  hint?: string
}) {
  return (
    <div className="relative">
      <textarea
        id={name}
        name={name}
        placeholder=" "
        rows={4}
        className="peer w-full rounded-lg bg-[#FAFAF8] text-[#111] text-base font-body
          transition-all duration-200 px-4 pt-5 pb-2 min-h-[100px] resize-y
          border-[1.5px] border-[#D0D0D0]
          focus:outline-none focus:border-[#E8500A] focus:shadow-[0_0_0_3px_rgba(232,80,10,0.12)] focus:bg-white
          [&:not(:placeholder-shown)]:border-[#111] [&:not(:placeholder-shown)]:bg-white
          placeholder:text-transparent"
      />
      <label
        htmlFor={name}
        className="absolute left-4 top-[14px] text-[#999] text-base
          transition-all duration-200 pointer-events-none
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#E8500A] peer-focus:font-medium
          peer-[:not(:placeholder-shown)]:top-1.5
          peer-[:not(:placeholder-shown)]:text-xs
          peer-[:not(:placeholder-shown)]:text-[#6B6B6B]
          peer-[:not(:placeholder-shown)]:font-medium"
      >
        {label}
      </label>
      {hint && (
        <p className="text-xs text-[#999] mt-1">{hint}</p>
      )}
    </div>
  )
}

/* ── Main form ── */
export function LeadForm({ supplierId, articleId, intent, sourceType, prefillDestination, prefillModel, prefillCourse }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const intentTitles: Record<string, string> = {
    charter_booking: 'Get personalised charter offers',
    boat_purchase: 'Request a quote for this boat',
    school_enrollment: 'Find the right sailing course',
    general: 'Get personalised charter offers',
  }

  const intentSubtitles: Record<string, string> = {
    charter_booking: 'Tell us what you\'re looking for — hear back from verified companies within 24 hours.',
    boat_purchase: 'Share your requirements and receive detailed specs and pricing directly.',
    school_enrollment: 'Let us connect you with accredited sailing schools near your destination.',
    general: 'Tell us what you\'re looking for — hear back from verified companies within 24 hours.',
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
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Success state ── */
  if (isSubmitted) {
    return (
      <div className="bg-white border border-[#E0E0E0] border-t-4 border-t-[#E8500A] rounded-xl shadow-md p-8 md:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display text-2xl font-bold text-[#111] mb-2">
          Your inquiry has been sent!
        </h3>
        <p className="text-base text-[#4A4A4A] max-w-sm mx-auto mb-6">
          Expect to hear back within 24 hours from verified charter companies.
        </p>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#E8500A] uppercase tracking-wide hover:text-[#111] transition-colors"
        >
          Browse more destinations <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div className="bg-white border border-[#E0E0E0] border-t-4 border-t-[#E8500A] rounded-xl shadow-md p-8 md:p-10">
      <h3 className="font-display text-2xl md:text-3xl font-bold text-[#111] mb-2">
        {intentTitles[intent]}
      </h3>
      <p className="text-base text-[#4A4A4A] mb-8">
        {intentSubtitles[intent]}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <div className="hidden">
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput name="name" label="Your name" required />
          <FloatingInput name="email" label="Email address" type="email" required />
        </div>

        <FloatingInput name="phone" label="Phone (optional)" type="tel" />

        {(intent === 'charter_booking' || intent === 'general') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FloatingInput
              name="destination"
              label="Destination / Region"
              defaultValue={prefillDestination}
              icon={MapPin}
            />
            <FloatingInput
              name="dates"
              label="Dates (e.g. June 2026)"
              icon={Calendar}
            />
            <FloatingSelect
              name="groupSize"
              label="Group size"
              icon={Users}
              options={[
                { value: '2', label: '2 guests' },
                { value: '4', label: '3–4 guests' },
                { value: '6', label: '5–6 guests' },
                { value: '8', label: '7–8 guests' },
                { value: '10', label: '9–10 guests' },
                { value: '12', label: '10+ guests' },
              ]}
            />
          </div>
        )}

        {intent === 'boat_purchase' && (
          <FloatingInput
            name="destination"
            label="Model of interest"
            defaultValue={prefillModel}
          />
        )}

        {intent === 'school_enrollment' && (
          <FloatingInput
            name="destination"
            label="Course of interest"
            defaultValue={prefillCourse}
          />
        )}

        <FloatingTextarea
          name="message"
          label="Tell us about your plans..."
          hint="Dates, preferences, questions — anything helps us match you better"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#E8500A] text-white font-semibold text-lg py-4 rounded-lg
            shadow-sm hover:bg-[#D04500] hover:shadow-md active:scale-[0.98]
            transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Get Free Quotes <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Trust indicators */}
        <div className="mt-4 space-y-2 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-[#6B6B6B]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Response within 24h
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Free, no obligation
            </span>
          </div>
          <p className="text-xs text-[#999]">
            Your details go directly to verified charter companies. No spam, ever.
          </p>
        </div>
      </form>
    </div>
  )
}
