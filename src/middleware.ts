import { NextRequest, NextResponse } from 'next/server'
import { SECTION_SLUGS, PAGE_SLUGS } from './redirect-maps.generated'

/**
 * Middleware to redirect old ASP URLs to new routes.
 *
 * Handles `.asp` requests anywhere in the path — not just at the root —
 * because some legacy HTML contains relative links like `browse.asp?...`
 * that the browser resolves against the current page's directory
 * (e.g. `/browse/greece-north/browse.asp?...`).
 *
 * Slug lookups use a build-time-generated map (see
 * `scripts/generate_redirect_maps.py`). This avoids DB access in
 * middleware, which is required so the bundle works in the Edge runtime
 * (the libsql Edge client does not support `file:` URLs).
 *
 * Mapping:
 *   go.asp?img=IMAGEID       → /photos/IMAGEID
 *   go.asp?s=N               → /browse/SLUG
 *   browse.asp?s=...,N       → /browse/SLUG (last id in the comma list)
 *   browse.asp?SiteID=N      → /browse/SLUG
 *   browse.asp?SubRegionID=N → /browse/SLUG
 *   browse.asp?img|ImageID=X → /photos/X
 *   page.asp?page_ID=N       → /pages/SLUG
 *   search.asp               → /search
 *   whats_new.asp            → /news
 *
 * If the section/page is not in the map (deleted in the rebuild) the
 * request is redirected to /gone with the original URL preserved as
 * `?from=`.
 */

const ASP_FILE_RE = /\/(go|browse|page|search|whats_new)\.asp$/i

function gone(request: NextRequest): NextResponse {
  const from = request.nextUrl.pathname + request.nextUrl.search
  const url = new URL('/gone', request.url)
  url.searchParams.set('from', from)
  return NextResponse.redirect(url, 301)
}

function sectionSlug(id: number): string | null {
  return SECTION_SLUGS[id] ?? null
}

function pageSlug(id: number): string | null {
  return PAGE_SLUGS[id] ?? null
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const lower = pathname.toLowerCase()

  if (!lower.endsWith('.asp')) return NextResponse.next()

  const fileMatch = lower.match(ASP_FILE_RE)
  if (!fileMatch) return NextResponse.next()
  const aspFile = fileMatch[1]

  if (aspFile === 'search') {
    return NextResponse.redirect(new URL('/search', request.url), 301)
  }

  if (aspFile === 'whats_new') {
    return NextResponse.redirect(new URL('/news', request.url), 301)
  }

  if (aspFile === 'go') {
    const img = searchParams.get('img')
    if (img) return NextResponse.redirect(new URL(`/photos/${img}`, request.url), 301)
    const s = searchParams.get('s')
    if (s) {
      const id = parseInt(s, 10)
      if (Number.isInteger(id)) {
        const slug = sectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }
    return gone(request)
  }

  if (aspFile === 'browse') {
    const img = searchParams.get('img') || searchParams.get('ImageID')
    if (img) return NextResponse.redirect(new URL(`/photos/${img}`, request.url), 301)

    const s = searchParams.get('s')
    if (s) {
      const parts = s.split(',')
      const last = parts[parts.length - 1]?.trim()
      const id = parseInt(last ?? '', 10)
      if (Number.isInteger(id)) {
        const slug = sectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }

    const siteId = searchParams.get('SiteID')
    if (siteId) {
      const id = parseInt(siteId, 10)
      if (Number.isInteger(id)) {
        const slug = sectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }

    const subRegionId = searchParams.get('SubRegionID')
    if (subRegionId) {
      const id = parseInt(subRegionId, 10)
      if (Number.isInteger(id)) {
        const slug = sectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }

    return gone(request)
  }

  if (aspFile === 'page') {
    const pageId = searchParams.get('page_ID')
    if (pageId) {
      const id = parseInt(pageId, 10)
      if (Number.isInteger(id)) {
        const slug = pageSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/pages/${slug}`, request.url), 301)
      }
    }
    return gone(request)
  }

  return NextResponse.next()
}

export const config = {
  // Run for every request except `_next/*`, Payload's API, and admin.
  // The middleware bails out immediately if the path does not end in
  // `.asp` (case-insensitive), so the cost of this broad matcher is one
  // string check per request.
  matcher: ['/((?!_next/|api/|admin/).*)'],
}
