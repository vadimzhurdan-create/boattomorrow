import Image from 'next/image'
import Link from 'next/link'

interface ArticleCardProps {
  article: {
    slug: string
    title: string
    excerpt?: string | null
    category: string
    region?: string | null
    coverImageUrl: string | null
    publishedAt?: string | Date | null
    supplier?: {
      name: string
      slug: string
      type: string
    }
  }
  featured?: boolean
}

export function ArticleCard({ article, featured }: ArticleCardProps) {
  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="overflow-hidden" style={{ aspectRatio: '16/9' }}>
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
          <p className="text-xs uppercase tracking-widest text-muted mb-2">
            <span>{article.category}</span>
            {article.supplier && (
              <>
                <span className="mx-2 text-accent">/</span>
                <span>by {article.supplier.name}</span>
              </>
            )}
          </p>
          <h3 className="font-display text-display-md transition-opacity duration-200 group-hover:opacity-60">
            {article.title}
          </h3>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <div className="overflow-hidden" style={{ aspectRatio: '4/3' }}>
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
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-muted">
        <span>{article.category}</span>
        {article.supplier && (
          <>
            <span className="mx-2 text-accent">/</span>
            <span>by {article.supplier.name}</span>
          </>
        )}
      </p>
      <h3 className="mt-1 text-base font-medium font-body text-text transition-opacity duration-200 group-hover:opacity-60 line-clamp-2">
        {article.title}
      </h3>
    </Link>
  )
}
