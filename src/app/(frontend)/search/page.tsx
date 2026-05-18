import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { logSearch } from '@/lib/searchLog'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: 'Search biblical and archaeological photos and sites on Holy Land Photos.',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  let sections: Array<{ id: number; title: string; slug: string; sectionType?: string | null }> = []
  let photos: Array<{ id: number; title: string; imageId: string }> = []

  const searchStart = Date.now()

  if (query) {
    const payload = await getPayload({ config })

    // Split the query into whitespace-separated terms. Each term must match
    // (as a whole word, case-insensitive) somewhere in title/keywords/imageId.
    // This lets "Patara Lighthouse" find rows where "Patara" is in keywords
    // and "Lighthouse" is in the title — the common case for multi-word
    // queries against this dataset.
    const terms = query.split(/\s+/).filter(Boolean)
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const termRegexes = terms.map((t) => new RegExp(`\\b${escapeRegex(t)}\\b`, 'i'))
    const allTermsMatch = (texts: Array<string | null | undefined>) =>
      termRegexes.every((re) => texts.some((t) => !!t && re.test(t)))

    const sectionWhere = {
      and: terms.map((term) => ({
        or: [
          { title: { contains: term } },
          { keywords: { contains: term } },
        ],
      })),
    }

    const { docs: sectionDocs } = await payload.find({
      collection: 'sections',
      where: sectionWhere,
      limit: 200,
      depth: 0,
      select: { title: true, slug: true, sectionType: true, keywords: true },
      sort: 'title',
    })
    sections = (sectionDocs as Array<{ id: number; title: string; slug: string; sectionType?: string | null; keywords?: string | null }>)
      .filter((s) => allTermsMatch([s.title, s.keywords]))
      .slice(0, 50)

    const photoWhere = {
      and: terms.map((term) => ({
        or: [
          { title: { contains: term } },
          { keywords: { contains: term } },
          { imageId: { contains: term } },
        ],
      })),
    }

    const { docs: photoDocs } = await payload.find({
      collection: 'photos',
      where: photoWhere,
      limit: 400,
      depth: 0,
      select: { title: true, imageId: true, keywords: true },
      sort: 'title',
    })
    photos = (photoDocs as Array<{ id: number; title: string; imageId: string; keywords?: string | null }>)
      .filter((p) => allTermsMatch([p.title, p.keywords, p.imageId]))
      .slice(0, 100)
  }

  const totalResults = sections.length + photos.length

  const searchDurationMs = Date.now() - searchStart

  // Log the search asynchronously (do not await to avoid blocking the response)
  if (query) {
    void logSearch({
      query,
      searchType: 'regular',
      resultCount: totalResults,
      durationMs: searchDurationMs,
    })
  }

  return (
    <div>
      <h1 className="pln-h1" style={{ fontSize: 28, marginBottom: 16 }}>Search</h1>

      <form id="search-form" action="/search" method="get" className="pln-searchbox">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search photos and sites\u2026"
          aria-label="Search photos and sites"
        />
        <button id="search-btn" type="submit">Search</button>
      </form>
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('search-form').addEventListener('submit', function() {
          var btn = document.getElementById('search-btn');
          btn.textContent = 'Searching\u2026';
          btn.disabled = true;
        });
      `}} />

      {query && (
        <div className="pln-search-meta">
          {totalResults} result{totalResults !== 1 ? 's' : ''} for <em>&ldquo;{query}&rdquo;</em>
          {' '}&middot; {(searchDurationMs / 1000).toFixed(1)}s
        </div>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <>
          <div className="pln-results-head">
            <span>Sites &amp; Sections</span>
            <span className="pln-count">{sections.length} matches</span>
          </div>
          {sections.map((s) => (
            <div key={s.id} className="pln-section-result">
              {s.sectionType && <span className="pln-badge">{s.sectionType}</span>}
              <div>
                <h3><a href={`/browse/${s.slug}`}>{s.title}</a></h3>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <>
          <div className="pln-results-head">
            <span>Photos</span>
            <span className="pln-count">{photos.length} matches</span>
          </div>
          <div className="pln-grid">
            {photos.map((photo) => {
              const imageId = photo.imageId || ''
              return (
                <a key={photo.id} className="pln-thumb" href={`/photos/${imageId}`}>
                  <Image
                    src={`${S3_BASE}/${imageId}.jpg`}
                    alt={photo.title || imageId}
                    width={200}
                    height={150}
                    sizes="200px"
                    className="pln-thumb-img"
                  />
                  <span className="pln-thumb-cap">{photo.title || imageId}</span>
                </a>
              )
            })}
          </div>
        </>
      )}

      {query && totalResults === 0 && (
        <p className="pln-p">No results found. Try different keywords.</p>
      )}

      <p style={{ marginTop: 48, fontSize: '12.5px', color: 'var(--ink-faint)', fontFamily: 'var(--sans)' }}>
        Search queries are logged anonymously to help us improve the site.
        No personal information, IP addresses, or identifiers are collected.
      </p>
    </div>
  )
}
