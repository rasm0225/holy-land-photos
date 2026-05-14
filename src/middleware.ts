import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware to redirect old ASP URLs to new routes.
 *
 * Handles:
 *   /go.asp?img=IMAGEID       → /photos/IMAGEID
 *   /go.asp?s=N               → /browse/SLUG (lookup by section ID)
 *   /browse.asp?s=1,2,3,N     → /browse/SLUG (last number is the section ID)
 *   /page.asp?page_ID=N       → /pages/SLUG (lookup by page ID)
 *
 * Uses the Turso HTTP API (or local SQLite via libsql) to look up slugs.
 * Returns 301 permanent redirects.
 */

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  const lower = pathname.toLowerCase()

  // Only intercept old ASP URLs
  if (!lower.endsWith('.asp')) return NextResponse.next()

  // go.asp?img=IMAGEID
  if (lower === '/go.asp' && searchParams.has('img')) {
    const imageId = searchParams.get('img')
    if (imageId) {
      return NextResponse.redirect(new URL(`/photos/${imageId}`, request.url), 301)
    }
  }

  // go.asp?s=N (single section ID)
  if (lower === '/go.asp' && searchParams.has('s')) {
    const sectionId = searchParams.get('s')
    if (sectionId) {
      const slug = await lookupSectionSlug(sectionId)
      if (slug) {
        return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
      }
    }
  }

  // browse.asp?s=1,2,3,N (comma-separated ancestry, last is the target)
  if (lower === '/browse.asp' && searchParams.has('s')) {
    const sParam = searchParams.get('s')
    if (sParam) {
      const parts = sParam.split(',')
      const targetId = parts[parts.length - 1].trim()
      if (targetId) {
        // Check if there's also an img param (photo within a section)
        const imgParam = searchParams.get('img')
        if (imgParam) {
          const slug = await lookupSectionSlug(targetId)
          return NextResponse.redirect(
            new URL(`/photos/${imgParam}${slug ? `?s=${slug}` : ''}`, request.url),
            301,
          )
        }
        const slug = await lookupSectionSlug(targetId)
        if (slug) {
          return NextResponse.redirect(new URL(`/browse/${slug}`, request.url), 301)
        }
      }
    }
  }

  // page.asp?page_ID=N
  if (lower === '/page.asp' && searchParams.has('page_ID')) {
    const pageId = searchParams.get('page_ID')
    if (pageId) {
      const slug = await lookupPageSlug(pageId)
      if (slug) {
        return NextResponse.redirect(new URL(`/pages/${slug}`, request.url), 301)
      }
    }
  }

  // search.asp → /search
  if (lower === '/search.asp') {
    return NextResponse.redirect(new URL('/search', request.url), 301)
  }

  // whats_new.asp → /news
  if (lower === '/whats_new.asp') {
    return NextResponse.redirect(new URL('/news', request.url), 301)
  }

  return NextResponse.next()
}

// Cache for section/page slug lookups to avoid hitting DB on every request
const sectionCache = new Map<string, string | null>()
const pageCache = new Map<string, string | null>()

async function lookupSectionSlug(id: string): Promise<string | null> {
  if (sectionCache.has(id)) return sectionCache.get(id) || null

  try {
    const slug = await dbLookup(`SELECT slug FROM sections WHERE id = ${parseInt(id, 10)}`)
    sectionCache.set(id, slug)
    return slug
  } catch {
    return null
  }
}

async function lookupPageSlug(id: string): Promise<string | null> {
  if (pageCache.has(id)) return pageCache.get(id) || null

  try {
    const slug = await dbLookup(`SELECT slug FROM pages WHERE id = ${parseInt(id, 10)}`)
    pageCache.set(id, slug)
    return slug
  } catch {
    return null
  }
}

async function dbLookup(sql: string): Promise<string | null> {
  const dbUrl = process.env.DATABASE_URL || ''

  // Local SQLite — use the Turso HTTP API format for libsql
  // Middleware runs in the edge runtime on Vercel but Node.js on self-hosted
  // For local SQLite, we need to use the HTTP API approach
  if (dbUrl.startsWith('file:')) {
    // In self-hosted Node.js, we can use @libsql/client
    const { createClient } = await import('@libsql/client')
    const client = createClient({ url: dbUrl })
    const result = await client.execute(sql)
    if (result.rows.length > 0) {
      return String(result.rows[0][0])
    }
    return null
  }

  // Remote Turso
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
  if (rows && rows.length > 0) {
    return rows[0][0].value
  }
  return null
}

export const config = {
  matcher: [
    '/go.asp',
    '/Go.asp',
    '/GO.asp',
    '/browse.asp',
    '/Browse.asp',
    '/page.asp',
    '/Page.asp',
    '/search.asp',
    '/Search.asp',
    '/whats_new.asp',
    '/Whats_New.asp',
  ],
}
