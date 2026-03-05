export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
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

  return (
    <div>
      {/* Hero — full-width gradient */}
      <section className="relative bg-gradient-to-br from-[#0a2e4a] via-[#0d3b5e] to-[#1a5276] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
              <span className="text-[#E8500A]">/</span> boat tomorrow
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight">
              The sea is closer<br />
              than you think
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/70 font-light max-w-lg">
              Ideas, guides, and trusted suppliers for your next life on water.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/start"
                className="inline-block bg-[#E8500A] text-white px-8 py-3.5 text-sm font-medium tracking-wide hover:opacity-85 transition-opacity text-center"
              >
                Start Here &rarr;
              </Link>
              <Link
                href="/destinations"
                className="inline-block border border-white/30 text-white px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-white/10 transition-colors text-center"
              >
                Explore Destinations &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Ways In */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Never sailed before?',
              desc: 'Everything you need to know',
              href: '/start',
              accent: true,
            },
            {
              title: 'Planning your next charter?',
              desc: 'Find your perfect destination',
              href: '/destinations',
              accent: false,
            },
            {
              title: 'Level up your sailing',
              desc: 'Courses, boats, and expert tips',
              href: '/learning',
              accent: false,
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group block border p-6 transition-colors ${
                card.accent
                  ? 'border-accent/30 bg-accent/5 hover:bg-accent/10'
                  : 'border-border hover:border-accent/30 hover:bg-bg-alt'
              }`}
            >
              <h3 className="text-base font-medium text-text group-hover:text-accent transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-muted mt-1">{card.desc}</p>
              <span className="inline-block mt-3 text-xs text-accent uppercase tracking-widest">
                Read more &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Worth Reading (Editor&apos;s Picks) */}
      {editorsPicks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 section-animate">
          <SectionHeading>Worth Reading</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {editorsPicks.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Destinations */}
      {destinations.length > 0 && (
        <section className="py-12 bg-bg-alt section-animate">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading viewAllHref="/destinations">Trending Destinations</SectionHeading>
            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
              {destinations.map((dest) => {
                const priceRange = dest.priceRange as { low?: number; currency?: string } | null
                return (
                  <Link
                    key={dest.slug}
                    href={`/destinations/${dest.slug}`}
                    className="group flex-shrink-0 w-[200px] md:w-auto block border border-border bg-bg overflow-hidden hover:border-accent/30 transition-colors"
                  >
                    <div className="aspect-[3/2] bg-gradient-to-br from-[#0a2e4a] to-[#1a5276] flex items-center justify-center overflow-hidden">
                      {dest.heroImage ? (
                        <Image
                          src={dest.heroImage}
                          alt={dest.canonicalName}
                          width={400}
                          height={267}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span className="text-white/20 text-4xl font-display font-light">
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
        </section>
      )}

      {/* Platform Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 py-10 border-b border-border section-animate">
          <div>
            <span className="block font-display text-4xl font-light">{articleCount}</span>
            <span className="text-xs uppercase tracking-widest text-muted">published articles</span>
          </div>
          <div>
            <span className="block font-display text-4xl font-light">{supplierCount}</span>
            <span className="text-xs uppercase tracking-widest text-muted">trusted suppliers</span>
          </div>
          <div>
            <span className="block font-display text-4xl font-light">{destinationCount}</span>
            <span className="text-xs uppercase tracking-widest text-muted">sailing destinations</span>
          </div>
        </div>
      </section>

      {/* Featured Suppliers */}
      {suppliers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 section-animate">
          <SectionHeading viewAllHref="/suppliers">suppliers</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.slug} supplier={supplier} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="my-16 bg-bg-alt border border-border p-8 md:p-16 text-center section-animate">
          <h2 className="font-display text-2xl md:text-3xl font-light mb-3">
            Join BOATTOMORROW
          </h2>
          <p className="text-muted max-w-md mx-auto mb-8 text-sm">
            Are you a charter company, boat manufacturer, or sailing school?
            Reach thousands of sailing enthusiasts.
          </p>
          <Link
            href="/register"
            className="inline-block bg-accent text-white px-8 py-3 text-sm font-medium tracking-wide hover:opacity-85 transition-opacity"
          >
            Register as a Supplier
          </Link>
        </div>
      </section>
    </div>
  )
}
