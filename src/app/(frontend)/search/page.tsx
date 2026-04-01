import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'

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

  if (query) {
    const payload = await getPayload({ config })

    const { docs: sectionDocs } = await payload.find({
      collection: 'sections',
      where: {
        or: [
          { title: { contains: query } },
          { keywords: { contains: query } },
        ],
      },
      limit: 50,
      depth: 0,
      select: { title: true, slug: true, sectionType: true },
      sort: 'title',
    })
    sections = sectionDocs as typeof sections

    const { docs: photoDocs } = await payload.find({
      collection: 'photos',
      where: {
        or: [
          { title: { contains: query } },
          { keywords: { contains: query } },
          { imageId: { contains: query } },
        ],
      },
      limit: 100,
      depth: 0,
      select: { title: true, imageId: true },
      sort: 'title',
    })
    photos = photoDocs as typeof photos
  }

  const totalResults = sections.length + photos.length

  return (
    <div>
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>Search</strong>
      </nav>

      <h1>Search</h1>

      <form action="/search" method="get" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Enter keywords to search..."
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <p style={{ color: '#888', marginBottom: '24px' }}>
          {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2>Sites &amp; Sections ({sections.length})</h2>
          <ul>
            {sections.map((s) => (
              <li key={s.id} style={{ padding: '2px 0' }}>
                <a href={`/browse/${s.slug}`}>{s.title}</a>
                {s.sectionType && (
                  <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>
                    {s.sectionType}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <h2>Photos ({photos.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {photos.map((photo) => {
              const imageId = photo.imageId || ''
              return (
                <a
                  key={photo.id}
                  href={`/photos/${imageId}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Image
                    src={`${S3_BASE}/${imageId}.jpg`}
                    alt={photo.title || imageId}
                    width={200}
                    height={150}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ fontSize: '13px', padding: '4px 0' }}>
                    {photo.title || imageId}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {query && totalResults === 0 && (
        <p>No results found. Try different keywords.</p>
      )}
    </div>
  )
}
