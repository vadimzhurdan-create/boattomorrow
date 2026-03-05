import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { DistributionArticle } from '@/components/supplier/DistributionArticle'

export default async function DistributionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.supplierId) redirect('/login')

  const articles = await prisma.article.findMany({
    where: {
      supplierId: session.user.supplierId,
      status: 'published',
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      socialPosts: true,
      publishedAt: true,
    },
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content Distribution Kit</h1>
        <p className="text-gray-600 mt-1">
          Ready-made social media posts for each of your published articles. Copy, paste, share.
        </p>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No published articles yet. Create and publish articles to get your distribution kit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <DistributionArticle
              key={article.id}
              article={{
                ...article,
                socialPosts: article.socialPosts as Array<{ type: string; text: string }> | null,
              }}
              siteUrl={siteUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
