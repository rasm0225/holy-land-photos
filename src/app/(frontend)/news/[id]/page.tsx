import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const payload = await getPayload({ config })

  const news = await payload.findByID({
    collection: 'news',
    id: parseInt(id, 10),
    depth: 0,
  }).catch(() => null)

  if (!news) return { title: 'Not Found' }

  const htmlBody = (news as unknown as Record<string, unknown>).htmlBody as string | null
  const description = htmlBody
    ? htmlBody.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0, 200)
    : `${news.title} — Holy Land Photos`

  // Use first gallery image for OG if available
  const gallery = (news.imageGallery || []) as Array<{ imageId?: string }>
  const ogImage = gallery[0]?.imageId ? `${S3_BASE}/${gallery[0].imageId}.jpg` : undefined

  return {
    title: news.title,
    description,
    openGraph: {
      title: `${news.title} — Holy Land Photos`,
      description,
      type: 'article',
      url: `/news/${news.id}`,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      title: `${news.title} — Holy Land Photos`,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function NewsPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config })

  const news = await payload.findByID({
    collection: 'news',
    id: parseInt(id, 10),
    depth: 0,
  }).catch(() => null)

  if (!news) return notFound()

  const htmlBody = (news as unknown as Record<string, unknown>).htmlBody as string | null
  const gallery = (news.imageGallery || []) as Array<{
    imageId?: string
    caption?: string
    url?: string
  }>

  // Article JSON-LD — eligible for Top Stories carousels in Google.
  // Author is always Dr. Carl Rasmussen per the site's editorial model.
  const articleDescription = htmlBody
    ? htmlBody.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280)
    : undefined
  const articleImage = gallery[0]?.imageId
    ? `${S3_BASE}/${gallery[0].imageId}.jpg`
    : undefined
  const articleJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: news.title,
    datePublished: news.createdAt,
    dateModified: news.updatedAt || news.createdAt,
    author: { '@type': 'Person', name: 'Dr. Carl Rasmussen' },
    publisher: {
      '@type': 'Organization',
      name: 'HolyLandPhotos.org',
      url: 'https://holylandphotos.org',
    },
    url: `https://holylandphotos.org/news/${news.id}`,
    mainEntityOfPage: `https://holylandphotos.org/news/${news.id}`,
  }
  if (articleDescription) articleJsonLd.description = articleDescription
  if (articleImage) articleJsonLd.image = articleImage

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="pln-sep">›</span>
        <a href="/news">News</a>
        <span className="pln-sep">›</span>
        <span className="pln-current">{news.title}</span>
      </nav>

      <h1 className="pln-h1">{news.title}</h1>

      <div className="pln-search-meta">
        {new Date(news.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      {/* Image gallery */}
      {gallery.length > 0 && (
        <div className="pln-grid" style={{ marginBottom: 24 }}>
          {gallery.map((item, i) => {
            const imageId = item.imageId || ''
            const content = (
              <div key={i} className="pln-thumb">
                <Image
                  src={`${S3_BASE}/${imageId}.jpg`}
                  alt={item.caption || imageId}
                  width={400}
                  height={300}
                  sizes="(max-width: 767px) 50vw, 200px"
                  className="pln-thumb-img"
                />
                {item.caption && (
                  <span className="pln-thumb-cap">{item.caption}</span>
                )}
              </div>
            )
            if (item.url) {
              return <a key={i} href={item.url} className="pln-thumb">{content}</a>
            }
            if (imageId) {
              return <a key={i} href={`/photos/${imageId}`} className="pln-thumb">{content}</a>
            }
            return content
          })}
        </div>
      )}

      {/* YouTube embed */}
      {news.youtubeVideoId && (
        <div style={{ marginBottom: 24, position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${news.youtubeVideoId}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={news.title}
          />
        </div>
      )}

      {/* Body content */}
      {news.body && <RichText data={news.body} />}
      {!news.body && htmlBody && (
        <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
      )}
    </div>
  )
}
