'use client'

import { useEffect } from 'react'

export function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    const url = new URL(window.location.href)
    const data = {
      referrer: document.referrer || null,
      utmSource: url.searchParams.get('utm_source'),
      utmMedium: url.searchParams.get('utm_medium'),
    }

    fetch(`/api/articles/${articleId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {})
  }, [articleId])

  return null
}
