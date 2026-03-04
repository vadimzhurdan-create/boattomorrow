import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '../ui/Badge'
import { categoryLabels } from '@/lib/utils'

interface ArticleCardProps {
  article: {
    slug: string
    title: string
    excerpt: string | null
    category: string
    region: string | null
    coverImageUrl: string | null
    publishedAt: string | Date | null
    supplier?: {
      name: string
      slug: string
      type: string
    }
  }
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-48 bg-gray-100">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary-100 text-primary-700">
              {categoryLabels[article.category] || article.category}
            </Badge>
            {article.region && (
              <span className="text-xs text-gray-500">{article.region}</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
          )}
          {article.supplier && (
            <p className="mt-3 text-xs text-gray-500">
              by {article.supplier.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
