export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { SupplierCard } from '@/components/suppliers/SupplierCard'
import { SectionHeading } from '@/components/ui/SectionHeading'

export default async function HomePage() {
  const [latestArticles, destinationArticles, boatArticles, suppliers, articleCount, supplierCount, destinationCount] = await Promise.all([
    prisma.article.findMany({
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
        supplier: {
          select: { name: true, slug: true, type: true },
        },
      },
    }),
    prisma.article.findMany({
      where: { status: 'published', category: 'destination' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        slug: true,
        title: true,
        category: true,
        coverImageUrl: true,
        supplier: { select: { name: true, slug: true, type: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: 'published', category: 'boat' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        slug: true,
        title: true,
        category: true,
        coverImageUrl: true,
        supplier: { select: { name: true, slug: true, type: true } },
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
    prisma.supplier.count({ where: { profileStatus: 'published', status: 'active' } }),
    prisma.article.count({ where: { status: 'published', category: 'destination' } }),
  ])

  const featured = latestArticles[0]
  const restArticles = latestArticles.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-8 md:gap-16 py-16 md:py-24 border-b border-border">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-6">
            <span className="text-accent">/</span> boat tomorrow
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight">
            Discover your next<br />
            sailing adventure
          </h1>
          <p className="mt-6 text-base text-muted font-light max-w-sm">
            Ideas and guides for life on water.
          </p>
        </div>

        {featured && (
          <Link href={`/articles/${featured.slug}`} className="group block">
            <div className="overflow-hidden" style={{ aspectRatio: '4/3' }}>
              {featured.coverImageUrl ? (
                <Image
                  src={featured.coverImageUrl}
                  alt={featured.title}
                  width={900}
                  height={675}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-bg-alt" />
              )}
            </div>
            <p className="mt-3 text-xs uppercase tracking-widest text-muted">
              <span className="text-accent">/</span> {featured.category}
            </p>
            <h2 className="mt-1 font-display text-xl md:text-2xl font-light transition-opacity duration-200 group-hover:opacity-60">
              {featured.title}
            </h2>
            {featured.supplier && (
              <p className="mt-1 text-xs text-muted">by {featured.supplier.name}</p>
            )}
          </Link>
        )}
      </section>

      {/* / latest */}
      {restArticles.length > 0 && (
        <section className="py-12 section-animate">
          <SectionHeading viewAllHref="/destinations">latest</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Stats row */}
      <section className="flex flex-col sm:flex-row gap-8 sm:gap-16 py-10 border-t border-b border-border section-animate">
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
      </section>

      {/* / destinations */}
      {destinationArticles.length > 0 && (
        <section className="py-12 section-animate">
          <SectionHeading viewAllHref="/destinations">destinations</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinationArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* / boats */}
      {boatArticles.length > 0 && (
        <section className="py-12 section-animate">
          <SectionHeading viewAllHref="/boats">boats</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {boatArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* / suppliers */}
      {suppliers.length > 0 && (
        <section className="py-12 section-animate">
          <SectionHeading viewAllHref="/suppliers">suppliers</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.slug} supplier={supplier} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="my-16 bg-bg-alt border border-border p-8 md:p-16 text-center section-animate">
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
      </section>
    </div>
  )
}
