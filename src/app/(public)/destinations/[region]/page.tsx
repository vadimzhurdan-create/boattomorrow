import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { SupplierCard } from '@/components/suppliers/SupplierCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface PageProps {
  params: Promise<{ region: string }>
}

interface QuickFacts {
  season?: string
  temperature?: string
  currency?: string
  language?: string
  mainMarinas?: string[]
}

interface SeasonEntry {
  month: string
  rating: 'peak' | 'good' | 'shoulder' | 'off'
  avgTemp?: string
  note?: string
}

interface PriceRange {
  low: number
  high: number
  currency: string
  unit: string
}

interface FaqItem {
  q: string
  a: string
}

const seasonColors: Record<string, string> = {
  peak: 'bg-accent/80 text-white',
  good: 'bg-green-500/70 text-white',
  shoulder: 'bg-yellow-400/70 text-gray-800',
  off: 'bg-gray-200 text-gray-500',
}

const seasonLabels: Record<string, string> = {
  peak: 'Peak',
  good: 'Good',
  shoulder: 'Shoulder',
  off: 'Off',
}

async function getData(regionSlug: string) {
  const searchTerm = decodeURIComponent(regionSlug).replace(/-/g, ' ')

  // Try to find a Destination record first
  const destination = await prisma.destination.findFirst({
    where: {
      OR: [
        { slug: regionSlug },
        { canonicalName: { contains: searchTerm, mode: 'insensitive' } },
        { aliases: { has: searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1) } },
      ],
    },
  })

  // Get articles for this region
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      region: { contains: searchTerm, mode: 'insensitive' },
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      region: true,
      coverImageUrl: true,
      publishedAt: true,
      faqItems: true,
      supplier: {
        select: { name: true, slug: true, type: true },
      },
    },
  })

  // Get suppliers for this region
  const suppliers = await prisma.supplier.findMany({
    where: {
      status: 'active',
      profileStatus: 'published',
      regions: { hasSome: [searchTerm, searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)] },
    },
    take: 6,
    select: {
      slug: true,
      name: true,
      type: true,
      tagline: true,
      logoUrl: true,
      regions: true,
    },
  })

  return { destination, articles, suppliers }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region } = await params
  const regionSlug = decodeURIComponent(region)
  const { destination } = await getData(regionSlug)

  const searchTerm = regionSlug.replace(/-/g, ' ')
  const displayName = searchTerm.replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    title: destination?.metaTitle || `Sailing in ${displayName}: Complete Guide 2026`,
    description:
      destination?.metaDescription ||
      `Everything about sailing in ${displayName}: best routes, seasons, costs, marinas, and trusted charter companies. Expert guides from verified suppliers.`,
  }
}

export default async function DestinationMegaPage({ params }: PageProps) {
  const { region } = await params
  const regionSlug = decodeURIComponent(region)
  const { destination, articles, suppliers } = await getData(regionSlug)

  if (articles.length === 0 && !destination) {
    notFound()
  }

  const searchTerm = regionSlug.replace(/-/g, ' ')
  const displayName = searchTerm.replace(/\b\w/g, (c) => c.toUpperCase())
  const actualRegion = articles[0]?.region || destination?.canonicalName || displayName
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  // Parse destination data
  const quickFacts = (destination?.quickFacts as QuickFacts | null) || null
  const seasonData = (destination?.seasonData as SeasonEntry[] | null) || null
  const priceRange = (destination?.priceRange as PriceRange | null) || null

  // Aggregate FAQs from all articles
  const allFaqs: FaqItem[] = []
  articles.forEach((a) => {
    const faqs = (a.faqItems as FaqItem[] | null) || []
    allFaqs.push(...faqs)
  })
  const uniqueFaqs = allFaqs.slice(0, 8)

  // Group articles
  const destinations = articles.filter((a) => a.category === 'destination')
  const routes = articles.filter((a) => a.category === 'route')
  const others = articles.filter((a) => a.category !== 'destination' && a.category !== 'route')

  // JSON-LD
  const hubJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Sailing in ${actualRegion}: Complete Guide`,
    description: destination?.answerCapsule || `Comprehensive sailing guide for ${actualRegion}`,
    url: `${siteUrl}/destinations/${region}`,
    isPartOf: { '@type': 'WebSite', name: 'BOATTOMORROW', url: siteUrl },
  }

  const faqJsonLd = uniqueFaqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: uniqueFaqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-border">
          <Breadcrumbs
            items={[
              { label: 'Destinations', href: '/destinations' },
              { label: actualRegion },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-6">
            <div className="flex flex-col justify-center">
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight">
                Sailing in {actualRegion}
              </h1>
              <p className="text-xs uppercase tracking-widest text-muted mt-2">Complete Guide 2026</p>

              {/* Answer capsule */}
              {destination?.answerCapsule && (
                <p className="mt-6 text-base text-muted leading-relaxed">
                  {destination.answerCapsule}
                </p>
              )}

              {/* Anchor nav */}
              <nav className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-widest">
                {['Overview', 'Routes', 'When to Go', 'Costs', 'Suppliers', 'Articles', 'FAQ'].map((label) => (
                  <a
                    key={label}
                    href={`#${label.toLowerCase().replace(/ /g, '-')}`}
                    className="text-muted hover:text-accent transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Hero image */}
            <div className="overflow-hidden" style={{ aspectRatio: '4/3' }}>
              {(destination?.heroImage || destination?.coverImageUrl || articles[0]?.coverImageUrl) ? (
                <Image
                  src={destination?.heroImage || destination?.coverImageUrl || articles[0]?.coverImageUrl || ''}
                  alt={`Sailing in ${actualRegion}`}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-bg-alt flex items-center justify-center text-muted text-sm">
                  {actualRegion}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Facts */}
        {quickFacts && (
          <section className="py-8 border-b border-border">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {quickFacts.season && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">Best Season</p>
                  <p className="mt-1 text-sm font-medium">{quickFacts.season}</p>
                </div>
              )}
              {quickFacts.temperature && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">Temperature</p>
                  <p className="mt-1 text-sm font-medium">{quickFacts.temperature}</p>
                </div>
              )}
              {quickFacts.currency && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">Currency</p>
                  <p className="mt-1 text-sm font-medium">{quickFacts.currency}</p>
                </div>
              )}
              {quickFacts.language && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">Language</p>
                  <p className="mt-1 text-sm font-medium">{quickFacts.language}</p>
                </div>
              )}
              {quickFacts.mainMarinas && quickFacts.mainMarinas.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">Main Marinas</p>
                  <p className="mt-1 text-sm font-medium">{quickFacts.mainMarinas.join(', ')}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Overview */}
        <section id="overview" className="py-12 border-b border-border">
          <SectionHeading>overview</SectionHeading>
          {destination?.overview ? (
            <div className="max-w-3xl text-base text-text leading-relaxed space-y-4">
              {destination.overview.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">
              {articles.length} expert articles about sailing in {actualRegion}. Explore guides,
              routes, and tips from verified yachting industry suppliers.
            </p>
          )}
        </section>

        {/* Routes */}
        {routes.length > 0 && (
          <section id="routes" className="py-12 border-b border-border">
            <SectionHeading>best routes</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routes.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* When to Go — Season Calendar */}
        <section id="when-to-go" className="py-12 border-b border-border">
          <SectionHeading>when to go</SectionHeading>
          {seasonData && seasonData.length > 0 ? (
            <div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1">
                {seasonData.map((s) => (
                  <div
                    key={s.month}
                    className={`p-2 text-center rounded ${seasonColors[s.rating] || 'bg-gray-100'}`}
                    title={s.note || `${s.month}: ${seasonLabels[s.rating]}`}
                  >
                    <p className="text-[10px] font-medium uppercase">{s.month.slice(0, 3)}</p>
                    {s.avgTemp && <p className="text-xs mt-0.5">{s.avgTemp}</p>}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3">
                {Object.entries(seasonLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${seasonColors[key]}`} />
                    <span className="text-xs text-muted">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              The Mediterranean sailing season typically runs from May to October, with peak season
              in July and August.
            </p>
          )}
        </section>

        {/* Costs */}
        <section id="costs" className="py-12 border-b border-border">
          <SectionHeading>costs</SectionHeading>
          {priceRange ? (
            <div className="bg-bg-alt border border-border p-6 md:p-8 max-w-xl">
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Charter price range</p>
              <p className="font-display text-3xl font-light">
                {priceRange.currency}{priceRange.low.toLocaleString()} &ndash; {priceRange.currency}{priceRange.high.toLocaleString()}
              </p>
              <p className="text-sm text-muted mt-1">per {priceRange.unit}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Contact charter companies directly for current pricing. Use the inquiry form below
              to get personalized offers.
            </p>
          )}
        </section>

        {/* Inline CTA */}
        <section className="py-12 bg-bg-alt border border-border my-8 text-center px-8">
          <h2 className="font-display text-xl md:text-2xl font-light mb-3">
            Get offers from companies in {actualRegion}
          </h2>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            Tell us your dates and preferences, and verified suppliers will send you personalized proposals.
          </p>
          <Link
            href="/suppliers"
            className="inline-block bg-accent text-white px-8 py-3 text-sm font-medium tracking-wide hover:opacity-85 transition-opacity"
          >
            Browse Suppliers
          </Link>
        </section>

        {/* Suppliers */}
        {suppliers.length > 0 && (
          <section id="suppliers" className="py-12 border-b border-border">
            <SectionHeading viewAllHref="/suppliers">suppliers in {actualRegion}</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suppliers.map((supplier) => (
                <SupplierCard key={supplier.slug} supplier={supplier} />
              ))}
            </div>
          </section>
        )}

        {/* Destinations articles */}
        {destinations.length > 0 && (
          <section id="articles" className="py-12 border-b border-border">
            <SectionHeading>destination guides</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Other articles */}
        {others.length > 0 && (
          <section className="py-12 border-b border-border">
            <SectionHeading>more about {actualRegion}</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {others.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {uniqueFaqs.length > 0 && (
          <section id="faq" className="py-12">
            <SectionHeading>frequently asked questions</SectionHeading>
            <div className="max-w-3xl space-y-6">
              {uniqueFaqs.map((faq, i) => (
                <div key={i} className="border-b border-border pb-6">
                  <h3 className="text-base font-medium text-text">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
