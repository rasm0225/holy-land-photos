import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import PhotoLightbox from '../../components/PhotoLightbox'
import DownloadButton from '../../components/DownloadButton'
import { approvedGeo, placeJsonLd } from '@/lib/sectionGeo'
import { photoSrc } from '@/lib/photoSrc'

type Props = {
  params: Promise<{ imageId: string }>
  searchParams: Promise<{ s?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { imageId } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'photos',
    where: { imageId: { equals: imageId } },
    limit: 1,
    depth: 0,
  })

  const photo = docs[0]
  if (!photo) return { title: 'Photo Not Found' }

  // Unpublished photos look like 404s on the public site for everyone,
  // including logged-in admins (who manage them via /admin instead).
  if ((photo as unknown as { published?: boolean }).published === false) {
    return { title: 'Photo Not Found', robots: { index: false, follow: false } }
  }

  // Find the section for context in the title
  const { docs: sections } = await payload.find({
    collection: 'sections',
    where: { 'photos.photo': { equals: photo.id } },
    limit: 1,
    depth: 0,
    select: { title: true },
  })
  const sectionTitle = sections[0]?.title

  const title = sectionTitle ? `${photo.title} — ${sectionTitle}` : photo.title
  const imageUrl = photoSrc(photo)

  // Strip HTML tags for description
  const htmlDesc = (photo as unknown as Record<string, unknown>).htmlDescription as string | null
  const description = htmlDesc
    ? htmlDesc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0, 200)
    : `${photo.title} — Holy Land Photos`

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Holy Land Photos`,
      description,
      type: 'article',
      url: `/photos/${photo.imageId}`,
      images: [imageUrl],
    },
    twitter: {
      title: `${title} — Holy Land Photos`,
      description,
      images: [imageUrl],
    },
  }
}

export default async function PhotoPage({ params, searchParams }: Props) {
  const { imageId } = await params
  const { s: sectionSlug } = await searchParams
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'photos',
    where: { imageId: { equals: imageId } },
    limit: 1,
    depth: 0,
  })

  const photo = docs[0]
  if (!photo) return notFound()

  // Unpublished photos 404 for everyone on the public site (admins
  // manage them via /admin).
  if ((photo as unknown as { published?: boolean }).published === false) {
    return notFound()
  }

  const htmlDescription = (photo as unknown as Record<string, unknown>).htmlDescription as string | null

  // Find which sections this photo belongs to (filter unpublished
  // sections out of the "Found in" list).
  const { docs: sectionLinks } = await payload.find({
    collection: 'sections',
    where: {
      and: [
        { 'photos.photo': { equals: photo.id } },
        { published: { not_equals: false } },
      ],
    },
    limit: 0,
    depth: 2,
    select: {
      title: true,
      slug: true,
      photos: true,
      latitude: true,
      longitude: true,
      geoReviewStatus: true,
      breadcrumbs: true,
    },
  })

  // Determine prev/next from section context
  let prevPhoto: { imageId: string; title: string } | null = null
  let nextPhoto: { imageId: string; title: string } | null = null
  let contextSection: { title: string; slug: string } | null = null

  if (sectionSlug) {
    const contextDoc = sectionLinks.find((s) => s.slug === sectionSlug)
    if (contextDoc) {
      contextSection = { title: contextDoc.title, slug: contextDoc.slug }
      const allPhotos = (contextDoc.photos || []) as Array<{
        photo?: { id: number; imageId?: string; title?: string; published?: boolean } | number
      }>
      // Skip unpublished photos when computing prev/next + position.
      const photos = allPhotos.filter((item) =>
        typeof item.photo === 'object' ? item.photo?.published !== false : true,
      )

      // Find current photo index
      const currentIndex = photos.findIndex((item) => {
        const p = typeof item.photo === 'object' ? item.photo : null
        return p && p.id === photo.id
      })

      if (currentIndex > 0) {
        const prev = typeof photos[currentIndex - 1].photo === 'object' ? photos[currentIndex - 1].photo as { imageId?: string; title?: string } : null
        if (prev?.imageId) {
          prevPhoto = { imageId: prev.imageId, title: prev.title || prev.imageId }
        }
      }

      if (currentIndex >= 0 && currentIndex < photos.length - 1) {
        const next = typeof photos[currentIndex + 1].photo === 'object' ? photos[currentIndex + 1].photo as { imageId?: string; title?: string } : null
        if (next?.imageId) {
          nextPhoto = { imageId: next.imageId, title: next.title || next.imageId }
        }
      }
    }
  }

  // Photo position info
  let positionText = ''
  if (contextSection) {
    const contextDoc = sectionLinks.find((s) => s.slug === sectionSlug)
    if (contextDoc) {
      const allPhotos = (contextDoc.photos || []) as Array<{
        photo?: { id: number; published?: boolean } | number
      }>
      const photos = allPhotos.filter((item) =>
        typeof item.photo === 'object' ? item.photo?.published !== false : true,
      )
      const idx = photos.findIndex((item) => {
        const p = typeof item.photo === 'object' ? item.photo : null
        return p && p.id === photo.id
      })
      if (idx >= 0) {
        positionText = `${idx + 1} of ${photos.length}`
      }
    }
  }

  // Schema.org JSON-LD
  const sectionForSchema = sectionLinks[0]
  const photographerName = (photo as unknown as Record<string, unknown>).photographer as string | null
  const photoYear = (photo as unknown as Record<string, unknown>).year as number | null
  const yearAdded = photo.createdAt ? new Date(photo.createdAt).getUTCFullYear() : null
  const licenseUrl = 'https://holylandphotos.org/pages/permission-to-use'

  // If the parent section has human-approved coordinates, upgrade the
  // existing `about: { Place, name }` to a full `contentLocation` with
  // geo + containedInPlace. contentLocation is the more specific signal
  // Google's image SEO docs ask for; about stays for the unapproved case
  // so the photo still has a topical anchor.
  const sectionForGeo = sectionForSchema as unknown as {
    title?: string
    latitude?: number | null
    longitude?: number | null
    geoReviewStatus?: string | null
    breadcrumbs?: Array<{ label?: string }> | null
  } | undefined
  const photoGeo = sectionForGeo
    ? approvedGeo({
        title: sectionForGeo.title || '',
        latitude: sectionForGeo.latitude,
        longitude: sectionForGeo.longitude,
        geoReviewStatus: sectionForGeo.geoReviewStatus,
        breadcrumbs: sectionForGeo.breadcrumbs,
      })
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: photo.title,
    contentUrl: photoSrc(photo),
    creator: {
      '@type': 'Person',
      name: photographerName || 'Dr. Carl Rasmussen',
    },
    copyrightHolder: {
      '@type': 'Person',
      name: 'Dr. Carl Rasmussen',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HolyLandPhotos.org',
      url: 'https://holylandphotos.org',
    },
    copyrightNotice: `© 1995–${new Date().getUTCFullYear()} Dr. Carl Rasmussen. All rights reserved.`,
    creditText: 'Image courtesy of www.HolyLandPhotos.org',
    license: licenseUrl,
    acquireLicensePage: licenseUrl,
    ...(photoYear && { dateCreated: String(photoYear), copyrightYear: photoYear }),
    ...(photoGeo
      ? { contentLocation: placeJsonLd(photoGeo) }
      : sectionForSchema
        ? { about: { '@type': 'Place', name: sectionForSchema.title } }
        : {}),
  }

  // Parent section for link-targeting: context section if the user
  // arrived via ?s=, otherwise the photo's first listed section.
  const parentSectionSlug = contextSection?.slug ?? sectionLinks[0]?.slug ?? null

  return (
    <div {...(parentSectionSlug ? { 'data-parent-section': parentSectionSlug } : {})}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back to section */}
      {contextSection && (
        <nav className="pln-pnav-up" aria-label="Back to section">
          <a href={`/browse/${contextSection.slug}`}>&larr; {contextSection.title}</a>
        </nav>
      )}

      {/* Prev/Next nav */}
      {contextSection && (
        <nav className="pln-pnav" aria-label="Photo pagination">
          {prevPhoto ? (
            <a href={`/photos/${prevPhoto.imageId}?s=${sectionSlug}`}>&lsaquo; Previous</a>
          ) : (
            <span style={{ color: 'var(--ink-faint)' }}>&lsaquo; Previous</span>
          )}
          {positionText && <span className="pln-pnav-center">{positionText}</span>}
          {nextPhoto ? (
            <a href={`/photos/${nextPhoto.imageId}?s=${sectionSlug}`}>Next &rsaquo;</a>
          ) : (
            <span style={{ color: 'var(--ink-faint)' }}>Next &rsaquo;</span>
          )}
        </nav>
      )}

      {/* Two-column: image + description */}
      <div className="pln-photopage">
        <div className="pln-photo-main">
          <PhotoLightbox src={photoSrc(photo)} alt={photo.title}>
            <Image
              src={photoSrc(photo)}
              alt={photo.title}
              width={800}
              height={600}
              sizes="(max-width: 767px) 100vw, 52vw"
            />
          </PhotoLightbox>
          <div className="pln-photo-meta">ID: {photo.imageId} &middot; &copy; {photographerName || 'Carl Rasmussen'}{yearAdded ? ` · Added: ${yearAdded}` : ''}</div>
          <DownloadButton imageId={photo.imageId} title={photo.title} />
        </div>
        <div className="pln-photo-side">
          <h1 className="pln-h1">{photo.title}</h1>
          <span className="pln-badge">photo</span>

          {photo.description && (
            <RichText data={photo.description} />
          )}
          {!photo.description && htmlDescription && (
            <div dangerouslySetInnerHTML={{ __html: htmlDescription }} />
          )}

          {/* Found in */}
          {sectionLinks.length > 0 && (
            <nav style={{ marginTop: 24 }} aria-label="Found in">
              <h3 className="pln-eyebrow" style={{ marginBottom: 8 }}>Found in</h3>
              <ul className="pln-list">
                {sectionLinks.map((s) => (
                  <li key={s.id}>
                    <a href={`/browse/${s.slug}`}>{s.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Keywords */}
          {photo.keywords && (
            <div className="pln-kw">
              <span className="pln-kw-label">Keywords:</span>
              {photo.keywords.split(',').map((kw: string, i: number) => {
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
      </div>
    </div>
  )
}
