import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { publishedFilter } from '@/lib/viewer'
import { photoSrc } from '@/lib/photoSrc'

type Props = {
  params: Promise<{ keyword: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params
  const decoded = decodeURIComponent(keyword)

  return {
    title: `"${decoded}" — Keyword`,
    description: `Browse photos and sites tagged with "${decoded}" on Holy Land Photos.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: `"${decoded}" — Holy Land Photos`,
      description: `Browse photos and sites tagged with "${decoded}".`,
      type: 'website',
      url: `/keywords/${encodeURIComponent(decoded)}`,
    },
  }
}

export default async function KeywordPage({ params }: Props) {
  const { keyword } = await params
  const decoded = decodeURIComponent(keyword)
  const payload = await getPayload({ config })
  const published = publishedFilter()

  // Search sections with this keyword
  const { docs: sections } = await payload.find({
    collection: 'sections',
    where: { and: [{ keywords: { contains: decoded } }, published] },
    limit: 0,
    depth: 0,
    select: { title: true, slug: true, sectionType: true },
    sort: 'title',
  })

  // Search photos with this keyword
  const { docs: photos } = await payload.find({
    collection: 'photos',
    where: { and: [{ keywords: { contains: decoded } }, published] },
    limit: 100,
    depth: 0,
    select: { title: true, imageId: true, filename: true },
    sort: 'title',
  })

  // CollectionPage + ItemList JSON-LD. Tells Google this page is a
  // curated list of items matching the keyword; sections come first,
  // then photos. Skip the script entirely if neither matched.
  const items: Array<{ '@type': 'ListItem'; position: number; url: string; name: string }> = []
  for (const s of sections) {
    if (!s.slug) continue
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      url: `https://holylandphotos.org/browse/${s.slug}`,
      name: s.title,
    })
  }
  for (const p of photos) {
    if (!p.imageId) continue
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      url: `https://holylandphotos.org/photos/${p.imageId}`,
      name: p.title || p.imageId,
    })
  }
  const collectionJsonLd =
    items.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Photos and sites tagged "${decoded}"`,
          url: `https://holylandphotos.org/keywords/${encodeURIComponent(decoded)}`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: items.length,
            itemListElement: items,
          },
        }
      : null

  return (
    <div>
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="pln-sep">›</span>
        <span className="pln-current">Keyword: {decoded}</span>
      </nav>

      <h1 className="pln-h1">Keyword: &ldquo;{decoded}&rdquo;</h1>
      <div className="pln-search-meta">
        {sections.length} section{sections.length !== 1 ? 's' : ''} &middot; {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </div>

      {sections.length > 0 && (
        <>
          <div className="pln-results-head">
            <span>Sites &amp; Sections</span>
            <span className="pln-count">{sections.length}</span>
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

      {photos.length > 0 && (
        <>
          <div className="pln-results-head">
            <span>Photos</span>
            <span className="pln-count">{photos.length}</span>
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

      {sections.length === 0 && photos.length === 0 && (
        <p className="pln-p">No results found for this keyword.</p>
      )}
    </div>
  )
}
