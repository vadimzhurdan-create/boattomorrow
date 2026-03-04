'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, supplierTypeLabels } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Supplier {
  id: string
  name: string
  slug: string
  email: string
  type: string
  status: string
  profileStatus: string
  createdAt: string
  _count: {
    articles: number
    leads: number
  }
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  async function fetchSuppliers() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/suppliers')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSuppliers(data.data || [])
    } catch {
      toast.error('Failed to load suppliers')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(supplierId: string, newStatus: string) {
    const action = newStatus === 'blocked' ? 'block' : 'activate'
    if (!confirm(`Are you sure you want to ${action} this supplier?`)) return

    setActionLoading(supplierId)
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierId ? { ...s, status: newStatus } : s))
      )
      toast.success(`Supplier ${action}d`)
    } catch {
      toast.error(`Failed to ${action} supplier`)
    } finally {
      setActionLoading(null)
    }
  }

  const statusColorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    blocked: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Supplier Management</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No suppliers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-xs text-gray-500">{supplier.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-primary-50 text-primary-700">
                      {supplierTypeLabels[supplier.type] || supplier.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={statusColorMap[supplier.status] || 'bg-gray-100 text-gray-700'}>
                      {supplier.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {supplier._count.articles}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(supplier.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {supplier.status === 'blocked' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateStatus(supplier.id, 'active')}
                          isLoading={actionLoading === supplier.id}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => updateStatus(supplier.id, 'blocked')}
                          isLoading={actionLoading === supplier.id}
                        >
                          Block
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
