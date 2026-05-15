import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware to redirect old ASP URLs to new routes.
 *
 * Handles `.asp` requests anywhere in the path — not just at the root —
 * because some legacy HTML contains relative links like `browse.asp?...`
 * that the browser resolves against the current page's directory
 * (e.g. `/browse/greece-north/browse.asp?...`).
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
 * If the section/page no longer exists in the new database the request is
 * redirected to /gone (HTTP 410-style "moved or removed" page) with the
 * original URL preserved as `?from=`.
 */

const ASP_FILE_RE = /\/(go|browse|page|search|whats_new)\.asp$/i

function gone(request: NextRequest): NextResponse {
  const from = request.nextUrl.pathname + request.nextUrl.search
  const url = new URL('/gone', request.url)
  url.searchParams.set('from', from)
  return NextResponse.redirect(url, 301)
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const lower = pathname.toLowerCase()

  if (!lower.endsWith('.asp')) return NextResponse.next()

  const fileMatch = lower.match(ASP_FILE_RE)
  if (!fileMatch) return NextResponse.next()
  const aspFile = fileMatch[1]

  // search.asp → /search
  if (aspFile === 'search') {
    return NextResponse.redirect(new URL('/search', request.url), 301)
  }

  // whats_new.asp → /news
  if (aspFile === 'whats_new') {
    return NextResponse.redirect(new URL('/news', request.url), 301)
  }

  // go.asp
  if (aspFile === 'go') {
    const img = searchParams.get('img')
    if (img) return NextResponse.redirect(new URL(`/photos/${img}`, request.url), 301)
    const s = searchParams.get('s')
    if (s) {
      const id = parseInt(s, 10)
      if (Number.isInteger(id)) {
        const slug = await lookupSectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }
    return gone(request)
  }

  // browse.asp
  if (aspFile === 'browse') {
    const img = searchParams.get('img') || searchParams.get('ImageID')
    if (img) return NextResponse.redirect(new URL(`/photos/${img}`, request.url), 301)

    const s = searchParams.get('s')
    if (s) {
      const parts = s.split(',')
      const last = parts[parts.length - 1]?.trim()
      const id = parseInt(last ?? '', 10)
      if (Number.isInteger(id)) {
        const slug = await lookupSectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }

    const siteId = searchParams.get('SiteID')
    if (siteId) {
      const id = parseInt(siteId, 10)
      if (Number.isInteger(id)) {
        const slug = await lookupSectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }

    const subRegionId = searchParams.get('SubRegionID')
    if (subRegionId) {
      const id = parseInt(subRegionId, 10)
      if (Number.isInteger(id)) {
        const slug = await lookupSectionSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }

    return gone(request)
  }

  // page.asp
  if (aspFile === 'page') {
    const pageId = searchParams.get('page_ID')
    if (pageId) {
      const id = parseInt(pageId, 10)
      if (Number.isInteger(id)) {
        const slug = await lookupPageSlug(id)
        if (slug) return NextResponse.redirect(new URL(`/pages/${slug}`, request.url), 301)
      }
    }
    return gone(request)
  }

  return NextResponse.next()
}

const sectionCache = new Map<number, string | null>()
const pageCache = new Map<number, string | null>()

async function lookupSectionSlug(id: number): Promise<string | null> {
  if (sectionCache.has(id)) return sectionCache.get(id) ?? null
  const slug = await dbLookup(`SELECT slug FROM sections WHERE id = ${id}`)
  sectionCache.set(id, slug)
  return slug
}

async function lookupPageSlug(id: number): Promise<string | null> {
  if (pageCache.has(id)) return pageCache.get(id) ?? null
  const slug = await dbLookup(`SELECT slug FROM pages WHERE id = ${id}`)
  pageCache.set(id, slug)
  return slug
}

async function dbLookup(sql: string): Promise<string | null> {
  const dbUrl = process.env.DATABASE_URL || ''

  if (dbUrl.startsWith('file:')) {
    const { createClient } = await import('@libsql/client')
    const client = createClient({ url: dbUrl })
    const result = await client.execute(sql)
    if (result.rows.length > 0) return String(result.rows[0][0])
    return null
  }

  const httpUrl = dbUrl.replace('libsql://', 'https://') + '/v2/pipeline'
  const token = process.env.DATABASE_AUTH_TOKEN || ''
  const res = await fetch(httpUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql } },
        { type: 'close' },
      ],
    }),
  })
  const data = await res.json()
  const rows = data.results?.[0]?.response?.result?.rows
  if (rows && rows.length > 0) return rows[0][0].value
  return null
}

export const config = {
  // Run for every request except `_next/*`. The middleware bails out
  // immediately if the path does not end in `.asp` (case-insensitive),
  // so the cost of this broad matcher is one string check per request.
  // We can't easily express "ends in .asp, case-insensitive, at any depth"
  // in path-to-regexp matcher syntax, so we filter in code instead.
  matcher: ['/((?!_next/|api/|admin/).*)'],
}
