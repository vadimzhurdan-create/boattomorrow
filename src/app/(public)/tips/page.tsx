import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'

export const metadata: Metadata = {
  title: 'Sailing Tips',
  description: 'Expert sailing advice, seamanship tips, weather guidance, and practical know-how for life on the water.',
}

const ARTICLES_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{ region?: string; page?: string }>
}

export default async function TipsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const selectedRegion = params.region || undefined

  const where = {
    status: 'published' as const,
    category: 'tips' as const,
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sailing Tips</h1>
        <p className="mt-3 text-lg text-gray-600">
          Expert advice on seamanship, weather, maintenance, and on-board life.
        </p>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-6">
        {totalCount} {totalCount === 1 ? 'tip' : 'tips'} found
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tips found</h3>
          <p className="mt-2 text-gray-500">No sailing tips published yet. Check back soon!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/tips?${new URLSearchParams({
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
                href={`/tips?${new URLSearchParams({
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
                href={`/tips?${new URLSearchParams({
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
