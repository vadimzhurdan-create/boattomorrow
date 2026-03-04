export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { SupplierCard } from '@/components/suppliers/SupplierCard'

const categories = [
  {
    href: '/destinations',
    name: 'Destinations',
    description: 'Explore the world\'s best sailing regions and anchorages.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/boats',
    name: 'Yachts & Boats',
    description: 'Reviews and guides on the latest yachts and sailboats.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17h18M3 17l3-14h12l3 14M8 3l-1 6m9-6l1 6" />
      </svg>
    ),
  },
  {
    href: '/learning',
    name: 'Sailing Education',
    description: 'Courses and certifications to advance your sailing skills.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: '/routes',
    name: 'Sailing Routes',
    description: 'Curated itineraries for unforgettable voyages at sea.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    href: '/tips',
    name: 'Sailing Tips',
    description: 'Expert advice on seamanship, weather, and on-board life.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    href: '/gear',
    name: 'Gear & Tech',
    description: 'Navigation tools, safety equipment, and marine technology.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default async function HomePage() {
  const [latestArticles, suppliers, articleCount, supplierCount, destinationCount] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
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
    prisma.supplier.findMany({
      where: { profileStatus: 'published' },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        slug: true,
        name: true,
        type: true,
        tagline: true,
        logoUrl: true,
        regions: true,
      },
    }),
    prisma.article.count({ where: { status: 'published' } }),
    prisma.supplier.count({ where: { profileStatus: 'published' } }),
    prisma.article.count({ where: { status: 'published', category: 'destination' } }),
  ])

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Discover Your Next Sailing Adventure
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-100 max-w-2xl">
              Your gateway to the yachting world. Explore destinations, compare charter companies,
              find the perfect boat, and learn to sail with trusted partners worldwide.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/destinations"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors shadow-lg"
              >
                Explore Destinations
              </Link>
              <Link
                href="/suppliers"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                Browse Suppliers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
          <p className="mt-3 text-lg text-gray-600">Everything you need for life on the water</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
                <p className="mt-3 text-lg text-gray-600">Fresh content from our sailing community</p>
              </div>
              <Link
                href="/destinations"
                className="hidden sm:inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Suppliers */}
      {suppliers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Suppliers</h2>
              <p className="mt-3 text-lg text-gray-600">Trusted partners in the yachting industry</p>
            </div>
            <Link
              href="/suppliers"
              className="hidden sm:inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.slug} supplier={supplier} />
            ))}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">{articleCount}</div>
              <div className="mt-2 text-primary-200">Published Articles</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{supplierCount}</div>
              <div className="mt-2 text-primary-200">Trusted Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{destinationCount}</div>
              <div className="mt-2 text-primary-200">Sailing Destinations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold">Join BOATTOMORROW</h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
            Are you a yacht charter company, boat manufacturer, or sailing school?
            Reach thousands of sailing enthusiasts and grow your business with BOATTOMORROW.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors shadow-lg"
          >
            Register as a Supplier
          </Link>
        </div>
      </section>
    </>
  )
}
