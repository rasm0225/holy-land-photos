import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { publishedFilter } from '@/lib/viewer'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

type Props = {
  params: Promise<{ keyword: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params
  const decoded = decodeURIComponent(keyword)

  return {
    title: `"${decoded}" — Keyword`,
    description: `Browse photos and sites tagged with "${decoded}" on Holy Land Photos.`,
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
    select: { title: true, imageId: true },
    sort: 'title',
  })

  return (
    <div>
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

      {sections.length === 0 && photos.length === 0 && (
        <p className="pln-p">No results found for this keyword.</p>
      )}
    </div>
  )
}
