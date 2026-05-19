import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/gone'],
      },
    ],
    sitemap: 'https://holylandphotos.org/sitemap.xml',
    host: 'https://holylandphotos.org',
  }
}
