'use client'

import Image from 'next/image'
import React, { useState } from 'react'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

type GalleryItem = {
  imageId?: string
  caption?: string
  url?: string
}

type NewsItem = {
  id: number
  title: string
  imageGallery?: GalleryItem[]
}

export default function NewsCarousel({ newsItems }: { newsItems: NewsItem[] }) {
  // Flatten all gallery images across all active news items
  const slides = newsItems.flatMap((item) =>
    (item.imageGallery || [])
      .filter((g) => g.imageId)
      .map((g) => ({
        imageId: g.imageId!,
        caption: g.caption || '',
        url: g.url,
        newsId: item.id,
        newsTitle: item.title,
      })),
  )

  const [index, setIndex] = useState(0)

  if (slides.length === 0) return null

  const slide = slides[index]
  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === slides.length - 1 ? 0 : i + 1))

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <a href={`/photos/${slide.imageId}`}>
          <Image
            src={`${S3_BASE}/${slide.imageId}.jpg`}
            alt={slide.caption || slide.imageId}
            width={800}
            height={500}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </a>

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: 4 }}>
        {slide.caption && <span>{slide.caption}</span>}
        {slides.length > 1 && (
          <span style={{ marginLeft: 8, color: '#888' }}>
            {index + 1} of {slides.length}
          </span>
        )}
      </div>
    </div>
  )
}
