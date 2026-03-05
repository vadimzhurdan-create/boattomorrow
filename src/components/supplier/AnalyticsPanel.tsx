'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

interface AnalyticsData {
  period: number
  views: number
  leads: number
  conversionRate: string
  dailyViews: Record<string, number>
  topArticles: Array<{ id: string; title: string; slug: string; viewsCount: number; leadsCount: number }>
  topReferrers: Array<{ referrer: string; count: number }>
}

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/suppliers/me/analytics?days=${period}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  // Simple bar chart from daily views
  const dailyEntries = Object.entries(data.dailyViews).slice(-14) // last 14 days
  const maxViews = Math.max(...dailyEntries.map(([, v]) => v), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Analytics</h2>
          <div className="flex gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  period === d
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.views.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.leads}</p>
            <p className="text-xs text-gray-500">Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{data.conversionRate}%</p>
            <p className="text-xs text-gray-500">Conversion</p>
          </div>
        </div>

        {/* Simple views chart */}
        {dailyEntries.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Views (last {Math.min(14, dailyEntries.length)} days)</p>
            <div className="flex items-end gap-1 h-20">
              {dailyEntries.map(([date, count]) => (
                <div
                  key={date}
                  className="flex-1 bg-accent/20 hover:bg-accent/40 transition-colors rounded-t relative group"
                  style={{ height: `${(count / maxViews) * 100}%`, minHeight: '2px' }}
                  title={`${date}: ${count} views`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top articles */}
        {data.topArticles.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Top articles by leads</p>
            <ul className="space-y-2">
              {data.topArticles.map((article) => (
                <li key={article.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-gray-700 flex-1 mr-2">{article.title}</span>
                  <span className="text-xs text-accent font-medium whitespace-nowrap">
                    {article.leadsCount} leads
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top referrers */}
        {data.topReferrers.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Traffic sources</p>
            <ul className="space-y-1">
              {data.topReferrers.slice(0, 5).map((ref) => {
                let displayName = ref.referrer
                try {
                  displayName = new URL(ref.referrer).hostname
                } catch {
                  // use as-is
                }
                return (
                  <li key={ref.referrer} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">{displayName}</span>
                    <span className="text-xs text-gray-500">{ref.count}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
