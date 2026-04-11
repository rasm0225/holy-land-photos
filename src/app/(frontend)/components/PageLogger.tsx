'use client'

import { useEffect } from 'react'

/**
 * Measures the browser's page load performance via the Performance API
 * and posts it (anonymously) to /api/page-log.
 *
 * Uses navigator.sendBeacon which is fire-and-forget — no response needed,
 * runs even if the user navigates away immediately.
 */
export default function PageLogger() {
  useEffect(() => {
    // Skip admin pages — we don't want internal traffic in the data
    if (window.location.pathname.startsWith('/admin')) return

    const send = () => {
      try {
        const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        const nav = entries[0]
        if (!nav) return

        // Total load time from navigation start to load event end
        const duration = Math.round(nav.loadEventEnd - nav.startTime)
        const ttfb = Math.round(nav.responseStart - nav.startTime)

        // Sanity check — if these are nonsense, skip
        if (!Number.isFinite(duration) || duration < 0 || duration > 300000) return

        const payload = JSON.stringify({
          url: window.location.pathname + window.location.search,
          title: document.title,
          duration,
          ttfb: ttfb >= 0 ? ttfb : null,
        })

        // sendBeacon is fire-and-forget, ideal for this
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' })
          navigator.sendBeacon('/api/page-log', blob)
        } else {
          // Fallback for older browsers
          fetch('/api/page-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {})
        }
      } catch {
        // Never break the page because of logging
      }
    }

    // Wait for load event if not already complete
    if (document.readyState === 'complete') {
      // Defer slightly so all loadEvent timing is populated
      setTimeout(send, 0)
    } else {
      window.addEventListener('load', () => setTimeout(send, 0), { once: true })
    }
  }, [])

  return null
}
