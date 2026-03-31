import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{ imageId: string }>
}

export default async function PhotoPage({ params }: Props) {
  const { imageId } = await params
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
    depth: 0,
    select: { title: true, slug: true },
  })

  return (
    <div>
      <h1>{photo.title}</h1>
      <p style={{ fontSize: '13px', color: '#888' }}>ID: {photo.imageId}</p>

      {/* Main image */}
      <div style={{ margin: '16px 0' }}>
        <img
          src={`https://img.holylandphotos.org/${photo.imageId}.jpg?w=800&mode=max`}
          alt={photo.title}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Description */}
      {htmlDescription && (
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
        <div style={{ fontSize: '13px', color: '#666' }}>
          <strong>Keywords:</strong> {photo.keywords}
        </div>
      )}
    </div>
  )
}
