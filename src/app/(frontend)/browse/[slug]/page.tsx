import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

type Props = {
  params: Promise<{ slug: string }>
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
  const breadcrumbs = (section.breadcrumbs as Array<{ doc?: { slug?: string; title?: string } | number; label?: string; url?: string }>) || []

  // Get HTML body
  const htmlBody = (section as unknown as Record<string, unknown>).htmlBody as string | null
  const sectionImage = (section as unknown as Record<string, unknown>).sectionImage as string | null

  // Get photos array
  const photos = (section.photos || []) as Array<{
    photo?: {
      id: number
      imageId?: string
      title?: string
    } | number
  }>

  return (
    <div>
      {/* Breadcrumbs */}
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {breadcrumbs.map((crumb, i) => {
          const doc = typeof crumb.doc === 'object' ? crumb.doc : null
          const crumbSlug = doc?.slug
          const label = crumb.label || doc?.title || ''
          const isLast = i === breadcrumbs.length - 1
          return (
            <span key={i}>
              {' / '}
              {isLast ? (
                <strong>{label}</strong>
              ) : (
                <a href={`/browse/${crumbSlug}`}>{label}</a>
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

      {/* Section image */}
      {sectionImage && (
        <div style={{ margin: '16px 0' }}>
          <Image
            src={`${S3_BASE}/section/${sectionImage}`}
            alt={`Map or image for ${section.title}`}
            width={600}
            height={400}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}

      {/* Body content */}
      {htmlBody && (
        <div
          style={{ marginBottom: '24px' }}
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
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
        <div style={{ marginTop: '24px', fontSize: '13px', color: '#666' }}>
          <strong>Keywords:</strong> {section.keywords}
        </div>
      )}
    </div>
  )
}
