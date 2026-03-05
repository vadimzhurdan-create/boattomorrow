'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { statusColors } from '@/lib/utils'
import { detectAIMarkers } from '@/lib/ai-detector'
import toast from 'react-hot-toast'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  metaTitle: string | null
  metaDescription: string | null
  category: string
  region: string | null
  tags: string[]
  status: string
  coverImageUrl: string | null
  imageUrls: string[]
}

const categoryOptions = [
  { value: 'destination', label: 'Destinations' },
  { value: 'route', label: 'Routes' },
  { value: 'boat', label: 'Boats' },
  { value: 'learning', label: 'Learning' },
  { value: 'tips', label: 'Tips' },
  { value: 'gear', label: 'Gear & Tech' },
]

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHumanizing, setIsHumanizing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // AI detection - computed from content
  const aiDetection = useMemo(() => {
    if (!content || content.length < 100) return { score: 100, issues: [] }
    return detectAIMarkers(content)
  }, [content])

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${articleId}`)
        if (!res.ok) {
          toast.error('Article not found')
          router.push('/supplier/articles')
          return
        }
        const data = await res.json()
        const a = data.data as Article
        setArticle(a)
        setTitle(a.title)
        setSlug(a.slug)
        setContent(a.content)
        setExcerpt(a.excerpt || '')
        setMetaTitle(a.metaTitle || '')
        setMetaDescription(a.metaDescription || '')
        setCategory(a.category)
        setRegion(a.region || '')
        setTagsInput((a.tags || []).join(', '))
        setCoverImageUrl(a.coverImageUrl || '')
        setImageUrls(a.imageUrls || [])
      } catch {
        toast.error('Failed to load article')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [articleId, router])

  const saveArticle = useCallback(async (showToast = true) => {
    setIsSaving(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          tags,
          coverImageUrl: coverImageUrl || null,
          imageUrls,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
        return
      }

      setLastSaved(new Date())
      setHasChanges(false)
      if (showToast) {
        toast.success('Article saved')
      }
    } catch {
      toast.error('Failed to save article')
    } finally {
      setIsSaving(false)
    }
  }, [articleId, title, content, excerpt, metaTitle, metaDescription, tagsInput, coverImageUrl, imageUrls])

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!hasChanges || !article) return

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveArticle(false)
    }, 5000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [hasChanges, saveArticle, article])

  function markChanged() {
    setHasChanges(true)
  }

  async function handleSubmitForReview() {
    // Save first
    await saveArticle(false)

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit for review')
        return
      }

      toast.success('Article submitted for review!')
      router.push('/supplier/articles')
    } catch {
      toast.error('Failed to submit for review')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleHumanize() {
    // Save current content first
    await saveArticle(false)

    setIsHumanizing(true)
    try {
      const res = await fetch('/api/quiz/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to humanize')
        return
      }

      const data = await res.json()
      setContent(data.data.content)
      setHasChanges(true)
      toast.success('Article humanized successfully')
    } catch {
      toast.error('Failed to humanize article')
    } finally {
      setIsHumanizing(false)
    }
  }

  async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        toast.error('Upload failed')
        return
      }

      const data = await res.json()
      if (data.url) {
        setCoverImageUrl(data.url)
        markChanged()
        toast.success('Cover image uploaded')
      }
    } catch {
      toast.error('Upload failed')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!article) return null

  const isEditable = article.status === 'draft' || article.status === 'rejected'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge className={statusColors[article.status] || 'bg-gray-100 text-gray-700'}>
              {article.status}
            </Badge>
            {lastSaved && (
              <span className="text-xs text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {hasChanges && (
              <span className="text-xs text-yellow-600 font-medium">Unsaved changes</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Editor' : 'Preview'}
          </Button>
          {isEditable && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveArticle(true)}
                isLoading={isSaving}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitForReview}
                isLoading={isSubmitting}
              >
                Submit for Review
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI Detection Warning */}
      {isEditable && content.length > 100 && aiDetection.score < 70 && (
        <div className="mb-6 border border-yellow-300 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">
                AI writing patterns detected (score: {aiDetection.score}/100)
              </p>
              <ul className="mt-2 text-xs text-yellow-700 space-y-1">
                {aiDetection.issues.map((issue) => (
                  <li key={issue.type}>
                    <span className="font-medium">{issue.type}:</span>{' '}
                    {issue.matches.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHumanize}
              isLoading={isHumanizing}
              className="ml-4 flex-shrink-0"
            >
              {isHumanizing ? 'Humanizing...' : 'Auto-humanize'}
            </Button>
          </div>
        </div>
      )}

      {/* AI Score Badge (good score) */}
      {isEditable && content.length > 100 && aiDetection.score >= 70 && (
        <div className="mb-6 border border-green-200 bg-green-50 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700">
            Content quality score: <span className="font-medium">{aiDetection.score}/100</span>
            {aiDetection.issues.length === 0 && ' \u2014 No AI patterns detected'}
          </p>
          {aiDetection.issues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHumanize}
              isLoading={isHumanizing}
              className="text-green-700"
            >
              Improve further
            </Button>
          )}
        </div>
      )}

      {showPreview ? (
        <Card>
          <CardContent className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
            {excerpt && <p className="text-lg text-gray-600 mb-6">{excerpt}</p>}
            <div className="prose prose-lg max-w-none">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.slice(3)}</h2>
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{line.slice(4)}</h3>
                }
                if (line.trim() === '') {
                  return <br key={i} />
                }
                return <p key={i} className="text-gray-700 mb-2">{line}</p>
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main content */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Content</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); markChanged() }}
                placeholder="Article title"
                disabled={!isEditable}
              />

              <Input
                label="Slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); markChanged() }}
                placeholder="article-url-slug"
                disabled
              />

              <Textarea
                label="Content (Markdown)"
                value={content}
                onChange={(e) => { setContent(e.target.value); markChanged() }}
                placeholder="Article content in Markdown..."
                rows={20}
                disabled={!isEditable}
              />

              <Textarea
                label="Excerpt"
                value={excerpt}
                onChange={(e) => { setExcerpt(e.target.value); markChanged() }}
                placeholder="Brief summary of the article..."
                rows={3}
                disabled={!isEditable}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">SEO</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Meta Title (max 60 chars)"
                value={metaTitle}
                onChange={(e) => { setMetaTitle(e.target.value); markChanged() }}
                placeholder="SEO title"
                maxLength={60}
                disabled={!isEditable}
              />
              <div className="text-xs text-gray-400 text-right">{metaTitle.length}/60</div>

              <Textarea
                label="Meta Description (max 160 chars)"
                value={metaDescription}
                onChange={(e) => { setMetaDescription(e.target.value); markChanged() }}
                placeholder="SEO description"
                rows={2}
                disabled={!isEditable}
              />
              <div className="text-xs text-gray-400 text-right">{metaDescription.length}/160</div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Classification</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => { setCategory(e.target.value); markChanged() }}
                options={categoryOptions}
                disabled={!isEditable}
              />

              <Input
                label="Region"
                value={region}
                onChange={(e) => { setRegion(e.target.value); markChanged() }}
                placeholder="e.g., Croatia, Mediterranean"
                disabled={!isEditable}
              />

              <Input
                label="Tags (comma-separated)"
                value={tagsInput}
                onChange={(e) => { setTagsInput(e.target.value); markChanged() }}
                placeholder="sailing, charter, croatia"
                disabled={!isEditable}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Images</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                {coverImageUrl ? (
                  <div className="relative">
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {isEditable && (
                      <button
                        onClick={() => { setCoverImageUrl(''); markChanged() }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                      >
                        X
                      </button>
                    )}
                  </div>
                ) : isEditable ? (
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                    />
                    <p className="text-sm text-gray-600">Click to upload cover image</p>
                  </label>
                ) : (
                  <p className="text-sm text-gray-400">No cover image</p>
                )}
              </div>

              {imageUrls.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery ({imageUrls.length} images)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {isEditable && (
                          <button
                            onClick={() => {
                              setImageUrls((prev) => prev.filter((_, i) => i !== idx))
                              markChanged()
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            X
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
