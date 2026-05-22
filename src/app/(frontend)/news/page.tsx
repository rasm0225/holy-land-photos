import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { photoSrc } from '@/lib/photoSrc'

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
    where: { active: { equals: true } },
  })

  return (
    <div>
      <h1 className="pln-h1">News</h1>
      <p className="pln-search-meta">{docs.length} articles</p>

      <div>
        {docs.map((item) => {
          const gallery = (item.imageGallery || []) as Array<{ imageId?: string }>
          const thumbId = gallery[0]?.imageId
          return (
            <div key={item.id} className="pln-section-result">
              {thumbId && (
                <Image
                  src={photoSrc({ imageId: thumbId })}
                  alt={item.title}
                  width={120}
                  height={90}
                  sizes="120px"
                  style={{ objectFit: 'cover', flexShrink: 0, border: '1px solid var(--line)' }}
                />
              )}
              <div>
                <h3><a href={`/news/${item.id}`}>{item.title}</a></h3>
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
