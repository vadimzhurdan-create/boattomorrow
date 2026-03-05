'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Destination {
  id: string
  canonicalName: string
}

export default function EditorialNewPage() {
  const router = useRouter()
  const [brief, setBrief] = useState('')
  const [voice, setVoice] = useState<'inspirational' | 'expert'>('inspirational')
  const [category, setCategory] = useState('destination')
  const [destinationId, setDestinationId] = useState('')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/destinations')
      .then((r) => r.json())
      .then((d) => setDestinations(d.data || []))
      .catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!brief.trim()) {
      toast.error('Please enter a content brief')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/admin/editorial/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          voice,
          category,
          destinationId: destinationId || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }

      const data = await res.json()
      toast.success('Article generated! Redirecting to editor...')
      router.push(`/supplier/articles/${data.data.id}/edit`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate article')
    } finally {
      setIsGenerating(false)
    }
  }

  const categories = [
    { value: 'destination', label: 'Destination' },
    { value: 'boat', label: 'Boat' },
    { value: 'learning', label: 'Learning' },
    { value: 'route', label: 'Route' },
    { value: 'tips', label: 'Tips' },
    { value: 'gear', label: 'Gear' },
  ]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate Editorial Article</h1>
      <p className="text-sm text-gray-500 mb-8">
        Create editorial content using AI. The article will be generated as a draft for review.
      </p>

      <Card>
        <CardContent className="space-y-6 py-6">
          {/* Content Brief */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Content Brief *
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={6}
              placeholder="Describe the article: key topics, data points, target audience, angle..."
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Be specific. Include facts, figures, and the angle you want the article to take.
            </p>
          </div>

          {/* Voice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Voice</label>
            <div className="flex gap-3">
              {(['inspirational', 'expert'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    voice === v
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {v === 'inspirational' ? 'Inspirational' : 'Expert'}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Target Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Destination <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="">None</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.canonicalName}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating article... (this takes 30-60s)' : 'Generate Article'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
