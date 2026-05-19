'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Per Dr. Rasmussen's preference:
 *   - External links (off-origin): new tab
 *   - All internal links: same tab
 *   - On a photo page, a body/sidebar link to a section that is NOT the
 *     photo's parent section opens in a new tab. The parent slug is read
 *     from [data-parent-section] on a wrapper element rendered by the
 *     photo page.
 */
export default function ExternalLinkHandler() {
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    const parentEl = main.querySelector<HTMLElement>('[data-parent-section]')
    const parentSlug = parentEl?.dataset.parentSection ?? null

    const origin = window.location.origin
    const links = main.querySelectorAll<HTMLAnchorElement>('a[href]')

    links.forEach((el) => {
      const href = el.href
      if (!href.startsWith('http')) return
      if (el.target === '_blank') return

      // External: new tab
      if (!href.startsWith(origin)) {
        el.target = '_blank'
        el.rel = 'noopener'
        return
      }

      // Internal: cross-section body link on a photo page opens in new tab
      if (parentSlug) {
        const match = el.pathname.match(/^\/browse\/([^/?#]+)/)
        if (match && match[1] !== parentSlug) {
          el.target = '_blank'
          el.rel = 'noopener'
        }
      }
    })
  }, [pathname])

  return null
}
