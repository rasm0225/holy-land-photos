'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

export default function PhotoLightbox({
  src,
  alt,
  children,
}: {
  src: string
  alt: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    document.body.style.overflow = ''
    // Return focus to trigger
    triggerRef.current?.focus()
  }, [])

  const openLightbox = useCallback(() => {
    setOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      // Trap focus on close button
      if (e.key === 'Tab') {
        e.preventDefault()
        closeRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    // Focus the close button on open
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <div ref={triggerRef} onClick={openLightbox} style={{ cursor: 'zoom-in' }} tabIndex={0} role="button" aria-label={`View ${alt} fullscreen`}>
        {children}
      </div>
      {open && (
        <div
          className="pln-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          onClick={close}
          style={{ position: 'fixed', zIndex: 9999, cursor: 'zoom-out' }}
        >
          <button
            ref={closeRef}
            className="pln-overlay-close"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); close() }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
          </button>
          <img
            className="pln-lightbox-img"
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          />
          <div className="pln-lightbox-cap">
            <strong>{alt}</strong>
            Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 2, fontFamily: 'ui-monospace', fontSize: 11 }}>Esc</kbd> to close
          </div>
        </div>
      )}
    </>
  )
}
