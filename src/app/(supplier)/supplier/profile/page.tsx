'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { supplierTypeLabels } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SupplierProfile {
  id: string
  type: string
  name: string
  slug: string
  email: string
  tagline: string | null
  description: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  imageUrls: string[]
  website: string | null
  contactEmail: string | null
  contactPhone: string | null
  regions: string[]
  typeMeta: any
  profileStatus: string
}

export default function SupplierProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [regionsInput, setRegionsInput] = useState('')
  const [profileStatus, setProfileStatus] = useState('draft')

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) return

      try {
        const res = await fetch('/api/suppliers/me')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        const p = data.data as SupplierProfile
        setProfile(p)
        setTagline(p.tagline || '')
        setDescription(p.description || '')
        setContactEmail(p.contactEmail || '')
        setContactPhone(p.contactPhone || '')
        setWebsite(p.website || '')
        setRegionsInput((p.regions || []).join(', '))
        setProfileStatus(p.profileStatus)
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  async function handleSave() {
    setIsSaving(true)

    try {
      const regions = regionsInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)

      const res = await fetch('/api/suppliers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagline: tagline || null,
          description: description || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          website: website || null,
          regions,
          profileStatus,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
        return
      }

      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleImageUpload(field: 'logo' | 'cover' | 'gallery', e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        const data = await res.json()
        if (data.url) {
          uploadedUrls.push(data.url)
        }
      }

      if (uploadedUrls.length === 0) return

      // Update the supplier profile with the new image
      const updateBody: Record<string, any> = {}
      if (field === 'logo') {
        updateBody.logoUrl = uploadedUrls[0]
      } else if (field === 'cover') {
        updateBody.coverImageUrl = uploadedUrls[0]
      } else {
        updateBody.imageUrls = [...(profile?.imageUrls || []), ...uploadedUrls]
      }

      const res = await fetch('/api/suppliers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(data.data)
        toast.success('Image uploaded')
      }
    } catch {
      toast.error('Upload failed')
    }
  }

  function handleTogglePublish() {
    const newStatus = profileStatus === 'published' ? 'draft' : 'published'
    setProfileStatus(newStatus)
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-primary-50 text-primary-700">
              {supplierTypeLabels[profile.type] || profile.type}
            </Badge>
            <Badge className={profileStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
              {profileStatus}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Link href="/supplier/profile/quiz">
            <Button variant="outline" size="sm">
              Update via AI Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Images */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Images</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-contain bg-gray-50 border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                )}
                <label className="text-sm text-primary-600 font-medium cursor-pointer hover:text-primary-700">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload('logo', e)} />
                  Upload logo
                </label>
              </div>
            </div>

            {/* Cover */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              {profile.coverImageUrl ? (
                <img src={profile.coverImageUrl} alt="Cover" className="w-full h-40 rounded-lg object-cover" />
              ) : (
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload('cover', e)} />
                  <p className="text-sm text-gray-600">Click to upload cover image</p>
                </label>
              )}
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery ({profile.imageUrls?.length || 0} images)
              </label>
              {profile.imageUrls && profile.imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {profile.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Gallery ${idx + 1}`} className="w-full h-20 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <label className="inline-flex items-center text-sm text-primary-600 font-medium cursor-pointer hover:text-primary-700">
                <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload('gallery', e)} />
                Add gallery photos
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Profile info */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Profile Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short company tagline (up to 80 chars)"
              maxLength={255}
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your company, services, and what makes you unique..."
              rows={8}
            />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Contact Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="info@company.com"
            />

            <Input
              label="Contact Phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+385 1 234 5678"
            />

            <Input
              label="Website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.company.com"
            />

            <Input
              label="Regions (comma-separated)"
              value={regionsInput}
              onChange={(e) => setRegionsInput(e.target.value)}
              placeholder="Croatia, Greece, Turkey"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleTogglePublish}
            className={`text-sm font-medium ${
              profileStatus === 'published'
                ? 'text-yellow-600 hover:text-yellow-700'
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            {profileStatus === 'published' ? 'Unpublish Profile' : 'Publish Profile'}
          </button>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            size="lg"
          >
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
