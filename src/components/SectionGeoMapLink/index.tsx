'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'

/**
 * Sidebar UI field on the Sections edit form that surfaces "Open in
 * Google Maps" and "Open in OpenStreetMap" links built from the current
 * latitude/longitude values. Updates live as the reviewer edits the
 * coordinate fields.
 */
export const SectionGeoMapLink: React.FC = () => {
  const { value: lat } = useField<number | null | undefined>({ path: 'latitude' })
  const { value: lon } = useField<number | null | undefined>({ path: 'longitude' })

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return (
      <div style={{ marginBottom: 20, fontSize: 12, color: 'var(--theme-elevation-400)' }}>
        Set latitude and longitude above to enable map links.
      </div>
    )
  }

  const gmaps = `https://www.google.com/maps?q=${lat},${lon}`
  const osm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`

  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <a
        href={gmaps}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '6px 10px',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 4,
          fontSize: 12,
          textDecoration: 'none',
          color: 'var(--theme-elevation-800)',
          background: 'var(--theme-elevation-50)',
          textAlign: 'center',
        }}
      >
        Open in Google Maps ↗
      </a>
      <a
        href={osm}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '6px 10px',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 4,
          fontSize: 12,
          textDecoration: 'none',
          color: 'var(--theme-elevation-800)',
          background: 'var(--theme-elevation-50)',
          textAlign: 'center',
        }}
      >
        Open in OpenStreetMap ↗
      </a>
    </div>
  )
}
