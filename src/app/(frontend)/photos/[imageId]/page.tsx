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
  const imageUrl = `${S3_BASE}/${photo.imageId}.jpg`

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

  const htmlDescription = (photo as unknown as Record<string, unknown>).htmlDescription as string | null

  // Find which sections this photo belongs to
  const { docs: sectionLinks } = await payload.find({
    collection: 'sections',
    where: {
      'photos.photo': { equals: photo.id },
    },
    limit: 0,
    depth: 2,
    select: { title: true, slug: true, photos: true },
  })

  // Determine prev/next from section context
  let prevPhoto: { imageId: string; title: string } | null = null
  let nextPhoto: { imageId: string; title: string } | null = null
  let contextSection: { title: string; slug: string } | null = null

  if (sectionSlug) {
    const contextDoc = sectionLinks.find((s) => s.slug === sectionSlug)
    if (contextDoc) {
      contextSection = { title: contextDoc.title, slug: contextDoc.slug }
      const photos = (contextDoc.photos || []) as Array<{
        photo?: { id: number; imageId?: string; title?: string } | number
      }>

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
      const photos = (contextDoc.photos || []) as Array<{ photo?: { id: number } | number }>
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: photo.title,
    contentUrl: `${S3_BASE}/${photo.imageId}.jpg`,
    creator: {
      '@type': 'Person',
      name: 'Dr. Carl Rasmussen',
    },
    copyrightYear: new Date().getFullYear(),
    ...(sectionForSchema && {
      about: {
        '@type': 'Place',
        name: sectionForSchema.title,
      },
    }),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back to section + prev/next nav */}
      {contextSection && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '14px' }}>
          <a href={`/browse/${contextSection.slug}`}>
            &larr; {contextSection.title}
          </a>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {prevPhoto ? (
              <a href={`/photos/${prevPhoto.imageId}?s=${sectionSlug}`}>&lsaquo; Prev</a>
            ) : (
              <span style={{ color: '#555' }}>&lsaquo; Prev</span>
            )}
            {positionText && <span style={{ color: '#888' }}>{positionText}</span>}
            {nextPhoto ? (
              <a href={`/photos/${nextPhoto.imageId}?s=${sectionSlug}`}>Next &rsaquo;</a>
            ) : (
              <span style={{ color: '#555' }}>Next &rsaquo;</span>
            )}
          </div>
        </nav>
      )}

      <h1>{photo.title}</h1>
      <p style={{ fontSize: '13px', color: '#888' }}>ID: {photo.imageId}</p>

      {/* Main image */}
      <div style={{ margin: '16px 0' }}>
        <Image
          src={`${S3_BASE}/${photo.imageId}.jpg`}
          alt={photo.title}
          width={800}
          height={600}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Description — Lexical rich text or legacy HTML */}
      {photo.description && (
        <div style={{ marginBottom: '24px' }}>
          <RichText data={photo.description} />
        </div>
      )}
      {!photo.description && htmlDescription && (
        <div
          style={{ marginBottom: '24px' }}
          dangerouslySetInnerHTML={{ __html: htmlDescription }}
        />
      )}

      {/* Sections this photo belongs to */}
      {sectionLinks.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3>Found in</h3>
          <ul>
            {sectionLinks.map((s) => (
              <li key={s.id}>
                <a href={`/browse/${s.slug}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keywords */}
      {photo.keywords && (
        <KeywordLinks keywords={photo.keywords} />
      )}
    </div>
  )
}
