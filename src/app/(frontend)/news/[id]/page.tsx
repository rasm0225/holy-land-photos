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

  return (
    <div>
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <a href="/news">News</a>
        {' / '}
        <strong>{news.title}</strong>
      </nav>

      <h1>{news.title}</h1>

      <p style={{ fontSize: '13px', color: '#888' }}>
        {new Date(news.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {/* Image gallery */}
      {gallery.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {gallery.map((item, i) => {
            const imageId = item.imageId || ''
            const content = (
              <div key={i}>
                <Image
                  src={`${S3_BASE}/${imageId}.jpg`}
                  alt={item.caption || imageId}
                  width={400}
                  height={300}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                {item.caption && (
                  <div style={{ fontSize: '13px', padding: '4px 0', color: '#888' }}>
                    {item.caption}
                  </div>
                )}
              </div>
            )
            if (item.url) {
              return <a key={i} href={item.url} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</a>
            }
            if (imageId) {
              return <a key={i} href={`/photos/${imageId}`} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</a>
            }
            return content
          })}
        </div>
      )}

      {/* YouTube embed */}
      {news.youtubeVideoId && (
        <div style={{ marginBottom: '24px', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${news.youtubeVideoId}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={news.title}
          />
        </div>
      )}

      {/* Body content — Lexical rich text or legacy HTML */}
      {news.body && (
        <div style={{ marginBottom: '24px' }}>
          <RichText data={news.body} />
        </div>
      )}
      {!news.body && htmlBody && (
        <div
          style={{ marginBottom: '24px' }}
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      )}
    </div>
  )
}
