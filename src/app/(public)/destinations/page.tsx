import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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

  // Destination hub cards
  const destinationHubs = await prisma.destination.findMany({
    orderBy: { canonicalName: 'asc' },
    select: {
      slug: true,
      canonicalName: true,
      heroImage: true,
      priceRange: true,
      description: true,
    },
  })

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

      {/* Destination Hubs */}
      {destinationHubs.length > 0 && !selectedRegion && currentPage === 1 && (
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted mb-4">
            <span className="text-accent">/</span> sailing regions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {destinationHubs.map((dest) => {
              const priceRange = dest.priceRange as { low?: number; currency?: string } | null
              return (
                <Link
                  key={dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="group block border border-border overflow-hidden hover:border-accent/30 transition-colors"
                >
                  <div className="aspect-[3/2] bg-gradient-to-br from-[#0a2e4a] to-[#1a5276] flex items-center justify-center overflow-hidden">
                    {dest.heroImage ? (
                      <Image
                        src={dest.heroImage}
                        alt={dest.canonicalName}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-white/20 text-3xl font-display font-light">
                        {dest.canonicalName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-text group-hover:text-accent transition-colors truncate">
                      {dest.canonicalName}
                    </h3>
                    {priceRange?.low && (
                      <p className="text-xs text-accent mt-0.5">
                        from &euro;{priceRange.low}/week
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

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
