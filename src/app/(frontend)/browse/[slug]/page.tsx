import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { KeywordLinks } from '../../components/KeywordLinks'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'sections',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const section = docs[0]
  if (!section) return { title: 'Not Found' }

  const htmlBody = (section as unknown as Record<string, unknown>).htmlBody as string | null
  const sectionImage = (section as unknown as Record<string, unknown>).sectionImage as string | null

  const description = htmlBody
    ? htmlBody.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0, 200)
    : `Browse photos of ${section.title} — Holy Land Photos`

  const images = sectionImage ? [`${S3_BASE}/section/${sectionImage}`] : []

  return {
    title: section.title,
    description,
    openGraph: {
      title: `${section.title} — Holy Land Photos`,
      description,
      type: 'website',
      ...(images.length > 0 && { images }),
    },
    twitter: {
      title: `${section.title} — Holy Land Photos`,
      description,
      ...(images.length > 0 && { images }),
    },
  }
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  // Fetch this section
  const { docs } = await payload.find({
    collection: 'sections',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  const section = docs[0]
  if (!section) return notFound()

  // Fetch child sections
  const { docs: children } = await payload.find({
    collection: 'sections',
    where: { parent: { equals: section.id } },
    sort: 'title',
    limit: 0,
    depth: 0,
  })

  // Build breadcrumbs from the breadcrumbs array
  // The nested-docs plugin stores a `url` field with the nested path (e.g. /browse-by-countries/israel/north)
  // and a `doc` field that may be populated (object) or unpopulated (number) depending on depth.
  // We extract the slug from the url's last segment as a reliable fallback.
  const rawBreadcrumbs = (section.breadcrumbs as Array<{ doc?: { slug?: string; title?: string } | number; label?: string; url?: string }>) || []
  const breadcrumbs = rawBreadcrumbs.map((crumb) => {
    const doc = typeof crumb.doc === 'object' ? crumb.doc : null
    const slugFromUrl = crumb.url?.split('/').filter(Boolean).pop() || ''
    return {
      slug: doc?.slug || slugFromUrl,
      label: crumb.label || doc?.title || '',
      url: crumb.url,
    }
  })

  // Get HTML body
  const htmlBody = (section as unknown as Record<string, unknown>).htmlBody as string | null
  const sectionImage = (section as unknown as Record<string, unknown>).sectionImage as string | null

  // Check if section image has a higher-res version at root (as a photo)
  let sectionImageSrc = sectionImage ? `${S3_BASE}/section/${sectionImage}` : null
  if (sectionImage) {
    const imageIdFromFilename = sectionImage.replace(/\.jpg$/i, '')
    const { docs: photoMatch } = await payload.find({
      collection: 'photos',
      where: { imageId: { equals: imageIdFromFilename } },
      limit: 1,
      depth: 0,
      select: { imageId: true },
    })
    if (photoMatch.length > 0) {
      sectionImageSrc = `${S3_BASE}/${sectionImage}`
    }
  }

  // Get photos array
  const photos = (section.photos || []) as Array<{
    photo?: {
      id: number
      imageId?: string
      title?: string
    } | number
  }>

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://holylandphotos.org/' },
      ...breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: crumb.label,
        ...(crumb.slug && { item: `https://holylandphotos.org/browse/${crumb.slug}` }),
      })),
    ],
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .section-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        @media (max-width: 680px) { .section-two-col { grid-template-columns: 1fr; } }
      `}} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumbs */}
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          return (
            <span key={i}>
              {' / '}
              {isLast ? (
                <strong>{crumb.label}</strong>
              ) : (
                <a href={`/browse/${crumb.slug}`}>{crumb.label}</a>
              )}
            </span>
          )
        })}
      </nav>

      <h1>{section.title}</h1>

      {/* Section type badge */}
      {section.sectionType && (
        <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>
          {section.sectionType}
        </span>
      )}

      {/* Section image + body two-column */}
      {(sectionImageSrc || section.body || htmlBody) && (
        <div className="section-two-col" style={{ marginTop: '16px', marginBottom: '24px' }}>
          {sectionImageSrc && (
            <div>
              <Image
                src={sectionImageSrc}
                alt={`Map or image for ${section.title}`}
                width={800}
                height={600}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
          <div>
            {section.body && <RichText data={section.body} />}
            {!section.body && htmlBody && (
              <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
            )}
          </div>
        </div>
      )}

      {/* Child sections */}
      {children.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2>Subsections</h2>
          <ul>
            {children.map((child) => (
              <li key={child.id}>
                <a href={`/browse/${child.slug}`}>{child.title}</a>
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
            {photos.map((item, i) => {
              const photo = typeof item.photo === 'object' ? item.photo : null
              if (!photo) return null
              const imageId = photo.imageId || ''
              return (
                <a
                  key={i}
                  href={`/photos/${imageId}?s=${slug}`}
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

      {/* Keywords */}
      {section.keywords && (
        <div style={{ marginTop: '24px' }}>
          <KeywordLinks keywords={section.keywords} />
        </div>
      )}
    </div>
  )
}
