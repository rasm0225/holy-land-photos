'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type Candidate = {
  lat: number
  lon: number
  source: string
  confidence: string
  notes: string
}

export type GeoSite = {
  id: number
  title: string
  slug: string
  country: string
  ancestry: string
  description: string
  current: {
    lat: number | null
    lon: number | null
    status: string
    source: string
    notes: string
  }
  alternatives: Candidate[]
}

type Filter = 'pending' | 'all' | 'approved' | 'excluded' | 'needs_research'

// Leaflet types are loosely held — we only need a runtime handle to its API.
type LeafletAPI = {
  map: (el: HTMLElement, opts?: unknown) => {
    setView: (latlng: [number, number], zoom?: number) => unknown
    remove: () => void
    eachLayer: (fn: (layer: { remove: () => void } & Record<string, unknown>) => void) => void
  }
  tileLayer: (url: string, opts: unknown) => { addTo: (m: unknown) => void }
  marker: (latlng: [number, number], opts: unknown) => {
    addTo: (m: unknown) => unknown
    on: (event: string, fn: (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => void) => void
    bindPopup: (html: string) => unknown
  }
  divIcon: (opts: unknown) => unknown
}

export const GeoReviewClient: React.FC<{ sites: GeoSite[] }> = ({ sites: initialSites }) => {
  const [sites, setSites] = useState(initialSites)
  const [filter, setFilter] = useState<Filter>('pending')
  const [index, setIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [draftLat, setDraftLat] = useState<number | null>(null)
  const [draftLon, setDraftLon] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<ReturnType<LeafletAPI['map']> | null>(null)
  const draggablePinRef = useRef<ReturnType<LeafletAPI['marker']> | null>(null)
  const leafletRef = useRef<LeafletAPI | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return sites
    return sites.filter((s) => s.current.status === filter)
  }, [sites, filter])

  const current = filtered[index]

  // Lazy-load Leaflet on mount (it's window-dependent so can't be SSR'd).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')) as unknown as LeafletAPI
      // Leaflet's CSS lives in the package; add it once.
      if (!document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.setAttribute('data-leaflet-css', 'true')
        document.head.appendChild(link)
      }
      if (!cancelled) leafletRef.current = L
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // (Re)render the map whenever the current site changes.
  useEffect(() => {
    const L = leafletRef.current
    if (!L || !mapRef.current || !current) return

    // Tear down any prior instance.
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const startLat = current.current.lat ?? current.alternatives[0]?.lat ?? 31.78
    const startLon = current.current.lon ?? current.alternatives[0]?.lon ?? 35.23

    const map = L.map(mapRef.current, { zoomControl: true })
    map.setView([startLat, startLon], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Reference pins (alternatives) — non-draggable, smaller, distinct color.
    current.alternatives.forEach((alt) => {
      const isCurrentSource = alt.source === current.current.source
      const color = isCurrentSource ? '#2c2416' : alt.source === 'llm' ? '#7a3b18' : '#666'
      const opacity = isCurrentSource ? 1.0 : 0.55
      const icon = L.divIcon({
        className: 'geo-alt-pin',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};opacity:${opacity};border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.5)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })
      const m = L.marker([alt.lat, alt.lon], { icon })
      m.addTo(map)
      m.bindPopup(`<strong>${alt.source}</strong> (${alt.confidence})<br>${alt.lat.toFixed(5)}, ${alt.lon.toFixed(5)}<br><em>${alt.notes.replace(/[<>]/g, '')}</em>`)
    })

    // Draggable pin — the one the reviewer commits.
    if (current.current.lat != null && current.current.lon != null) {
      const pin = L.marker([current.current.lat, current.current.lon], { draggable: true })
      pin.addTo(map)
      pin.on('dragend', (e) => {
        const ll = e.target.getLatLng()
        setDraftLat(ll.lat)
        setDraftLon(ll.lng)
      })
      draggablePinRef.current = pin
    } else {
      draggablePinRef.current = null
    }

    mapInstanceRef.current = map
    setDraftLat(null)
    setDraftLon(null)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [current])

  const updateSite = useCallback((id: number, patch: Partial<GeoSite['current']>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, current: { ...s.current, ...patch } } : s)),
    )
  }, [])

  const advance = useCallback(() => {
    // After approving/rejecting/excluding, the current row drops out of the
    // filtered list, so the same `index` now points at the next pending site.
    // Cap to length so we don't go past the end.
    setIndex((i) => Math.min(i, Math.max(0, filtered.length - 2)))
  }, [filtered.length])

  const save = useCallback(
    async (action: 'approved' | 'excluded' | 'needs_research') => {
      if (!current || saving) return
      setSaving(true)
      const lat = action === 'approved' ? (draftLat ?? current.current.lat) : null
      const lon = action === 'approved' ? (draftLon ?? current.current.lon) : null
      const source =
        action === 'approved' && draftLat != null
          ? 'adjusted'
          : action === 'approved'
            ? current.current.source
            : current.current.source

      try {
        const res = await fetch(`/api/sections/${current.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: lat,
            longitude: lon,
            geoReviewStatus: action,
            geoSource: source,
          }),
        })
        if (!res.ok) {
          alert(`Save failed: ${res.status} ${await res.text()}`)
          setSaving(false)
          return
        }
        updateSite(current.id, {
          lat,
          lon,
          status: action,
          source,
        })
        advance()
      } catch (e) {
        alert(`Save error: ${e}`)
      } finally {
        setSaving(false)
      }
    },
    [current, draftLat, draftLon, saving, advance, updateSite],
  )

  // Keyboard shortcuts: Y=approve, E=exclude, R=needs research, ← →=nav.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault()
        save('approved')
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        save('excluded')
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        save('needs_research')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [save, filtered.length])

  const statusCounts = useMemo(() => {
    const c = { pending: 0, approved: 0, excluded: 0, needs_research: 0 }
    for (const s of sites) {
      if (s.current.status in c) c[s.current.status as keyof typeof c]++
    }
    return c
  }, [sites])

  return (
    <div style={{ padding: 32, fontFamily: 'var(--font-body)' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Geo Review</h1>
        <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13, marginTop: 4 }}>
          {statusCounts.pending} pending · {statusCounts.approved} approved ·{' '}
          {statusCounts.excluded} excluded · {statusCounts.needs_research} need research
        </p>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['pending', 'all', 'approved', 'excluded', 'needs_research'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setIndex(0)
            }}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid var(--theme-elevation-200)',
              background: filter === f ? 'var(--theme-elevation-100)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {!current ? (
        <p>Nothing to review in this filter.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20 }}>
          <div>
            <div ref={mapRef} style={{ height: 520, borderRadius: 6, border: '1px solid var(--theme-elevation-200)' }} />
            <p style={{ fontSize: 12, color: 'var(--theme-elevation-500)', marginTop: 8 }}>
              Drag the pin to adjust. Smaller pins are alternative candidates from the geocoder
              (click them for details). Keyboard: <kbd>Y</kbd> approve · <kbd>E</kbd> exclude ·{' '}
              <kbd>R</kbd> needs research · <kbd>←</kbd>/<kbd>→</kbd> navigate.
            </p>
          </div>
          <aside>
            <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--theme-elevation-500)' }}>
              {index + 1} of {filtered.length} ({filter})
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px' }}>{current.title}</h2>
            <p style={{ fontSize: 12, color: 'var(--theme-elevation-500)', margin: 0 }}>
              {current.ancestry || current.country}
            </p>

            <div style={{ marginTop: 14, fontSize: 13 }}>
              <strong>Current:</strong>{' '}
              {current.current.lat != null ? (
                <>
                  {(draftLat ?? current.current.lat).toFixed(5)},{' '}
                  {(draftLon ?? current.current.lon!).toFixed(5)}{' '}
                  <span style={{ color: 'var(--theme-elevation-500)' }}>
                    ({draftLat != null ? 'adjusted' : current.current.source || 'unknown'})
                  </span>
                </>
              ) : (
                <em>no coords</em>
              )}
            </div>

            {current.current.lat != null && current.current.lon != null && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, fontSize: 12 }}>
                <a
                  href={`https://www.google.com/maps?q=${draftLat ?? current.current.lat},${draftLon ?? current.current.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--theme-elevation-700)' }}
                >
                  Google Maps ↗
                </a>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${draftLat ?? current.current.lat}&mlon=${draftLon ?? current.current.lon}#map=15/${draftLat ?? current.current.lat}/${draftLon ?? current.current.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--theme-elevation-700)' }}
                >
                  OSM ↗
                </a>
              </div>
            )}

            {current.current.notes && (
              <p style={{ fontSize: 12, color: 'var(--theme-elevation-600)', marginTop: 6 }}>
                {current.current.notes}
              </p>
            )}

            {current.alternatives.length > 1 && (
              <details style={{ marginTop: 10, fontSize: 12 }}>
                <summary style={{ cursor: 'pointer' }}>
                  {current.alternatives.length} candidates
                </summary>
                <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                  {current.alternatives.map((a, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      <strong>{a.source}</strong> ({a.confidence}): {a.lat.toFixed(4)},{' '}
                      {a.lon.toFixed(4)}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {current.description && (
              <details style={{ marginTop: 10, fontSize: 12 }}>
                <summary style={{ cursor: 'pointer' }}>Description (from site)</summary>
                <p style={{ marginTop: 6, color: 'var(--theme-elevation-700)' }}>
                  {current.description}
                </p>
              </details>
            )}

            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                disabled={saving || current.current.lat == null}
                onClick={() => save('approved')}
                style={btnStyle('#2d6a4f', 'white')}
              >
                Approve (Y)
              </button>
              <button
                disabled={saving}
                onClick={() => save('excluded')}
                style={btnStyle('#6b6156', 'white')}
              >
                Not a place (E)
              </button>
              <button
                disabled={saving}
                onClick={() => save('needs_research')}
                style={btnStyle('#b85c2c', 'white')}
              >
                Needs research (R)
              </button>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
                ← Prev
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(i + 1, filtered.length - 1))}
                disabled={index >= filtered.length - 1}
              >
                Next →
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 600,
    background: bg,
    color,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  }
}
