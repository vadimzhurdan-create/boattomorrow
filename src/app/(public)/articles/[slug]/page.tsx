import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { LeadForm } from '@/components/leads/LeadForm'
import { categoryLabels, supplierTypeLabels, formatDate } from '@/lib/utils'

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
    case 'charter':
      return 'charter_booking'
    case 'manufacturer':
      return 'boat_purchase'
    case 'school':
      return 'school_enrollment'
    default:
      return 'general'
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

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="relative w-full h-64 md:h-96 bg-gray-100">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-primary-100 text-primary-700">
                  {categoryLabels[article.category] || article.category}
                </Badge>
                {article.region && (
                  <Badge className="bg-gray-100 text-gray-700">
                    {article.region}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mt-4 text-lg text-gray-600">{article.excerpt}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                {article.publishedAt && (
                  <time dateTime={article.publishedAt.toISOString()}>
                    {formatDate(article.publishedAt)}
                  </time>
                )}
                <span>by{' '}
                  <Link
                    href={`/suppliers/${article.supplier.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {article.supplier.name}
                  </Link>
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary-600 prose-img:rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Image Gallery */}
            {article.imageUrls.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {article.imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <Image
                        src={url}
                        alt={`${article.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Lead Form */}
            <div className="lg:hidden mt-12">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested? Get in touch</h3>
                <LeadForm
                  supplierId={article.supplier.id}
                  articleId={article.id}
                  intent={intent}
                  sourceType="article"
                  prefillDestination={article.region || undefined}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Supplier Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {article.supplier.logoUrl ? (
                      <Image
                        src={article.supplier.logoUrl}
                        alt={article.supplier.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-primary-600 font-bold text-xl">
                        {article.supplier.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{article.supplier.name}</h3>
                    <Badge className="bg-primary-50 text-primary-700">
                      {supplierTypeLabels[article.supplier.type] || article.supplier.type}
                    </Badge>
                  </div>
                </div>

                {article.supplier.tagline && (
                  <p className="text-sm text-gray-600 mb-3">{article.supplier.tagline}</p>
                )}

                {article.supplier.regions.length > 0 && (
                  <p className="text-xs text-gray-500 mb-4">
                    Regions: {article.supplier.regions.join(', ')}
                  </p>
                )}

                <Link
                  href={`/suppliers/${article.supplier.slug}`}
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  View Full Profile
                </Link>
              </div>

              {/* Lead Form */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested? Get in touch</h3>
                <LeadForm
                  supplierId={article.supplier.id}
                  articleId={article.id}
                  intent={intent}
                  sourceType="article"
                  prefillDestination={article.region || undefined}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
