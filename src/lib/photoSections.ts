import { dbQuery } from './db'

export type PhotoSection = { title: string; slug: string }

/**
 * Given a list of photo IDs, return a map of photoId → one section
 * (title + slug) that the photo belongs to. If a photo belongs to
 * multiple published sections, the one with the smallest section id
 * wins — deterministic and roughly "the first section the photo was
 * added to."
 *
 * Used to annotate Recent Additions tiles (homepage + /pages/recent-
 * additions) with the site name, per Carl's request.
 */
export async function getOneSectionPerPhoto(
  photoIds: ReadonlyArray<number>,
): Promise<Map<number, PhotoSection>> {
  const map = new Map<number, PhotoSection>()
  if (photoIds.length === 0) return map

  // Cast IDs to integers so we can safely interpolate into the SQL.
  const idList = photoIds
    .map((n) => Number(n))
    .filter((n) => Number.isInteger(n))
    .join(',')
  if (!idList) return map

  const rows = await dbQuery(`
    SELECT photo_id, section_title, section_slug FROM (
      SELECT sp.photo_id,
             s.title AS section_title,
             s.slug AS section_slug,
             ROW_NUMBER() OVER (PARTITION BY sp.photo_id ORDER BY sp._parent_id) AS rn
      FROM sections_photos sp
      JOIN sections s ON s.id = sp._parent_id
      WHERE sp.photo_id IN (${idList})
        AND (s.published IS NULL OR s.published != 0)
    ) WHERE rn = 1
  `)

  for (const row of rows) {
    const photoId = Number(row.photo_id)
    const title = row.section_title as string | null
    const slug = row.section_slug as string | null
    if (!Number.isInteger(photoId) || !title || !slug) continue
    map.set(photoId, { title, slug })
  }
  return map
}
