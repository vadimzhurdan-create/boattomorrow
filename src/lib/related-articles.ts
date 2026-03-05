import { prisma } from '@/lib/prisma'

interface ArticleForRelated {
  id: string
  tags: string[]
  region: string | null
  category: string
}

export async function getRelatedArticles(article: ArticleForRelated, limit = 3) {
  // 1. First priority: matching tags + same region
  const byTagsAndRegion = article.region
    ? await prisma.article.findMany({
        where: {
          id: { not: article.id },
          status: 'published',
          region: article.region,
          tags: { hasSome: article.tags },
        },
        orderBy: { viewsCount: 'desc' },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          region: true,
          coverImageUrl: true,
          excerpt: true,
          supplier: { select: { name: true, slug: true, type: true } },
        },
      })
    : []

  if (byTagsAndRegion.length >= limit) return byTagsAndRegion

  const excludeIds = [article.id, ...byTagsAndRegion.map((a) => a.id)]

  // 2. Same region, any tags
  const byRegion = article.region
    ? await prisma.article.findMany({
        where: {
          id: { notIn: excludeIds },
          status: 'published',
          region: article.region,
        },
        orderBy: { viewsCount: 'desc' },
        take: limit - byTagsAndRegion.length,
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          region: true,
          coverImageUrl: true,
          excerpt: true,
          supplier: { select: { name: true, slug: true, type: true } },
        },
      })
    : []

  const excludeIds2 = [...excludeIds, ...byRegion.map((a) => a.id)]

  // 3. Same category
  const remaining = limit - byTagsAndRegion.length - byRegion.length
  const byCategory =
    remaining > 0
      ? await prisma.article.findMany({
          where: {
            id: { notIn: excludeIds2 },
            status: 'published',
            category: article.category as any,
          },
          orderBy: { viewsCount: 'desc' },
          take: remaining,
          select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            region: true,
            coverImageUrl: true,
            excerpt: true,
            supplier: { select: { name: true, slug: true, type: true } },
          },
        })
      : []

  return [...byTagsAndRegion, ...byRegion, ...byCategory]
}
