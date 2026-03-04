'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
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
  supplier: {
    name: string
    slug: string
  }
  article: {
    title: string
    slug: string
  } | null
}

interface LeadStats {
  total: number
  new_lead: number
  contacted: number
  closed: number
}

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new_lead', label: 'New' },
  { value: 'seen', label: 'Seen' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats>({ total: 0, new_lead: 0, contacted: 0, closed: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [suppliers, setSuppliers] = useState<{ value: string; label: string }[]>([])
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  useEffect(() => {
    // Fetch suppliers for filter dropdown
    async function fetchSuppliers() {
      try {
        const res = await fetch('/api/admin/suppliers')
        if (!res.ok) return
        const data = await res.json()
        const supplierOptions = (data.data || []).map((s: any) => ({
          value: s.id,
          label: s.name,
        }))
        setSuppliers([{ value: '', label: 'All Suppliers' }, ...supplierOptions])
      } catch {
        // Ignore error for filter
      }
    }
    fetchSuppliers()
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [statusFilter, supplierFilter])

  async function fetchLeads() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter) params.set('status', statusFilter)
      if (supplierFilter) params.set('supplierId', supplierFilter)

      const res = await fetch(`/api/admin/leads?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLeads(data.data || [])
      if (data.stats) {
        setStats(data.stats)
      }
    } catch {
      toast.error('Failed to load leads')
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Leads', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
    { label: 'New', value: stats.new_lead, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Contacted', value: stats.contacted, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Closed', value: stats.closed, color: 'text-gray-600', bg: 'bg-gray-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Leads</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-48">
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        {suppliers.length > 1 && (
          <div className="w-64">
            <Select
              options={suppliers}
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No leads found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intent
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <>
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                  >
                    <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {lead.supplier.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-[200px] truncate">
                      {lead.article?.title || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">
                        {intentLabels[lead.intent] || lead.intent}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={leadStatusColors[lead.status] || 'bg-gray-100 text-gray-700'}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                  {expandedLead === lead.id && (
                    <tr key={`${lead.id}-details`}>
                      <td colSpan={6} className="px-4 py-3 bg-gray-50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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
                              <span className="text-gray-500 font-medium">Group: </span>
                              <span className="text-gray-900">{lead.groupSize} people</span>
                            </div>
                          )}
                          {lead.message && (
                            <div className="col-span-2 sm:col-span-4">
                              <span className="text-gray-500 font-medium">Message: </span>
                              <p className="text-gray-900 mt-1">{lead.message}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
