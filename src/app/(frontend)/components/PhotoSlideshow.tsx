'use client'

import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { photoSrc } from '@/lib/photoSrc'

export type Slide = {
  imageId: string
  filename?: string | null
  caption?: string
  href?: string
  alt?: string
}

type Props = {
  slides: Slide[]
  /** Milliseconds between slides. 0 disables auto-advance. Default 3000. */
  autoAdvanceMs?: number
}

export default function PhotoSlideshow({ slides, autoAdvanceMs = 3000 }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const next = useCallback(
    () => setIndex((i) => (i === slides.length - 1 ? 0 : i + 1)),
    [slides.length],
  )
  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1)),
    [slides.length],
  )

  useEffect(() => {
    if (autoAdvanceMs <= 0 || slides.length <= 1 || paused) return

    // Respect prefers-reduced-motion — users who've opted out of motion
    // should not have a slideshow advancing under them.
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const id = setInterval(next, autoAdvanceMs)
    return () => clearInterval(id)
  }, [autoAdvanceMs, slides.length, paused, next])

  if (slides.length === 0) return null

  const slide = slides[index]
  const imgSrc = photoSrc(slide)
  const alt = slide.alt || slide.caption || slide.imageId
  const href = slide.href ?? `/photos/${slide.imageId}`

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Fixed 8:5 aspect ratio so the page below doesn't jump as slides
          cycle through images with different dimensions. object-fit: cover
          crops to the box; portrait images get sides trimmed, landscape
          ones get top/bottom trimmed — but the box stays put. */}
      <div style={{ position: 'relative', aspectRatio: '8 / 5', overflow: 'hidden', background: 'var(--bg-alt)' }}>
        <a href={href} style={{ display: 'block', width: '100%', height: '100%' }}>
          <Image
            src={imgSrc}
            alt={alt}
            width={800}
            height={500}
            sizes="(max-width: 680px) 100vw, 50vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
