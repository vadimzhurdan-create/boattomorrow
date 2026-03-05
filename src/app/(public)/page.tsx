export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { Compass, Map, TrendingUp, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { SupplierCard } from '@/components/suppliers/SupplierCard'
import { SectionHeading } from '@/components/ui/SectionHeading'

export default async function HomePage() {
  const [
    featuredArticles,
    destinations,
    suppliers,
    articleCount,
    supplierCount,
    destinationCount,
  ] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published', isFeatured: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        region: true,
        coverImageUrl: true,
        publishedAt: true,
        readingTime: true,
        isEditorial: true,
        supplier: {
          select: { name: true, slug: true, type: true },
        },
      },
    }),
    prisma.destination.findMany({
      take: 5,
      orderBy: { canonicalName: 'asc' },
      select: {
        slug: true,
        canonicalName: true,
        heroImage: true,
        priceRange: true,
      },
    }),
    prisma.supplier.findMany({
      where: { profileStatus: 'published', status: 'active' },
      take: 3,
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
    prisma.supplier.count({ where: { status: 'active' } }),
    prisma.destination.count(),
  ])

  // If not enough featured, fall back to latest
  let editorsPicks = featuredArticles
  if (editorsPicks.length < 3) {
    editorsPicks = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        region: true,
        coverImageUrl: true,
        publishedAt: true,
        readingTime: true,
        isEditorial: true,
        supplier: {
          select: { name: true, slug: true, type: true },
        },
      },
    })
  }

  const threeWays = [
    {
      title: 'Never sailed before?',
      desc: 'Everything you need to know to get started — from picking a boat to stepping aboard.',
      href: '/start',
      Icon: Compass,
    },
    {
      title: 'Planning your next charter?',
      desc: 'Find your perfect destination, compare routes, and discover local suppliers.',
      href: '/destinations',
      Icon: Map,
    },
    {
      title: 'Level up your sailing',
      desc: 'Courses, certifications, gear reviews, and expert tips from seasoned sailors.',
      href: '/learning',
      Icon: TrendingUp,
    },
  ]

  return (
    <div>
      {/* Hero — sea-horizon gradient */}
      <section
        className="relative min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{
          background: 'linear-gradient(180deg, #1B3A5C 0%, #2E6B8A 40%, #4A9BB5 70%, #E8DCC8 90%, #FAFAF8 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 md:py-32">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.15em] font-semibold text-white/60 mb-6">
              boat tomorrow
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white">
              The sea is closer<br />
              than you think
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/80 font-light max-w-lg">
              Ideas, guides, and trusted suppliers for your next life on water.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/start"
                className="inline-block bg-[#E8500A] text-white px-8 py-3.5 rounded-lg text-base font-semibold tracking-wide hover:bg-[#D04500] transition-colors text-center shadow-sm hover:shadow-md"
              >
                Start Here <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
              <Link
                href="/destinations"
                className="inline-block border-2 border-white/40 text-white px-8 py-3.5 rounded-lg text-base font-semibold tracking-wide hover:bg-white/10 transition-colors text-center"
              >
                Explore Destinations <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Ways In */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {threeWays.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group block border border-border bg-bg-alt p-8 min-h-[220px] rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px] hover:border-l-4 hover:border-l-[#E8500A]"
            >
              <card.Icon className="w-12 h-12 text-[#E8500A] mb-5 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-2xl font-bold text-text group-hover:text-[#E8500A] transition-colors mb-2">
                {card.title}
              </h3>
              <p className="text-base text-muted leading-relaxed mb-4">{card.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold tracking-wide uppercase text-[#E8500A] border-b-2 border-[#E8500A] pb-1 group-hover:text-[#111] group-hover:border-[#111] transition-colors duration-200">
                Start Here
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Worth Reading (Editor's Picks) */}
      {editorsPicks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 section-animate">
          <SectionHeading label="Editor's Picks" viewAllHref="/articles">Worth Reading</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {editorsPicks.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Destinations */}
      {destinations.length > 0 && (
        <section className="py-20 md:py-28 bg-bg-alt section-animate">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading label="Destinations" viewAllHref="/destinations">Trending Destinations</SectionHeading>
            <div className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
              {destinations.map((dest) => {
                const priceRange = dest.priceRange as { low?: number; currency?: string } | null
                return (
                  <Link
                    key={dest.slug}
                    href={`/destinations/${dest.slug}`}
                    className="group flex-shrink-0 w-[220px] md:w-auto block overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {dest.heroImage ? (
                        <Image
                          src={dest.heroImage}
                          alt={dest.canonicalName}
                          width={400}
                          height={533}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(180deg, #1B3A5C 0%, #2E6B8A 50%, #4A9BB5 100%)',
                          }}
                        >
                          <span className="text-white/20 text-6xl font-display font-light">
                            {dest.canonicalName.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Gradient overlay for text */}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.7))' }} />
                      {/* Text on photo */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-display text-2xl font-bold text-white">
                          {dest.canonicalName}
                        </h3>
                        {priceRange?.low && (
                          <p className="text-sm text-white/80 mt-1">
                            from &euro;{priceRange.low}/week
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Platform Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 py-16 border-b border-border section-animate">
          <div>
            <span className="block font-display text-5xl font-bold text-text">{articleCount}</span>
            <span className="text-sm uppercase tracking-widest text-muted-light mt-1 block">published articles</span>
          </div>
          <div>
            <span className="block font-display text-5xl font-bold text-text">{supplierCount}</span>
            <span className="text-sm uppercase tracking-widest text-muted-light mt-1 block">trusted suppliers</span>
          </div>
          <div>
            <span className="block font-display text-5xl font-bold text-text">{destinationCount}</span>
            <span className="text-sm uppercase tracking-widest text-muted-light mt-1 block">sailing destinations</span>
          </div>
        </div>
      </section>

      {/* Featured Suppliers */}
      {suppliers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 section-animate">
          <SectionHeading label="Partners" viewAllHref="/suppliers">Suppliers</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.slug} supplier={supplier} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="my-16 bg-bg-alt border border-border rounded-lg p-8 md:p-16 text-center section-animate">
          <p className="text-sm text-muted mb-2">
            Are you a charter company?{' '}
            <Link href="/join" className="text-accent hover:text-[#D04500] font-medium transition-colors inline-flex items-center gap-1">
              Join BOATTOMORROW <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
