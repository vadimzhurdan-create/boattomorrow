import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'

export const metadata: Metadata = {
  title: 'Sailing Education',
  description: 'Discover sailing courses, certifications, and educational resources. From beginner to advanced, find the right program for you.',
}

const ARTICLES_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{ region?: string; page?: string }>
}

export default async function LearningPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const selectedRegion = params.region || undefined

  const where = {
    status: 'published' as const,
    category: 'learning' as const,
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sailing Education</h1>
        <p className="mt-3 text-lg text-gray-600">
          Courses, certifications, and resources to advance your sailing skills.
        </p>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-6">
        {totalCount} {totalCount === 1 ? 'course' : 'courses'} found
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No courses found</h3>
          <p className="mt-2 text-gray-500">No sailing education articles published yet. Check back soon!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/learning?${new URLSearchParams({
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
                href={`/learning?${new URLSearchParams({
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
                href={`/learning?${new URLSearchParams({
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
