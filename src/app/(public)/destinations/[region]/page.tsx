import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface PageProps {
  params: Promise<{ region: string }>
}

async function getArticlesForRegion(regionSlug: string) {
  // Decode and convert slug back to search term
  const searchTerm = decodeURIComponent(regionSlug).replace(/-/g, ' ')

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      region: { contains: searchTerm, mode: 'insensitive' },
    },
    orderBy: { publishedAt: 'desc' },
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
  })

  return articles
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region } = await params
  const regionName = decodeURIComponent(region).replace(/-/g, ' ')
  const displayName = regionName.replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    title: `Sailing ${displayName} - Destinations & Routes`,
    description: `Sailing guides, destinations, and routes for ${displayName}. Expert editorial content from verified yachting industry suppliers.`,
  }
}

export default async function RegionHubPage({ params }: PageProps) {
  const { region } = await params
  const articles = await getArticlesForRegion(region)

  if (articles.length === 0) {
    notFound()
  }

  const regionName = decodeURIComponent(region).replace(/-/g, ' ')
  const displayName = regionName.replace(/\b\w/g, (c) => c.toUpperCase())
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  // Actual region name from first article (preserves original casing)
  const actualRegion = articles[0].region || displayName

  // CollectionPage JSON-LD
  const hubJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Sailing ${actualRegion}`,
    description: `All sailing guides, destinations, and routes for ${actualRegion}`,
    url: `${siteUrl}/destinations/${region}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'BOATTOMORROW',
      url: siteUrl,
    },
  }

  // Group articles by category
  const destinations = articles.filter((a) => a.category === 'destination')
  const routes = articles.filter((a) => a.category === 'route')
  const others = articles.filter((a) => a.category !== 'destination' && a.category !== 'route')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Destinations', href: '/destinations' },
            { label: actualRegion },
          ]}
        />

        {/* Header */}
        <div className="border-b border-border pb-6 mb-8">
          <h1 className="text-2xl font-light font-body tracking-tight">
            <span className="text-accent mr-1">/</span> {actualRegion}
          </h1>
          <p className="text-sm text-muted mt-2">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'} about sailing {actualRegion}
          </p>
        </div>

        {/* Featured article */}
        {articles.length > 0 && (
          <div className="mb-12">
            <ArticleCard article={articles[0]} featured />
          </div>
        )}

        {/* Destinations section */}
        {destinations.length > 1 && (
          <section className="mb-12">
            <SectionHeading>destinations</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.slice(1).map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Routes section */}
        {routes.length > 0 && (
          <section className="mb-12">
            <SectionHeading>sailing routes</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routes.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Other articles */}
        {others.length > 0 && (
          <section className="mb-12">
            <SectionHeading>more about {actualRegion}</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {others.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
