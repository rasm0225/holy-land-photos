import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import PhotoSlideshow, { type Slide } from './components/PhotoSlideshow'
import AskTheArchive from './components/AskTheArchive'

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

  const [{ docs: topLevel }, { docs: activeNews }, { docs: displayPages }, { docs: currentSTW }, { totalDocs: photoCount }, { totalDocs: siteCount }] = await Promise.all([
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
      // depth: 2 so stw.section.photos[i].photo resolves to full photo
      // records (needed for the slideshow on the homepage).
      depth: 2,
    }),
    payload.count({
      collection: 'photos',
    }),
    payload.count({
      collection: 'sections',
      where: { sectionType: { equals: 'site' } },
    }),
  ])


  return (
    <div>
      <p className="pln-home-intro">
        Free, high-resolution photographs of biblical and archaeological sites,
        taken by Dr. Carl Rasmussen across more than four decades —{' '}
        {photoCount.toLocaleString()} images from {siteCount.toLocaleString()} locations in 12 countries.
      </p>

      {/* Browse + Pages two-column */}
      <div className="pln-home-cols">
        <section>
          <h2>Browse</h2>
          <ul className="pln-list">
            {topLevel.map((section) => (
              <li key={section.id}>
                <a href={`/browse/${section.slug}`}>{section.title}</a>
              </li>
            ))}
            <li><a href="/site-list">Complete Site List</a></li>
            <li><a href="/search">Search</a></li>
          </ul>
        </section>
        {displayPages.length > 0 && (
          <section>
            <h2>Pages</h2>
            <ul className="pln-list">
              {displayPages.map((page) => (
                <li key={page.id}>
                  <a href={`/pages/${page.slug}`}>{page.title}</a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* News — carousel left, body right */}
      {activeNews.map((n) => {
        const htmlBody = (n as unknown as Record<string, unknown>).htmlBody as string | null
        const gallery = (n.imageGallery || []) as Array<{ imageId?: string; caption?: string; url?: string }>
        return (
          <section key={n.id} className="pln-feature">
            <div>
              <h2 className="pln-h2">
                <a href={`/news/${n.id}`} className="muted">{n.title}</a>
              </h2>
              {gallery.length > 0 && (
                <PhotoSlideshow
                  slides={gallery
                    .filter((g) => g.imageId)
                    .map((g): Slide => ({
                      imageId: g.imageId!,
                      caption: g.caption,
                      href: g.url,
                    }))}
                />
              )}
            </div>
            <div>
              {n.body && <RichText data={n.body} />}
              {!n.body && htmlBody && (
                <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
              )}
            </div>
          </section>
        )
      })}

      {/* Ask the Archive — AI Search */}
      <AskTheArchive />

      {/* Site of the Week */}
      {currentSTW.length > 0 && (() => {
        const stw = currentSTW[0]
        const section = stw.section as {
          title?: string
          slug?: string
          photos?: Array<{ photo?: { imageId?: string; title?: string } | number }>
        } | null
        const stwHtmlBody = (stw as unknown as Record<string, unknown>).htmlBody as string | null

        // Build slide list. Lead with the SOTW's featured imageId so it's
        // the first thing visitors see; then cycle through the section's
        // other photos.
        const sectionSlides: Slide[] = (section?.photos || [])
          .map((p) => (typeof p.photo === 'object' && p.photo ? p.photo : null))
          .filter((p): p is { imageId?: string; title?: string } => !!p && !!p.imageId)
          .map((p) => ({ imageId: p.imageId!, caption: p.title }))

        const featured: Slide[] = stw.imageId
          ? [{ imageId: stw.imageId, caption: section?.title }]
          : []
        const slides: Slide[] = [
          ...featured,
          ...sectionSlides.filter((s) => s.imageId !== stw.imageId),
        ]

        return (
          <section>
            <h2 className="pln-h2">Site of the Week</h2>
            <div className="pln-sotw">
              {slides.length > 0 && (
                <PhotoSlideshow slides={slides} />
              )}
              <div>
                {section && typeof section === 'object' && section.slug && (
                  <h3 className="pln-h3">
                    <a href={`/browse/${section.slug}`}>{section.title}</a>
                  </h3>
                )}
                {stw.body && <RichText data={stw.body} />}
                {!stw.body && stwHtmlBody && (
                  <div dangerouslySetInnerHTML={{ __html: stwHtmlBody }} />
                )}
              </div>
            </div>
          </section>
        )
      })()}
    </div>
  )
}
