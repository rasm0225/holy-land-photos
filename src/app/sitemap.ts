import { getPayload } from 'payload'
import config from '@payload-config'
import type { MetadataRoute } from 'next'

const BASE = 'https://holylandphotos.org'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const published = { published: { not_equals: false } }

  const [photos, sections, pages, news] = await Promise.all([
    payload.find({
      collection: 'photos',
      where: published,
      limit: 0,
      depth: 0,
      select: { imageId: true, updatedAt: true },
    }),
    payload.find({
      collection: 'sections',
      where: published,
      limit: 0,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'pages',
      limit: 0,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'news',
      limit: 0,
      depth: 0,
      select: { id: true, updatedAt: true },
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/search`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/ai-search`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/news`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/site-list`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/site-of-the-week`, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const photoRoutes: MetadataRoute.Sitemap = photos.docs
    .filter((p) => p.imageId)
    .map((p) => ({
      url: `${BASE}/photos/${p.imageId}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))

  const sectionRoutes: MetadataRoute.Sitemap = sections.docs
    .filter((s) => s.slug)
    .map((s) => ({
      url: `${BASE}/browse/${s.slug}`,
      lastModified: s.updatedAt ? new Date(s.updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  const pageRoutes: MetadataRoute.Sitemap = pages.docs
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE}/pages/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

  const newsRoutes: MetadataRoute.Sitemap = news.docs.map((n) => ({
    url: `${BASE}/news/${n.id}`,
    lastModified: n.updatedAt ? new Date(n.updatedAt) : undefined,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...sectionRoutes, ...photoRoutes, ...pageRoutes, ...newsRoutes]
}
