'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, statusColors, categoryLabels } from '@/lib/utils'

interface Article {
  id: string
  title: string
  slug: string
  category: string
  status: string
  region: string | null
  coverImageUrl: string | null
  createdAt: string
  updatedAt: string
  viewsCount: number
  leadsCount: number
}

export default function SupplierArticlesPage() {
  const { data: session } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    async function fetchArticles() {
      if (!session?.user) return
      setIsLoading(true)

      try {
        const params = new URLSearchParams({
          supplierId: (session.user as any).supplierId,
          limit: '50',
        })
        if (statusFilter) {
          params.set('status', statusFilter)
        }

        const res = await fetch(`/api/articles?${params}`)
        const data = await res.json()
        setArticles(data.data || [])
      } catch {
        console.error('Failed to fetch articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [session, statusFilter])

  const statusTabs = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'review', label: 'In Review' },
    { value: 'published', label: 'Published' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Articles</h1>
        <Link href="/supplier/quiz" className="mt-3 sm:mt-0">
          <Button>Create New Article</Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 mb-2">No articles found</p>
            <Link href="/supplier/quiz">
              <Button variant="outline">Create Your First Article</Button>
            </Link>
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
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">{formatDate(article.createdAt)}</span>
                      {article.region && (
                        <span className="text-xs text-gray-500">{article.region}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {article.viewsCount} views / {article.leadsCount} leads
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {(article.status === 'draft' || article.status === 'rejected') && (
                      <Link href={`/supplier/articles/${article.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    )}
                    {article.status === 'published' && (
                      <Link href={`/articles/${article.slug}`} target="_blank">
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    )}
                    {article.status === 'review' && (
                      <span className="text-xs text-yellow-600 font-medium self-center">
                        Awaiting review
                      </span>
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
