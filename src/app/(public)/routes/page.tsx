import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'

export const metadata: Metadata = {
  title: 'Sailing Routes',
  description: 'Discover curated sailing itineraries, passage plans, and route guides for your next voyage.',
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

export default async function RoutesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const selectedRegion = params.region || undefined

  const where = {
    status: 'published' as const,
    category: 'route' as const,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sailing Routes</h1>
        <p className="mt-3 text-lg text-gray-600">
          Curated itineraries and passage plans for unforgettable voyages at sea.
        </p>
      </div>

      {/* Region Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/routes"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedRegion
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Regions
        </Link>
        {regions.map((region) => (
          <Link
            key={region}
            href={`/routes?region=${encodeURIComponent(region)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedRegion === region
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {region}
          </Link>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-6">
        {totalCount} {totalCount === 1 ? 'route' : 'routes'} found
        {selectedRegion && ` in ${selectedRegion}`}
      </p>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No routes found</h3>
          <p className="mt-2 text-gray-500">
            {selectedRegion
              ? `No routes in ${selectedRegion} yet. Try another region.`
              : 'No sailing routes published yet. Check back soon!'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/routes?${new URLSearchParams({
                  ...(selectedRegion ? { region: selectedRegion } : {}),
                  page: String(currentPage - 1),
                }).toString()}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/routes?${new URLSearchParams({
                  ...(selectedRegion ? { region: selectedRegion } : {}),
                  page: String(page),
                }).toString()}`}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  page === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={`/routes?${new URLSearchParams({
                  ...(selectedRegion ? { region: selectedRegion } : {}),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
