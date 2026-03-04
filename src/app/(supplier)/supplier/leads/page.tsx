'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, leadStatusColors, intentLabels } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  destination: string | null
  dates: string | null
  groupSize: number | null
  sourceType: string
  intent: string
  status: string
  createdAt: string
  article: {
    title: string
    slug: string
  } | null
}

const statusOptions = [
  { value: 'new_lead', label: 'New' },
  { value: 'seen', label: 'Seen' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
]

const filterOptions = [
  { value: '', label: 'All Statuses' },
  ...statusOptions,
]

export default function SupplierLeadsPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeads() {
      if (!session?.user) return
      setIsLoading(true)

      try {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)

        const res = await fetch(`/api/leads?${params}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setLeads(data.data || [])
      } catch {
        toast.error('Failed to load leads')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [session, statusFilter])

  async function updateLeadStatus(leadId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      )
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
        <div className="mt-3 sm:mt-0 w-48">
          <Select
            options={filterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500">No leads yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Leads will appear here when visitors inquire through your content.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} hover>
              <CardContent>
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={leadStatusColors[lead.status] || 'bg-gray-100 text-gray-700'}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-600">
                          {intentLabels[lead.intent] || lead.intent}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{lead.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{lead.email}</span>
                        <span className="text-xs text-gray-400">{formatDate(lead.createdAt)}</span>
                        {lead.article && (
                          <span className="text-xs text-primary-600">
                            via: {lead.article.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Select
                        options={statusOptions}
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedLead === lead.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {lead.phone && (
                      <div>
                        <span className="text-gray-500 font-medium">Phone: </span>
                        <span className="text-gray-900">{lead.phone}</span>
                      </div>
                    )}
                    {lead.destination && (
                      <div>
                        <span className="text-gray-500 font-medium">Destination: </span>
                        <span className="text-gray-900">{lead.destination}</span>
                      </div>
                    )}
                    {lead.dates && (
                      <div>
                        <span className="text-gray-500 font-medium">Dates: </span>
                        <span className="text-gray-900">{lead.dates}</span>
                      </div>
                    )}
                    {lead.groupSize && (
                      <div>
                        <span className="text-gray-500 font-medium">Group Size: </span>
                        <span className="text-gray-900">{lead.groupSize}</span>
                      </div>
                    )}
                    {lead.message && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500 font-medium">Message: </span>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 font-medium">Source: </span>
                      <span className="text-gray-900">{lead.sourceType}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
