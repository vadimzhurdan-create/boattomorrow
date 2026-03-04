'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, statusColors, categoryLabels } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: string
  status: string
  region: string | null
  createdAt: string
  supplier: {
    name: string
    slug: string
    type: string
  }
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('review')
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [statusFilter])

  async function fetchArticles() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter) {
        params.set('status', statusFilter)
      }

      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()
      setArticles(data.data || [])
    } catch {
      toast.error('Failed to fetch articles')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApprove(articleId: string) {
    if (!confirm('Are you sure you want to approve this article? It will be published immediately.')) return

    setActionLoading(articleId)
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })

      if (!res.ok) throw new Error('Failed to approve')

      toast.success('Article approved and published')
      fetchArticles()
      setPreviewArticle(null)
    } catch {
      toast.error('Failed to approve article')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(articleId: string) {
    if (!confirm('Are you sure you want to reject this article?')) return

    setActionLoading(articleId)
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!res.ok) throw new Error('Failed to reject')

      toast.success('Article rejected')
      fetchArticles()
      setPreviewArticle(null)
    } catch {
      toast.error('Failed to reject article')
    } finally {
      setActionLoading(null)
    }
  }

  const statusTabs = [
    { value: '', label: 'All' },
    { value: 'review', label: 'Pending Review' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Drafts' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Article Moderation</h1>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preview modal */}
      {previewArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{previewArticle.title}</h2>
                <p className="text-xs text-gray-500">
                  by {previewArticle.supplier.name} / {categoryLabels[previewArticle.category]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {previewArticle.status === 'review' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(previewArticle.id)}
                      isLoading={actionLoading === previewArticle.id}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(previewArticle.id)}
                      isLoading={actionLoading === previewArticle.id}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-6">
              {previewArticle.excerpt && (
                <p className="text-gray-600 italic mb-4">{previewArticle.excerpt}</p>
              )}
              <div className="prose prose-sm max-w-none">
                {previewArticle.content.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.slice(3)}</h2>
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-base font-semibold text-gray-900 mt-3 mb-1">{line.slice(4)}</h3>
                  }
                  if (line.trim() === '') return <br key={i} />
                  return <p key={i} className="text-gray-700 mb-2">{line}</p>
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No articles found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article.id} hover>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={statusColors[article.status] || 'bg-gray-100 text-gray-700'}>
                        {article.status}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-600">
                        {categoryLabels[article.category] || article.category}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        by {article.supplier.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(article.createdAt)}
                      </span>
                      {article.region && (
                        <span className="text-xs text-gray-400">{article.region}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewArticle(article)}
                    >
                      Preview
                    </Button>
                    {article.status === 'review' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(article.id)}
                          isLoading={actionLoading === article.id}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(article.id)}
                          isLoading={actionLoading === article.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
