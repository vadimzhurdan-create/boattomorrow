import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LeadForm } from '@/components/leads/LeadForm'
import { EmailGate } from '@/components/leads/EmailGate'
import { ViewTracker } from '@/components/articles/ViewTracker'
import { ArticleContent } from '@/components/articles/ArticleContent'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { formatDate, categoryLabels, getCategoryPath, slugify } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { VerifiedBadge } from '@/components/suppliers/VerifiedBadge'
import { getRelatedArticles } from '@/lib/related-articles'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface FaqItem {
  q: string
  a: string
}

interface KeyFact {
  label: string
  value: string
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          tagline: true,
          logoUrl: true,
          regions: true,
          website: true,
          description: true,
          contactEmail: true,
          contactPhone: true,
          profileStatus: true,
          _count: { select: { articles: true } },
        },
      },
    },
  })

  if (!article || article.status !== 'published') {
    return null
  }

  return article
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  if (!article) {
    return { title: 'Article Not Found' }
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || undefined,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
      url: `${siteUrl}/articles/${article.slug}`,
    },
    other: {
      'article:published_time': article.publishedAt?.toISOString() || '',
      'article:modified_time': article.updatedAt.toISOString(),
    },
  }
}

function getIntentForSupplierType(type: string): 'charter_booking' | 'boat_purchase' | 'school_enrollment' | 'general' {
  switch (type) {
    case 'charter': return 'charter_booking'
    case 'manufacturer': return 'boat_purchase'
    case 'school': return 'school_enrollment'
    default: return 'general'
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  // View tracking is handled by ViewTracker client component

  const intent = getIntentForSupplierType(article.supplier.type)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  // Get related articles using smart algorithm
  const relatedArticles = await getRelatedArticles(article, 3)

  // Get other articles by same supplier
  const supplierOtherArticles = await prisma.article.findMany({
    where: {
      supplierId: article.supplierId,
      status: 'published',
      id: { not: article.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true },
  })

  // Parse GEO fields
  const faqItems = (article.faqItems as FaqItem[] | null) || []
  const keyFacts = (article.keyFacts as KeyFact[] | null) || []

  // Extended Article JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.answerCapsule || article.metaDescription || article.excerpt,
    image: article.coverImageUrl,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: article.supplier.name,
      url: `${siteUrl}/suppliers/${article.supplier.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BOATTOMORROW',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articles/${article.slug}`,
    },
    ...(article.region
      ? {
          about: {
            '@type': 'Place',
            name: article.region,
          },
        }
      : {}),
    keywords: article.tags.join(', '),
    wordCount: article.content.split(/\s+/).length,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'BOATTOMORROW',
      url: siteUrl,
    },
  }

  // FAQ JSON-LD
  const faqJsonLd = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      }
    : null

  // Breadcrumb items
  const categoryLabel = categoryLabels[article.category] || article.category
  const categoryPath = getCategoryPath(article.category)
  const breadcrumbItems = [
    { label: categoryLabel, href: categoryPath },
    ...(article.region
      ? [{ label: article.region, href: `/destinations/${slugify(article.region)}` }]
      : []),
    { label: article.title },
  ]

  return (
    <>
      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* FAQ JSON-LD */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* View Tracker */}
      <ViewTracker articleId={article.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Article Header */}
        <header className="max-w-3xl mx-auto pt-12 pb-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted mb-6">
            <Link href={categoryPath} className="hover:text-text transition-colors">
              <span className="text-accent">/</span> {article.category}
            </Link>
            {article.region && (
              <>
                <span className="text-border">/</span>
                <Link
                  href={`/destinations/${slugify(article.region)}`}
                  className="hover:text-text transition-colors"
                >
                  {article.region}
                </Link>
              </>
            )}
            {article.publishedAt && (
              <>
                <span className="text-border">/</span>
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatDate(article.publishedAt)}
                </time>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Answer Capsule */}
          {article.answerCapsule && (
            <p className="mt-6 text-lg text-muted leading-relaxed font-body">
              {article.answerCapsule}
            </p>
          )}

          {/* Supplier line */}
          <div className="mt-6 flex items-center gap-3 py-4 border-t border-b border-border">
            <div className="w-8 h-8 flex-shrink-0 border border-border flex items-center justify-center overflow-hidden">
              {article.supplier.logoUrl ? (
                <Image
                  src={article.supplier.logoUrl}
                  alt={article.supplier.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              ) : (
                <span className="text-xs font-medium">{article.supplier.name.charAt(0)}</span>
              )}
            </div>
            <div className="text-sm flex items-center gap-1.5">
              <span className="text-muted">by </span>
              <Link
                href={`/suppliers/${article.supplier.slug}`}
                className="text-text hover:opacity-50 transition-opacity"
              >
                {article.supplier.name}
              </Link>
              <VerifiedBadge
                supplier={article.supplier}
                publishedArticles={article.supplier._count?.articles}
              />
              <span className="text-xs text-accent ml-1 uppercase tracking-wider">
                {article.supplier.type}
              </span>
            </div>
          </div>

          {/* Byline text — E-E-A-T signal */}
          {article.bylineText && (
            <p className="mt-3 text-xs text-muted italic">
              {article.bylineText}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {article.coverImageUrl && (
          <div className="w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              width={1400}
              height={788}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Key Facts Block */}
        {keyFacts.length > 0 && (
          <aside className="max-w-[680px] mx-auto mt-8 border border-border p-6">
            <h3 className="text-sm uppercase tracking-widest text-muted mb-4">Key Facts</h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {keyFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs uppercase tracking-widest text-muted">{fact.label}</dt>
                  <dd className="mt-1 text-sm text-text font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}

        {/* Supplier Quote — pullquote */}
        {article.supplierQuote && (
          <blockquote className="max-w-[680px] mx-auto my-8 pl-6 border-l-2 border-accent">
            <p className="text-lg text-muted italic leading-relaxed font-body">
              {article.supplierQuote}
            </p>
            <cite className="block mt-2 text-xs text-muted not-italic uppercase tracking-widest">
              {article.supplier.name}
            </cite>
          </blockquote>
        )}

        {/* Article Body with Inline CTAs */}
        <ArticleContent
          content={article.content}
          supplierId={article.supplier.id}
          articleId={article.id}
          supplierType={article.supplier.type}
          destination={article.region || undefined}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="max-w-[680px] mx-auto pb-8 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs text-muted border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Supplier Card with other articles */}
        <div className="max-w-[680px] mx-auto py-8 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 border border-border flex items-center justify-center overflow-hidden">
              {article.supplier.logoUrl ? (
                <Image
                  src={article.supplier.logoUrl}
                  alt={article.supplier.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <span className="text-lg font-medium">{article.supplier.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <Link
                href={`/suppliers/${article.supplier.slug}`}
                className="text-sm font-medium text-text hover:opacity-50 transition-opacity"
              >
                {article.supplier.name}
              </Link>
              {article.supplier.tagline && (
                <p className="text-xs text-muted mt-1">{article.supplier.tagline}</p>
              )}
              {supplierOtherArticles.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-widest text-muted mb-2">
                    More from {article.supplier.name}
                  </p>
                  <div className="flex flex-col gap-1">
                    {supplierOtherArticles.map((a) => (
                      <Link
                        key={a.slug}
                        href={`/articles/${a.slug}`}
                        className="text-sm text-accent hover:text-text transition-colors"
                      >
                        {a.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Gate — lead magnet */}
        <div className="max-w-[680px] mx-auto">
          <EmailGate
            category={article.category}
            destination={article.region || undefined}
            articleId={article.id}
          />
        </div>

        {/* Lead Form */}
        <div className="max-w-[680px] mx-auto">
          <LeadForm
            supplierId={article.supplier.id}
            articleId={article.id}
            intent={intent}
            sourceType="article"
            prefillDestination={article.region || undefined}
          />
        </div>

        {/* Related Articles — "/ read next" */}
        {relatedArticles.length > 0 && (
          <section className="py-12">
            <SectionHeading viewAllHref={categoryPath}>
              read next
            </SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
