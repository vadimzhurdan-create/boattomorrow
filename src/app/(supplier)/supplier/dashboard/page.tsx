import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AnalyticsPanel } from '@/components/supplier/AnalyticsPanel'
import { formatDate, statusColors, leadStatusColors, categoryLabels } from '@/lib/utils'

export default async function SupplierDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.supplierId) {
    redirect('/login')
  }

  const supplierId = session.user.supplierId

  // Fetch all stats in parallel
  const [
    totalArticles,
    publishedArticles,
    totalLeads,
    newLeads,
    recentArticles,
    recentLeads,
  ] = await Promise.all([
    prisma.article.count({ where: { supplierId } }),
    prisma.article.count({ where: { supplierId, status: 'published' } }),
    prisma.lead.count({ where: { supplierId } }),
    prisma.lead.count({ where: { supplierId, status: 'new_lead' } }),
    prisma.article.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        createdAt: true,
      },
    }),
    prisma.lead.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        intent: true,
        status: true,
        createdAt: true,
        article: {
          select: { title: true },
        },
      },
    }),
  ])

  const stats = [
    {
      label: 'Total Articles',
      value: totalArticles,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Published',
      value: publishedArticles,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Leads',
      value: totalLeads,
      color: 'text-accent-600',
      bg: 'bg-accent-50',
    },
    {
      label: 'New Leads',
      value: newLeads,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {session.user.name}</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link
            href="/supplier/quiz"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create New Article
          </Link>
          <Link
            href="/supplier/profile"
            className="inline-flex items-center px-4 py-2 border-2 border-primary-600 text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} mb-3`}>
                <span className={`text-lg font-bold ${stat.color}`}>#</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Panel */}
      <div className="mb-8">
        <AnalyticsPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Articles</h2>
              <Link href="/supplier/articles" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentArticles.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500 text-sm">No articles yet.</p>
                <Link
                  href="/supplier/quiz"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700 mt-1 inline-block"
                >
                  Create your first article
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentArticles.map((article) => (
                  <li key={article.id} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={article.status === 'draft' ? `/supplier/articles/${article.id}/edit` : `/articles/${article.slug}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {categoryLabels[article.category] || article.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(article.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge className={statusColors[article.status] || 'bg-gray-100 text-gray-700'}>
                        {article.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Leads</h2>
              <Link href="/supplier/leads" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500 text-sm">No leads yet.</p>
                <p className="text-gray-400 text-xs mt-1">
                  Leads will appear here when visitors inquire through your articles.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{lead.email}</span>
                          <span className="text-xs text-gray-400">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge className={leadStatusColors[lead.status] || 'bg-gray-100 text-gray-700'}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
