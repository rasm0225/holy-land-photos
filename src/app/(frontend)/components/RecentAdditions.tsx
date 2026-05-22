import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import React from 'react'
import { publishedFilter } from '@/lib/viewer'
import { photoSrc } from '@/lib/photoSrc'

const RANGES = [7, 30, 60] as const
type Range = (typeof RANGES)[number]

function isRange(n: number): n is Range {
  return (RANGES as readonly number[]).includes(n)
}

function dayLabel(n: number): string {
  return `Last ${n} days`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function RecentAdditions({ range: requested }: { range?: string }) {
  // Parse and clamp the requested range to one of the allowed values.
  const parsed = Number.parseInt(requested ?? '', 10)
  const range: Range = isRange(parsed) ? parsed : 7

  const since = new Date()
  since.setDate(since.getDate() - range)

  const payload = await getPayload({ config })
  const published = publishedFilter()
  const { docs: photos, totalDocs } = await payload.find({
    collection: 'photos',
    where: {
      and: [{ createdAt: { greater_than: since.toISOString() } }, published],
    },
    sort: '-createdAt',
    limit: 500,
    depth: 0,
    select: { title: true, imageId: true, filename: true, createdAt: true },
  })

  const linkStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 4,
    fontFamily: 'var(--sans)',
    fontSize: 14,
    textDecoration: 'none',
    border: '1px solid var(--line)',
    background: active ? 'var(--accent, #B85C2C)' : 'transparent',
    color: active ? '#fff' : 'var(--ink)',
  })

  return (
    <div>
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="pln-sep">›</span>
        <span className="pln-current">Recent Additions</span>
      </nav>

      <h1 className="pln-h1">Recent Additions</h1>

      <div
        role="group"
        aria-label="Filter by time range"
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
      >
        {RANGES.map((n) => (
          <a key={n} href={`?range=${n}`} style={linkStyle(n === range)}>
            {dayLabel(n)}
          </a>
        ))}
      </div>

      <p className="pln-search-meta">
        {totalDocs} photo{totalDocs === 1 ? '' : 's'} added in the {dayLabel(range).toLowerCase()}
      </p>

      {photos.length === 0 ? (
        <p>Nothing added in that window. Try a longer range.</p>
      ) : (
        <div className="pln-grid">
          {photos.map((photo) => {
            const imageId = photo.imageId || ''
            return (
              <a key={photo.id} className="pln-thumb" href={`/photos/${imageId}`}>
                <Image
                  src={photoSrc(photo)}
                  alt={photo.title || imageId}
                  width={200}
                  height={150}
                  sizes="200px"
                  className="pln-thumb-img"
                />
                <span className="pln-thumb-cap">{photo.title || imageId}</span>
                {photo.createdAt && (
                  <span className="pln-thumb-cap-sub">{formatDate(photo.createdAt)}</span>
                )}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
