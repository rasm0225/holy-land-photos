import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

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
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>Site of the Week</strong>
      </nav>

      <h1>Site of the Week</h1>
      <p style={{ color: '#888', marginBottom: '24px' }}>{docs.length} featured sites</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {docs.map((item) => {
          const section = typeof item.section === 'object' ? item.section : null
          const imageId = item.imageId as string
          const isCurrent = (item as unknown as Record<string, unknown>).isCurrent as boolean

          return (
            <a
              key={item.id}
              href={section ? `/browse/${section.slug}` : '#'}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
            >
              {imageId && (
                <Image
                  src={`${S3_BASE}/${imageId}.jpg`}
                  alt={section?.title || 'Site of the Week'}
                  width={120}
                  height={90}
                  sizes="120px"
                  style={{ objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>
                  {section?.title || 'Untitled'}
                  {isCurrent && (
                    <span style={{ fontSize: '12px', color: '#B85C2C', marginLeft: '8px' }}>Current</span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
