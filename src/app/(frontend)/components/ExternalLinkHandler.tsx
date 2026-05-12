'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Opens links in new tabs based on Carl Rasmussen's preference.
 *
 * - External links: always new tab
 * - Body content links (descriptions, comments, page text): new tab
 * - Navigation (nav bars, breadcrumbs): same tab
 * - Photo/section thumbnail grids: same tab
 */
export default function ExternalLinkHandler() {
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    const links = main.querySelectorAll('a[href]')
    const origin = window.location.origin

    links.forEach((link) => {
      const el = link as HTMLAnchorElement
      const href = el.href

      // Skip non-http links (mailto:, tel:, #, javascript:)
      if (!href.startsWith('http')) return
      // Skip if already set
      if (el.target === '_blank') return

      // External links: always new tab
      if (!href.startsWith(origin)) {
        el.target = '_blank'
        el.rel = 'noopener'
        return
      }

      // Navigation elements: keep same tab for smooth browsing
      if (el.closest('nav')) return

      // Image/thumbnail links (wrapping an <img>): same tab
      if (el.querySelector('img')) return

      // Everything else in the content area: new tab
      el.target = '_blank'
      el.rel = 'noopener'
    })
  }, [pathname])

  return null
}
