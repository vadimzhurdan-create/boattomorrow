import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SectionHeading } from '@/components/ui/SectionHeading'
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
    <div className="border border-border p-6 mt-8">
      <h2 className="text-sm uppercase tracking-widest text-muted mb-4">Details</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-widest text-muted">{label}</dt>
            <dd className="mt-1 text-sm text-text">{value}</dd>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Suppliers', href: '/suppliers' },
            { label: supplier.name },
          ]}
        />

        {/* Header */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-16 h-16 flex-shrink-0 border border-border flex items-center justify-center overflow-hidden">
              {supplier.logoUrl ? (
                <Image
                  src={supplier.logoUrl}
                  alt={supplier.name}
                  width={64}
                  height={64}
                  className="object-contain p-1"
                />
              ) : (
                <span className="text-text font-medium text-2xl">
                  {supplier.name.charAt(0)}
                </span>
              )}
            </div>

            <div>
              <span className="inline-block px-2 py-0.5 text-xs uppercase tracking-widest text-accent border border-accent mb-2">
                {typeLabel}
              </span>
              <h1 className="text-2xl font-light font-body tracking-tight text-text">
                {supplier.name}
              </h1>
              {supplier.tagline && (
                <p className="mt-1 text-sm text-muted">{supplier.tagline}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                {supplier.regions.length > 0 && (
                  <span>{supplier.regions.join(' / ')}</span>
                )}
                {supplier.website && (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-text transition-colors"
                  >
                    website &rarr;
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {supplier.coverImageUrl && (
          <div className="mb-8 overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image
              src={supplier.coverImageUrl}
              alt={supplier.name}
              width={1200}
              height={675}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Description */}
        {supplier.description && (
          <div className="prose prose-lg max-w-none mb-8 prose-headings:font-light prose-headings:font-body prose-headings:tracking-tight prose-a:text-accent">
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
            <h2 className="text-sm uppercase tracking-widest text-muted mb-6">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supplier.imageUrls.map((url, index) => (
                <div key={index} className="overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={url}
                    alt={`${supplier.name} - Image ${index + 1}`}
                    width={600}
                    height={338}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Articles */}
        {supplier.articles.length > 0 && (
          <div className="mt-16">
            <SectionHeading>articles by {supplier.name}</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {supplier.articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Lead Form */}
        <div className="mt-16 mb-8 border-t border-border pt-12">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-light font-body tracking-tight text-center mb-2">
              <span className="text-accent mr-1">/</span> get in touch
            </h2>
            <p className="text-sm text-muted text-center mb-8">
              Send an inquiry directly to {supplier.name}.
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
