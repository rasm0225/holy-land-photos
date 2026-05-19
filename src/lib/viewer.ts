import type { Where } from 'payload'

/**
 * `where` clause fragment that excludes unpublished docs on every public
 * page. Logged-in admins viewing the public site see the same filtered
 * view as anonymous visitors — unpublished items are managed through the
 * /admin CMS panel, which uses its own request path and is not affected
 * by this helper.
 *
 * `published: not_equals: false` matches `true` and also null/undefined,
 * so any row whose published column is somehow unset still counts as
 * published (cheap insurance).
 *
 * Combine via `where: { and: [otherFilters, publishedFilter()] }`.
 */
export function publishedFilter(): Where {
  return { published: { not_equals: false } }
}
