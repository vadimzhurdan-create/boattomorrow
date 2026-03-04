'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
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
    charter_booking: 'Find a Yacht',
    boat_purchase: 'Get a Quote',
    school_enrollment: 'Enroll in Course',
    general: 'Send Inquiry',
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
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-green-600 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-800">Inquiry Sent!</h3>
        <p className="text-green-700 mt-1">The supplier will contact you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <div className="hidden">
        <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      <Input name="name" label="Name" required placeholder="Your name" />
      <Input name="email" label="Email" type="email" required placeholder="your@email.com" />
      <Input name="phone" label="Phone" type="tel" placeholder="+1 234 567 890" />

      {(intent === 'charter_booking' || intent === 'general') && (
        <>
          <Input
            name="destination"
            label="Destination / Region"
            placeholder="Where would you like to sail?"
            defaultValue={prefillDestination || ''}
          />
          <Input name="dates" label="Approximate Dates" placeholder="e.g., June 15-22, 2025" />
          <Input name="groupSize" label="Group Size" type="number" min="1" placeholder="Number of people" />
        </>
      )}

      {intent === 'boat_purchase' && (
        <Input
          name="destination"
          label="Model of Interest"
          placeholder="Which yacht model?"
          defaultValue={prefillModel || ''}
        />
      )}

      {intent === 'school_enrollment' && (
        <Input
          name="destination"
          label="Course of Interest"
          placeholder="Which course?"
          defaultValue={prefillCourse || ''}
        />
      )}

      <Textarea
        name="message"
        label="Message"
        placeholder="Tell us about your plans..."
        rows={3}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
        {intentLabels[intent]}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your data will be shared with the supplier to process your inquiry.
      </p>
    </form>
  )
}
