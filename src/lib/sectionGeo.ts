/**
 * Shared helpers for emitting Place / contentLocation JSON-LD from
 * the sections collection. Gated on geoReviewStatus === 'approved' so
 * that only human-confirmed coordinates ever reach search engines.
 */

// The 12 countries that appear in section ancestry chains. Used to
// derive `containedInPlace` from a section's breadcrumbs.
const COUNTRY_NAMES = [
  'Israel',
  'Turkey',
  'Greece',
  'Jordan',
  'Lebanon',
  'Italy',
  'Cyprus',
  'Egypt',
  'Syria',
  'Albania',
  'Malta',
  'France',
]

export function countryFromBreadcrumbs(
  breadcrumbs?: Array<{ label?: string }> | null,
): string | undefined {
  if (!breadcrumbs) return undefined
  for (const b of breadcrumbs) {
    const label = b.label?.trim()
    if (!label) continue
    for (const c of COUNTRY_NAMES) {
      // Some country sections have parenthetical suffixes in their
      // titles (e.g. "Egypt (3 folders)") that we want to strip.
      if (label === c || label.startsWith(`${c} `) || label.startsWith(`${c}(`)) {
        return c
      }
    }
  }
  return undefined
}

export type ApprovedGeo = {
  latitude: number
  longitude: number
  country?: string
  name: string
}

export function approvedGeo(section: {
  title: string
  latitude?: number | null
  longitude?: number | null
  geoReviewStatus?: string | null
  breadcrumbs?: Array<{ label?: string }> | null
}): ApprovedGeo | null {
  if (section.geoReviewStatus !== 'approved') return null
  if (typeof section.latitude !== 'number' || typeof section.longitude !== 'number') return null
  return {
    latitude: section.latitude,
    longitude: section.longitude,
    country: countryFromBreadcrumbs(section.breadcrumbs),
    name: section.title,
  }
}

export function placeJsonLd(geo: ApprovedGeo, description?: string) {
  return {
    '@type': 'Place' as const,
    name: geo.name,
    ...(description ? { description } : {}),
    geo: {
      '@type': 'GeoCoordinates' as const,
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    ...(geo.country
      ? { containedInPlace: { '@type': 'Place' as const, name: geo.country } }
      : {}),
  }
}
