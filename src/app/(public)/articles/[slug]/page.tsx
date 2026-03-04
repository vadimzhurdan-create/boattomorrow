import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'
import { LeadForm } from '@/components/leads/LeadForm'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { formatDate } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface PageProps {
  params: Promise<{ slug: string }>
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
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
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

  // Fire-and-forget view count increment
  prisma.article.update({
    where: { id: article.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {})

  const intent = getIntentForSupplierType(article.supplier.type)

  // Get related articles
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: 'published',
      category: article.category,
      id: { not: article.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      title: true,
      category: true,
      coverImageUrl: true,
      supplier: { select: { name: true, slug: true, type: true } },
    },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImageUrl,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: article.supplier.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/suppliers/${article.supplier.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BOATTOMORROW',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}/articles/${article.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Article Header */}
        <header className="max-w-3xl mx-auto pt-12 pb-8">
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted mb-6">
            <Link href={`/${article.category === 'destination' ? 'destinations' : article.category === 'boat' ? 'boats' : article.category}`} className="hover:text-text transition-colors">
              <span className="text-accent">/</span> {article.category}
            </Link>
            {article.region && (
              <>
                <span className="text-border">/</span>
                <span>{article.region}</span>
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
            <div className="text-sm">
              <span className="text-muted">by </span>
              <Link
                href={`/suppliers/${article.supplier.slug}`}
                className="text-text hover:opacity-50 transition-opacity"
              >
                {article.supplier.name}
              </Link>
              <span className="text-xs text-accent ml-2 uppercase tracking-wider">
                {article.supplier.type}
              </span>
            </div>
          </div>
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

        {/* Article Body */}
        <div className="prose-editorial py-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>

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

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-12">
            <SectionHeading viewAllHref={`/${article.category === 'destination' ? 'destinations' : article.category === 'boat' ? 'boats' : article.category}`}>
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
