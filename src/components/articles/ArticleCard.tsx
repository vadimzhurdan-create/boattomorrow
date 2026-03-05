import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'

interface ArticleCardProps {
  article: {
    slug: string
    title: string
    excerpt?: string | null
    category: string
    region?: string | null
    coverImageUrl: string | null
    publishedAt?: string | Date | null
    readingTime?: number | null
    difficulty?: string | null
    isEditorial?: boolean
    supplier?: {
      name: string
      slug: string
      type: string
    } | null
  }
  featured?: boolean
}

export function ArticleCard({ article, featured }: ArticleCardProps) {
  const authorName = article.isEditorial && !article.supplier
    ? 'BOATTOMORROW Editorial'
    : article.supplier?.name

  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              width={1200}
              height={675}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full bg-bg-alt flex items-center justify-center text-muted">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#111] text-white text-xs uppercase tracking-wide px-2 py-1 rounded">
              {article.category}
            </span>
            {article.readingTime && (
              <span className="flex items-center gap-1 text-xs text-muted-light">
                <Clock className="w-3 h-3" />
                {article.readingTime} min
              </span>
            )}
          </div>
          <h3 className="font-display text-display-md transition-colors duration-200 group-hover:text-[#E8500A]">
            {article.title}
          </h3>
          {authorName && (
            <p className="text-xs text-muted-light mt-2">by {authorName}</p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/articles/${article.slug}`} className="group block transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px] rounded-lg overflow-hidden">
      <div className="overflow-hidden relative" style={{ aspectRatio: '4/3' }}>
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            width={600}
            height={450}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-bg-alt flex items-center justify-center text-muted">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-[#111] text-white text-xs uppercase tracking-wide px-2 py-1 rounded">
          {article.category}
        </span>
        {/* Difficulty badge */}
        {article.difficulty === 'beginner' && (
          <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
            Beginner-friendly
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {article.readingTime && (
            <span className="flex items-center gap-1 text-xs text-muted-light">
              <Clock className="w-3 h-3" />
              {article.readingTime} min read
            </span>
          )}
          {authorName && (
            <span className="text-xs text-muted-light">
              by {authorName}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-text transition-colors duration-200 group-hover:text-[#E8500A] line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-muted mt-1 line-clamp-2">{article.excerpt}</p>
        )}
      </div>
    </Link>
  )
}
