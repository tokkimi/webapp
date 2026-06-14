'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    const consent = localStorage.getItem('capsule_cookies')
    if (consent !== 'accepted') return

    const sessionKey = 'capsule_visit_session'
    let sessionId = sessionStorage.getItem(sessionKey)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem(sessionKey, sessionId)
    }

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        session_id: sessionId,
      }),
      keepalive: true,
    }).catch(() => undefined)
  }, [pathname])

  return null
}
