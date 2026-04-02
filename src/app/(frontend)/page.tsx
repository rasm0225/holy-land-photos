import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import NewsCarousel from './components/NewsCarousel'

export const dynamic = 'force-dynamic'

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

  const [{ docs: topLevel }, { docs: activeNews }, { docs: displayPages }, { docs: currentSTW }] = await Promise.all([
    payload.find({
      collection: 'sections',
      where: { parent: { exists: false } },
      sort: 'title',
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'news',
      where: { active: { equals: true } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'pages',
      where: { display: { equals: true } },
      sort: 'sortOrder',
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'site-of-the-week',
      where: { isCurrent: { equals: true } },
      limit: 1,
      depth: 1,
    }),
  ])


  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .hp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        @media (max-width: 680px) { .hp-two-col { grid-template-columns: 1fr; } }
      `}} />

      <h1>Holy Land Photos</h1>
      <p>Biblical photography by Dr. Carl Rasmussen</p>

      {/* Browse + Pages two-column */}
      <div className="hp-two-col">
        <div>
          <h2>Browse</h2>
          <ul>
            {topLevel.map((section) => (
              <li key={section.id}>
                <a href={`/browse/${section.slug}`}>{section.title}</a>
              </li>
            ))}
            <li><a href="/news">News</a></li>
            <li><a href="/site-of-the-week">Site of the Week</a></li>
          </ul>
        </div>
        {displayPages.length > 0 && (
          <div>
            <h2>Pages</h2>
            <ul>
              {displayPages.map((page) => (
                <li key={page.id}>
                  <a href={`/pages/${page.slug}`}>{page.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* News — carousel left, body right */}
      {activeNews.map((n) => {
        const htmlBody = (n as unknown as Record<string, unknown>).htmlBody as string | null
        const gallery = (n.imageGallery || []) as Array<{ imageId?: string; caption?: string; url?: string }>
        return (
          <div key={n.id} style={{ marginTop: '2rem' }}>
            <h2>
              <a href={`/news/${n.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{n.title}</a>
            </h2>
            <div className="hp-two-col">
              <div>
                {gallery.length > 0 && (
                  <NewsCarousel newsItems={[{ id: n.id, title: n.title, imageGallery: gallery }]} />
                )}
              </div>
              <div>
                {n.body && <RichText data={n.body} />}
                {!n.body && htmlBody && (
                  <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Site of the Week — image left, body right */}
      {currentSTW.length > 0 && (() => {
        const stw = currentSTW[0]
        const section = stw.section as { title?: string; slug?: string } | null
        const stwHtmlBody = (stw as unknown as Record<string, unknown>).htmlBody as string | null
        return (
          <div style={{ marginTop: '2rem' }}>
            <h2>Site of the Week</h2>
            {section && typeof section === 'object' && section.slug && (
              <h3>
                <a href={`/browse/${section.slug}`}>{section.title}</a>
              </h3>
            )}
            <div className="hp-two-col">
              <div>
                {stw.imageId && (
                  <a href={section?.slug ? `/browse/${section.slug}` : `/photos/${stw.imageId}`}>
                    <img
                      src={`${S3_BASE}/${stw.imageId}.jpg`}
                      alt={section?.title || stw.imageId}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </a>
                )}
              </div>
              <div>
                {stw.body && <RichText data={stw.body} />}
                {!stw.body && stwHtmlBody && (
                  <div dangerouslySetInnerHTML={{ __html: stwHtmlBody }} />
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
