import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { logSearch } from '@/lib/searchLog'
import { publishedFilter } from '@/lib/viewer'
import { photoSrc } from '@/lib/photoSrc'
import { AI_SEARCH_LABEL } from '@/lib/aiSearch'
import SmartSearchFallback from '../components/SmartSearchFallback'

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

// Function words dropped from a query before matching. Kept short and
// English-only; the dataset's titles/keywords are proper nouns and terms,
// none of which are on this list.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'from', 'with',
  'by', 'near', 'is', 'are', 'was', 'were', 'or', 'photos', 'photo', 'pictures', 'picture',
])

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Candidate singular stems for a search term. Deliberately light: only
// regular English plurals (-s, -es, -ies). "synagogues" -> synagogue;
// "churches" -> church; "cities" -> city. The term itself is always kept.
// Used only for the loose DB pre-filter; termRegex() does the real match.
function stemsFor(term: string): string[] {
  const t = term.toLowerCase()
  const out = new Set([t])
  if (t.length > 4 && t.endsWith('ies')) out.add(t.slice(0, -3) + 'y')
  if (t.length > 3 && t.endsWith('es')) out.add(t.slice(0, -2))
  if (t.length > 2 && t.endsWith('s') && !t.endsWith('ss')) out.add(t.slice(0, -1))
  return [...out]
}

// Whole-word, case-insensitive regex that accepts the term in singular or
// plural form. Built from the stems so "synagogue" matches "Synagogues"
// and "synagogues" matches "Synagogue"; "city" and "cities" match each
// other. Whole-word boundaries are kept so "Athen" still does not match
// "Athenian".
function termRegex(term: string): RegExp {
  const alts = stemsFor(term).flatMap((st) => {
    const e = escapeRegex(st)
    const forms = [`${e}(?:s|es)?`]
    if (st.endsWith('y')) forms.push(`${escapeRegex(st.slice(0, -1))}ies`)
    return forms
  })
  return new RegExp(`\\b(?:${alts.join('|')})\\b`, 'i')
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  let sections: Array<{ id: number; title: string; slug: string; sectionType?: string | null }> = []
  let photos: Array<{ id: number; title: string; imageId: string }> = []

  const searchStart = Date.now()

  if (query) {
    const payload = await getPayload({ config })
    const published = publishedFilter()

    // Split the query into whitespace-separated terms, dropping short
    // function words ("synagogues in the golan" -> synagogues, golan) so a
    // natural phrase is not sunk by "in"/"the" needing a whole-word match.
    // If the whole query is stop words, keep them rather than search for
    // nothing.
    const rawTerms = query.split(/\s+/).filter(Boolean)
    const meaningful = rawTerms.filter((t) => !STOP_WORDS.has(t.toLowerCase()))
    const terms = meaningful.length > 0 ? meaningful : rawTerms

    // Each term must match (as a whole word, case-insensitive, singular or
    // plural) somewhere in title/keywords/imageId. "Patara Lighthouse"
    // finds rows where "Patara" is in keywords and "Lighthouse" is in the
    // title; "synagogues" finds rows keyworded "Synagogue" and vice versa.
    const stemmed = terms.map((t) => ({ stems: stemsFor(t), regex: termRegex(t) }))
    const allTermsMatch = (texts: Array<string | null | undefined>) =>
      stemmed.every(({ regex }) => texts.some((t) => !!t && regex.test(t)))

    // DB pre-filter: a row must contain some stem of every term in one of
    // the searched fields. Substring match is deliberately loose; the
    // whole-word regex above does the precise cut afterwards.
    const containsAny = (fields: string[], stems: string[]): Where => ({
      or: fields.flatMap((f) => stems.map((st): Where => ({ [f]: { contains: st } }))),
    })

    const sectionWhere: Where = {
      and: [...stemmed.map(({ stems }) => containsAny(['title', 'keywords'], stems)), published],
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

    const photoWhere: Where = {
      and: [...stemmed.map(({ stems }) => containsAny(['title', 'keywords', 'imageId'], stems)), published],
    }

    const { docs: photoDocs } = await payload.find({
      collection: 'photos',
      where: photoWhere,
      limit: 400,
      depth: 0,
      select: { title: true, imageId: true, filename: true, keywords: true },
      sort: 'title',
    })
    photos = (photoDocs as Array<{ id: number; title: string; imageId: string; filename?: string | null; keywords?: string | null }>)
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
      <p className="pln-ai-blurb">
        Use one or more nouns separated by spaces. Examples:{' '}
        &ldquo;Laodicea&rdquo;, &ldquo;Laodicea Theater&rdquo;,
        &ldquo;Athena Statue&rdquo;, or &ldquo;Athena Statue Bronze&rdquo;.
      </p>

      <form id="search-form" action="/search" method="get" className="pln-searchbox">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search photos and sites…"
          aria-label="Search photos and sites"
          autoFocus
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
                    src={photoSrc(photo)}
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
        <div className="pln-noresults">
          <p className="pln-p" style={{ marginBottom: 10 }}>
            No results found for &ldquo;{query}&rdquo;.
          </p>
          <p className="pln-noresults-tip">
            This search matches whole words in titles and keywords, so an
            alternate spelling or a small typo will miss.{' '}
            <a href={`/ai-search?q=${encodeURIComponent(query)}`}>
              Try {AI_SEARCH_LABEL}
            </a>{' '}
            instead — it understands misspellings, alternate spellings
            (Caesarea / Cesarea), and plain-English questions, and it will
            search the archive for you.
          </p>
          {/* Auto-runs Smart Search and shows the answer inline.
              To remove this experiment, delete the next line. */}
          <SmartSearchFallback query={query} />
        </div>
      )}

      <p style={{ marginTop: 48, fontSize: '12.5px', color: 'var(--ink-faint)', fontFamily: 'var(--sans)' }}>
        Search queries are logged anonymously to help us improve the site.
        No personal information, IP addresses, or identifiers are collected.
      </p>
    </div>
  )
}
