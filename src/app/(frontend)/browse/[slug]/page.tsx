import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import PhotoLightbox from '../../components/PhotoLightbox'
import { approvedGeo, placeJsonLd } from '@/lib/sectionGeo'

const S3_BASE = 'https://photos.holylandphotos.org'

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

  // Unpublished sections look like 404s on the public site (admins
  // manage them via /admin).
  if ((section as unknown as { published?: boolean }).published === false) {
    return { title: 'Not Found', robots: { index: false, follow: false } }
  }

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
      url: `/browse/${section.slug}`,
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

  // Unpublished sections 404 on the public site.
  if ((section as unknown as { published?: boolean }).published === false) {
    return notFound()
  }

  // Fetch child sections (filter unpublished out)
  const { docs: children } = await payload.find({
    collection: 'sections',
    where: {
      and: [
        { parent: { equals: section.id } },
        { published: { not_equals: false } },
      ],
    },
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

  // Determine section image source:
  // 1. primaryImage (relationship to Photos collection) — highest priority, always full-res
  // 2. sectionImage filename with matching photo record — use full-res from root
  // 3. sectionImage filename only — use low-res from section/ folder
  const primaryImage = typeof section.primaryImage === 'object' && section.primaryImage
    ? (section.primaryImage as { imageId?: string })
    : null
  let sectionImageSrc: string | null = null

  if (primaryImage?.imageId) {
    sectionImageSrc = `${S3_BASE}/${primaryImage.imageId}.jpg`
  } else if (sectionImage) {
    sectionImageSrc = `${S3_BASE}/section/${sectionImage}`
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

  // Get photos array (filter unpublished out)
  const allPhotos = (section.photos || []) as Array<{
    photo?: {
      id: number
      imageId?: string
      title?: string
      published?: boolean
    } | number
  }>
  const photos = allPhotos.filter((p) =>
    typeof p.photo === 'object' ? p.photo?.published !== false : true,
  )

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

  // Place JSON-LD — emitted only for site-type sections with
  // human-approved coordinates. Knowledge-panel-eligible for
  // archaeological/biblical sites Google indexes by name.
  const sd = section as unknown as {
    latitude?: number | null
    longitude?: number | null
    geoReviewStatus?: string | null
  }
  const geo =
    section.sectionType === 'site'
      ? approvedGeo({
          title: section.title,
          latitude: sd.latitude,
          longitude: sd.longitude,
          geoReviewStatus: sd.geoReviewStatus,
          breadcrumbs: section.breadcrumbs as Array<{ label?: string }> | null,
        })
      : null
  const placeDescription = htmlBody
    ? htmlBody.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
    : undefined
  const placeJsonLdBlock = geo
    ? { '@context': 'https://schema.org', ...placeJsonLd(geo, placeDescription) }
    : null

  // ItemList JSON-LD for the photo grid. Tells Google "this page is a
  // curated list of N items", which can surface as a list-style result
  // in image search.
  const itemListJsonLd =
    photos.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Photos of ${section.title}`,
          numberOfItems: photos.length,
          itemListElement: photos
            .map((item, i) => {
              const p = typeof item.photo === 'object' ? item.photo : null
              if (!p?.imageId) return null
              return {
                '@type': 'ListItem',
                position: i + 1,
                url: `https://holylandphotos.org/photos/${p.imageId}`,
                name: p.title || p.imageId,
              }
            })
            .filter(Boolean),
        }
      : null

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {placeJsonLdBlock && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLdBlock) }}
        />
      )}
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      {/* Breadcrumbs */}
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          return (
            <span key={i}>
              <span className="pln-sep">›</span>
              {isLast ? (
                <span className="pln-current">{crumb.label}</span>
              ) : (
                <a href={`/browse/${crumb.slug}`}>{crumb.label}</a>
              )}
            </span>
          )
        })}
      </nav>

      <h1 className="pln-h1">{section.title}</h1>

      {/* Section type badge */}
      {section.sectionType && (
        <span className="pln-badge">{section.sectionType}</span>
      )}

      {/* Section image + body two-column */}
      {(sectionImageSrc || section.body || htmlBody) && (
        <div className="pln-two">
          {sectionImageSrc && (
            <figure className="pln-figure">
              <PhotoLightbox
                src={sectionImageSrc}
                alt={(primaryImage as { title?: string })?.title || section.title}
              >
                <Image
                  src={sectionImageSrc}
                  alt={(primaryImage as { title?: string })?.title || section.title}
                  width={800}
                  height={600}
                  sizes="(max-width: 767px) 100vw, 42vw"
                />
              </PhotoLightbox>
              <figcaption className="pln-figcaption">Click image to enlarge</figcaption>
            </figure>
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
        <div>
          <h2 className="pln-h2">Subsections</h2>
          <ul className="pln-list">
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
          <h2 className="pln-h2">Photos <span style={{ color: 'var(--ink-faint)', fontWeight: 400, fontSize: 17 }}>({photos.length})</span></h2>
          <div className="pln-grid">
            {photos.map((item, i) => {
              const photo = typeof item.photo === 'object' ? item.photo : null
              if (!photo) return null
              const imageId = photo.imageId || ''
              return (
                <a key={i} className="pln-thumb" href={`/photos/${imageId}?s=${slug}`}>
                  <Image
                    src={`${S3_BASE}/${imageId}.jpg`}
                    alt={photo.title || imageId}
                    width={200}
                    height={150}
                    sizes="200px"
                    className="pln-thumb-img"
                  />
                  <span className="pln-thumb-cap">{photo.title || imageId}</span>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Keywords */}
      {section.keywords && (
        <div className="pln-kw">
          <span className="pln-kw-label">Keywords:</span>
          {section.keywords.split(',').map((kw: string, i: number) => {
            const trimmed = kw.trim()
            if (!trimmed) return null
            return (
              <span key={trimmed}>
                {i > 0 && <span className="pln-kw-sep"> · </span>}
                <a href={`/keywords/${encodeURIComponent(trimmed)}`}>{trimmed}</a>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
