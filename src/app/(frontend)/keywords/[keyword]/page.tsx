import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'

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
    },
  }
}

export default async function KeywordPage({ params }: Props) {
  const { keyword } = await params
  const decoded = decodeURIComponent(keyword)
  const payload = await getPayload({ config })

  // Search sections with this keyword
  const { docs: sections } = await payload.find({
    collection: 'sections',
    where: {
      keywords: { contains: decoded },
    },
    limit: 0,
    depth: 0,
    select: { title: true, slug: true, sectionType: true },
    sort: 'title',
  })

  // Search photos with this keyword
  const { docs: photos } = await payload.find({
    collection: 'photos',
    where: {
      keywords: { contains: decoded },
    },
    limit: 100,
    depth: 0,
    select: { title: true, imageId: true },
    sort: 'title',
  })

  return (
    <div>
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>Keyword: {decoded}</strong>
      </nav>

      <h1>Keyword: &ldquo;{decoded}&rdquo;</h1>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        {sections.length} section{sections.length !== 1 ? 's' : ''} &middot; {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </p>

      {/* Sections */}
      {sections.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2>Sites &amp; Sections</h2>
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
          <h2>Photos</h2>
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
                    sizes="200px"
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

      {sections.length === 0 && photos.length === 0 && (
        <p>No results found for this keyword.</p>
      )}
    </div>
  )
}
