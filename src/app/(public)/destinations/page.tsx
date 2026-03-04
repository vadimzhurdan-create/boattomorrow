import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'

export const metadata: Metadata = {
  title: 'Sailing Destinations',
  description: 'Explore the world\'s best sailing destinations, anchorages, and cruising grounds.',
}

const ARTICLES_PER_PAGE = 12

const regions = [
  'Mediterranean',
  'Caribbean',
  'Southeast Asia',
  'Pacific Islands',
  'Northern Europe',
  'Indian Ocean',
]

interface PageProps {
  searchParams: Promise<{ region?: string; page?: string }>
}

export default async function DestinationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const selectedRegion = params.region || undefined

  const where = {
    status: 'published' as const,
    category: 'destination' as const,
    ...(selectedRegion ? { region: selectedRegion } : {}),
  }

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (currentPage - 1) * ARTICLES_PER_PAGE,
      take: ARTICLES_PER_PAGE,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        region: true,
        coverImageUrl: true,
        publishedAt: true,
        supplier: {
          select: { name: true, slug: true, type: true },
        },
      },
    }),
    prisma.article.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-2xl font-light font-body tracking-tight">
          <span className="text-accent mr-1">/</span> destinations
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/destinations"
          className={`px-3 py-1.5 text-xs border transition-all ${
            !selectedRegion
              ? 'bg-text text-bg border-text'
              : 'bg-transparent text-text border-border hover:bg-text hover:text-bg hover:border-text'
          }`}
        >
          All Regions
        </Link>
        {regions.map((region) => (
          <Link
            key={region}
            href={`/destinations?region=${encodeURIComponent(region)}`}
            className={`px-3 py-1.5 text-xs border transition-all ${
              selectedRegion === region
                ? 'bg-text text-bg border-text'
                : 'bg-transparent text-text border-border hover:bg-text hover:text-bg hover:border-text'
            }`}
          >
            {region}
          </Link>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-muted uppercase tracking-widest mb-8">
        {totalCount} {totalCount === 1 ? 'article' : 'articles'}
        {selectedRegion && ` in ${selectedRegion}`}
      </p>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <>
          {articles.length > 0 && currentPage === 1 && (
            <div className="mb-8">
              <ArticleCard article={articles[0]} featured />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(currentPage === 1 ? articles.slice(1) : articles).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-24 border-t border-border">
          <h3 className="font-display text-xl font-light mb-2">No articles found</h3>
          <p className="text-sm text-muted">
            {selectedRegion
              ? `No destinations in ${selectedRegion} yet.`
              : 'No destinations published yet. Check back soon!'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-16 flex justify-center">
          <div className="flex items-center gap-1">
            {currentPage > 1 && (
              <Link
                href={`/destinations?${new URLSearchParams({
                  ...(selectedRegion ? { region: selectedRegion } : {}),
                  page: String(currentPage - 1),
                }).toString()}`}
                className="px-4 py-2 text-xs text-muted border border-border hover:bg-text hover:text-bg hover:border-text transition-all"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/destinations?${new URLSearchParams({
                  ...(selectedRegion ? { region: selectedRegion } : {}),
                  page: String(page),
                }).toString()}`}
                className={`px-4 py-2 text-xs border transition-all ${
                  page === currentPage
                    ? 'bg-text text-bg border-text'
                    : 'text-muted border-border hover:bg-text hover:text-bg hover:border-text'
                }`}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={`/destinations?${new URLSearchParams({
                  ...(selectedRegion ? { region: selectedRegion } : {}),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="px-4 py-2 text-xs text-muted border border-border hover:bg-text hover:text-bg hover:border-text transition-all"
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
