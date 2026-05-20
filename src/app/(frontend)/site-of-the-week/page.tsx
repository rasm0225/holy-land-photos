import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'

const S3_BASE = 'https://photos.holylandphotos.org'

export const metadata: Metadata = {
  title: 'Site of the Week',
  description: 'Featured biblical and archaeological sites from Holy Land Photos.',
  openGraph: {
    title: 'Site of the Week — Holy Land Photos',
    description: 'Featured biblical and archaeological sites from Holy Land Photos.',
    type: 'website',
  },
}

export default async function SiteOfTheWeekIndexPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'site-of-the-week',
    limit: 0,
    depth: 1,
    sort: '-createdAt',
  })

  return (
    <div>
      <h1 className="pln-h1">Site of the Week</h1>
      <div className="pln-search-meta">{docs.length} featured sites</div>

      <div>
        {docs.map((item) => {
          const section = typeof item.section === 'object' ? item.section : null
          const imageId = item.imageId as string
          const isCurrent = (item as unknown as Record<string, unknown>).isCurrent as boolean

          return (
            <div key={item.id} className="pln-section-result">
              {imageId && (
                <Image
                  src={`${S3_BASE}/${imageId}.jpg`}
                  alt={section?.title || 'Site of the Week'}
                  width={120}
                  height={90}
                  sizes="120px"
                  style={{ objectFit: 'cover', flexShrink: 0, border: '1px solid var(--line)' }}
                />
              )}
              <div>
                <h3>
                  <a href={section ? `/browse/${section.slug}` : '#'}>{section?.title || 'Untitled'}</a>
                  {isCurrent && <span className="pln-badge" style={{ marginLeft: 8, marginBottom: 0 }}>Current</span>}
                </h3>
                <div className="pln-path">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
