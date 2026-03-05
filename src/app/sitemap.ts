import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/start`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/destinations`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/boats`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/routes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/learning`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/tips`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/gear`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/suppliers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  // Published articles
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true, publishedAt: true },
  })

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt || article.publishedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Published suppliers
  const suppliers = await prisma.supplier.findMany({
    where: { profileStatus: 'published', status: 'active' },
    select: { slug: true, updatedAt: true },
  })

  const supplierPages: MetadataRoute.Sitemap = suppliers.map((supplier) => ({
    url: `${siteUrl}/suppliers/${supplier.slug}`,
    lastModified: supplier.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Destination hub pages
  const regions = await prisma.article.groupBy({
    by: ['region'],
    where: { status: 'published', region: { not: null } },
  })

  const destinationPages: MetadataRoute.Sitemap = regions
    .filter((r) => r.region)
    .map((r) => ({
      url: `${siteUrl}/destinations/${encodeURIComponent(r.region!.toLowerCase().replace(/\s+/g, '-'))}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...staticPages, ...articlePages, ...supplierPages, ...destinationPages]
}
