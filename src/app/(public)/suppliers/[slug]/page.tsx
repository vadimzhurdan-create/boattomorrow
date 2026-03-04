import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { LeadForm } from '@/components/leads/LeadForm'
import { supplierTypeLabels } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getSupplier(slug: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        select: {
          slug: true,
          title: true,
          excerpt: true,
          category: true,
          region: true,
          coverImageUrl: true,
          publishedAt: true,
        },
      },
    },
  })

  if (!supplier || supplier.profileStatus !== 'published') {
    return null
  }

  return supplier
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supplier = await getSupplier(slug)

  if (!supplier) {
    return { title: 'Supplier Not Found' }
  }

  const typeLabel = supplierTypeLabels[supplier.type] || supplier.type

  return {
    title: `${supplier.name} - ${typeLabel}`,
    description: supplier.tagline || `${supplier.name} is a ${typeLabel} on BOATTOMORROW.`,
    openGraph: {
      title: supplier.name,
      description: supplier.tagline || undefined,
      type: 'profile',
      images: supplier.coverImageUrl
        ? [{ url: supplier.coverImageUrl }]
        : supplier.logoUrl
        ? [{ url: supplier.logoUrl }]
        : undefined,
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

function renderTypeMeta(type: string, typeMeta: Record<string, unknown> | null) {
  if (!typeMeta || Object.keys(typeMeta).length === 0) return null

  const sections: { label: string; value: string }[] = []

  if (type === 'charter') {
    if (typeMeta.fleetSize) sections.push({ label: 'Fleet Size', value: String(typeMeta.fleetSize) })
    if (typeMeta.boatTypes) sections.push({ label: 'Boat Types', value: Array.isArray(typeMeta.boatTypes) ? (typeMeta.boatTypes as string[]).join(', ') : String(typeMeta.boatTypes) })
    if (typeMeta.baseLocations) sections.push({ label: 'Base Locations', value: Array.isArray(typeMeta.baseLocations) ? (typeMeta.baseLocations as string[]).join(', ') : String(typeMeta.baseLocations) })
    if (typeMeta.crewOption) sections.push({ label: 'Crew Options', value: String(typeMeta.crewOption) })
    if (typeMeta.priceRange) sections.push({ label: 'Price Range', value: String(typeMeta.priceRange) })
  }

  if (type === 'manufacturer') {
    if (typeMeta.foundedYear) sections.push({ label: 'Founded', value: String(typeMeta.foundedYear) })
    if (typeMeta.boatTypes) sections.push({ label: 'Boat Types', value: Array.isArray(typeMeta.boatTypes) ? (typeMeta.boatTypes as string[]).join(', ') : String(typeMeta.boatTypes) })
    if (typeMeta.sizeRange) sections.push({ label: 'Size Range', value: String(typeMeta.sizeRange) })
    if (typeMeta.hullMaterial) sections.push({ label: 'Hull Material', value: String(typeMeta.hullMaterial) })
    if (typeMeta.flagshipModel) sections.push({ label: 'Flagship Model', value: String(typeMeta.flagshipModel) })
  }

  if (type === 'school') {
    if (typeMeta.certifications) sections.push({ label: 'Certifications', value: Array.isArray(typeMeta.certifications) ? (typeMeta.certifications as string[]).join(', ') : String(typeMeta.certifications) })
    if (typeMeta.courseTypes) sections.push({ label: 'Course Types', value: Array.isArray(typeMeta.courseTypes) ? (typeMeta.courseTypes as string[]).join(', ') : String(typeMeta.courseTypes) })
    if (typeMeta.languages) sections.push({ label: 'Languages', value: Array.isArray(typeMeta.languages) ? (typeMeta.languages as string[]).join(', ') : String(typeMeta.languages) })
    if (typeMeta.experience) sections.push({ label: 'Experience Level', value: String(typeMeta.experience) })
    if (typeMeta.duration) sections.push({ label: 'Course Duration', value: String(typeMeta.duration) })
  }

  if (sections.length === 0) return null

  return (
    <div className="bg-gray-50 rounded-xl p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default async function SupplierPage({ params }: PageProps) {
  const { slug } = await params
  const supplier = await getSupplier(slug)

  if (!supplier) {
    notFound()
  }

  const intent = getIntentForSupplierType(supplier.type)
  const typeLabel = supplierTypeLabels[supplier.type] || supplier.type

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: supplier.name,
    description: supplier.tagline || supplier.description,
    url: supplier.website || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/suppliers/${supplier.slug}`,
    logo: supplier.logoUrl,
    image: supplier.coverImageUrl,
    contactPoint: {
      '@type': 'ContactPoint',
      email: supplier.contactEmail,
      telephone: supplier.contactPhone,
    },
    areaServed: supplier.regions,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cover Image */}
      <div className="relative w-full h-48 md:h-72 bg-gray-100">
        {supplier.coverImageUrl ? (
          <Image
            src={supplier.coverImageUrl}
            alt={supplier.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl shadow-lg overflow-hidden border-4 border-white flex-shrink-0">
              {supplier.logoUrl ? (
                <Image
                  src={supplier.logoUrl}
                  alt={supplier.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-primary-600 font-bold text-4xl bg-primary-50">
                  {supplier.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="pt-2 sm:pt-8">
              <Badge className="bg-primary-100 text-primary-700 mb-2">
                {typeLabel}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{supplier.name}</h1>
              {supplier.tagline && (
                <p className="mt-2 text-lg text-gray-600">{supplier.tagline}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {supplier.regions.length > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {supplier.regions.join(', ')}
                  </span>
                )}
                {supplier.website && (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {supplier.description && (
          <div className="prose prose-lg max-w-none mb-8 prose-headings:text-gray-900 prose-a:text-primary-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {supplier.description}
            </ReactMarkdown>
          </div>
        )}

        {/* Type-specific Details */}
        {renderTypeMeta(supplier.type, supplier.typeMeta as Record<string, unknown> | null)}

        {/* Image Gallery */}
        {supplier.imageUrls.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplier.imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={url}
                    alt={`${supplier.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Articles */}
        {supplier.articles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Articles by {supplier.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplier.articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Lead Form */}
        <div className="mt-12 mb-16">
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Get in Touch with {supplier.name}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Send an inquiry directly to this {typeLabel.toLowerCase()}.
            </p>
            <LeadForm
              supplierId={supplier.id}
              intent={intent}
              sourceType="profile"
            />
          </div>
        </div>
      </div>
    </>
  )
}
