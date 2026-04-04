import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest news and updates from Holy Land Photos.',
  openGraph: {
    title: 'News — Holy Land Photos',
    description: 'Latest news and updates from Holy Land Photos.',
    type: 'website',
  },
}

export default async function NewsIndexPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'news',
    limit: 0,
    depth: 0,
    sort: '-createdAt',
  })

  return (
    <div>
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>News</strong>
      </nav>

      <h1>News</h1>
      <p style={{ color: '#888', marginBottom: '24px' }}>{docs.length} articles</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {docs.map((item) => {
          const gallery = (item.imageGallery || []) as Array<{ imageId?: string }>
          const thumbId = gallery[0]?.imageId
          return (
            <a
              key={item.id}
              href={`/news/${item.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
            >
              {thumbId && (
                <Image
                  src={`${S3_BASE}/${thumbId}.jpg`}
                  alt={item.title}
                  width={120}
                  height={90}
                  sizes="120px"
                  style={{ objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
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
