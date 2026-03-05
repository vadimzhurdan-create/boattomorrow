'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface SocialPost {
  type: string
  text: string
}

interface Props {
  article: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    coverImageUrl: string | null
    socialPosts: SocialPost[] | null
    publishedAt: Date | null
  }
  siteUrl: string
}

const postTypeLabels: Record<string, string> = {
  informational: 'Informational',
  engaging: 'Engaging',
  expert: 'Expert',
}

export function DistributionArticle({ article, siteUrl }: Props) {
  const [posts, setPosts] = useState<SocialPost[] | null>(article.socialPosts)
  const [isGenerating, setIsGenerating] = useState(false)

  const articleUrl = `${siteUrl}/articles/${article.slug}`

  async function generatePosts() {
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/articles/${article.id}/social-posts`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed')
      const { data } = await res.json()
      setPosts(data)
      toast.success('Social posts generated!')
    } catch {
      toast.error('Failed to generate posts')
    } finally {
      setIsGenerating(false)
    }
  }

  function copyToClipboard(text: string) {
    const fullText = `${text}\n\n${articleUrl}`
    navigator.clipboard.writeText(fullText)
    toast.success('Copied to clipboard!')
  }

  function downloadCover() {
    if (!article.coverImageUrl) return
    window.open(article.coverImageUrl, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{article.title}</h3>
            <p className="text-xs text-gray-500 mt-1 truncate">{articleUrl}</p>
          </div>
          <div className="flex gap-2 ml-4">
            {article.coverImageUrl && (
              <button
                onClick={downloadCover}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Download Cover
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!posts ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-4">
              Generate 3 ready-made social media post variants for this article.
            </p>
            <button
              onClick={generatePosts}
              disabled={isGenerating}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Social Posts'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">
                    {postTypeLabels[post.type] || post.type}
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{post.text}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(post.text)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            ))}
            <button
              onClick={generatePosts}
              disabled={isGenerating}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate posts'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
