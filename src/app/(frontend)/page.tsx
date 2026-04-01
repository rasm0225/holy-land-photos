import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import type { Metadata } from 'next'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

export const metadata: Metadata = {
  title: 'Holy Land Photos — Free High-Resolution Photos of the Biblical World',
  description: '7,000+ free, high-resolution photographs of biblical and archaeological sites across 612 locations in 12 countries.',
  openGraph: {
    title: 'Holy Land Photos — Free High-Resolution Photos of the Biblical World',
    description: '7,000+ free, high-resolution photographs of biblical and archaeological sites across 612 locations in 12 countries.',
    type: 'website',
    images: [`${S3_BASE}/TWCSSM20.jpg`],
  },
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs: topLevel } = await payload.find({
    collection: 'sections',
    where: {
      parent: { exists: false },
    },
    sort: 'title',
    limit: 0,
    depth: 0,
  })

  return (
    <div>
      <h1>Holy Land Photos</h1>
      <p>Biblical photography by Dr. Carl Rasmussen</p>

      <h2>Browse</h2>
      <ul>
        {topLevel.map((section) => (
          <li key={section.id}>
            <a href={`/browse/${section.slug}`}>{section.title}</a>
          </li>
        ))}
      </ul>

      <h2>More</h2>
      <ul>
        <li><a href="/news">News</a></li>
        <li><a href="/site-of-the-week">Site of the Week</a></li>
        <li><a href="/site-list">Complete Site List</a></li>
        <li><a href="/search">Search</a></li>
      </ul>
    </div>
  )
}
