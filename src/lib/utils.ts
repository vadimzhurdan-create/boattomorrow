export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const categoryLabels: Record<string, string> = {
  destination: 'Destinations',
  route: 'Routes',
  boat: 'Boats',
  learning: 'Learning',
  tips: 'Tips',
  gear: 'Gear & Tech',
}

export const supplierTypeLabels: Record<string, string> = {
  charter: 'Charter Company',
  manufacturer: 'Boat Manufacturer',
  school: 'Sailing School',
}

export const intentLabels: Record<string, string> = {
  charter_booking: 'Charter Booking',
  boat_purchase: 'Boat Purchase',
  school_enrollment: 'Course Enrollment',
  general: 'General Inquiry',
}

export const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export const leadStatusColors: Record<string, string> = {
  new_lead: 'bg-blue-100 text-blue-700',
  seen: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}
