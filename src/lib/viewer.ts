import { getPayload, type Where } from 'payload'
import { headers as getHeaders } from 'next/headers'
import config from '@payload-config'

/**
 * Returns `true` if the current request is from a logged-in admin user.
 *
 * Used to decide whether unpublished photos/sections should be visible
 * (admins: yes, public: no). Failures (e.g. transient DB issues) fall
 * back to "not logged in" — the same posture as the layout's auth check.
 */
export async function viewerIsAdmin(): Promise<boolean> {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    return !!user
  } catch {
    return false
  }
}

/**
 * `where` clause fragment that excludes unpublished docs for public
 * viewers and is empty for admins. `published: not_equals: false` also
 * matches null/undefined so any row whose published column hasn't been
 * set yet (shouldn't happen post-migration, but cheap insurance) still
 * counts as published.
 *
 * Combine via `where: { and: [otherFilters, publishedFilter] }`.
 */
export async function publishedFilter(): Promise<Where> {
  if (await viewerIsAdmin()) return {}
  return { published: { not_equals: false } }
}
