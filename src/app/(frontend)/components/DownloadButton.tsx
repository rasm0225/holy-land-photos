'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

export default function DownloadButton({
  imageId,
  title,
}: {
  imageId: string
  title?: string
}) {
  const [showModal, setShowModal] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setShowModal(false)
    document.body.style.overflow = ''
  }, [])

  const openModal = useCallback(() => {
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }, [])

  useEffect(() => {
    if (!showModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    // Focus Cancel (the safe choice) on open
    cancelRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [showModal, close])

  function handleDownload() {
    const params = new URLSearchParams({ id: imageId })
    if (title) params.set('title', title)
    window.location.href = `/api/download?${params.toString()}`
    close()
  }

  return (
    <>
      <button onClick={openModal} className="pln-download">
        &#8595; Download Photo
      </button>

      {showModal && (
        <div
          className="pln-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dl-title"
          onClick={close}
          style={{ position: 'fixed', zIndex: 9999 }}
        >
          <button
            className="pln-overlay-close"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); close() }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
          </button>
          <div className="pln-modal" onClick={(e) => e.stopPropagation()}>
            <p className="pln-modal-eyebrow">Permission to use</p>
            <h2 id="dl-title">Before you download</h2>
            <p>
              All photographs on HolyLandPhotos.org are the property of Dr. Carl Rasmussen
              and are provided <strong>free for non-commercial use</strong> — sermons,
              lessons, slides, personal study, and academic work.
            </p>
            <p>
              Please credit <em>HolyLandPhotos.org</em> when you use a photograph.
              For commercial licensing or print reproduction, please{' '}
              <a href="/pages/permission-to-use">read our permission policy</a>.
            </p>
            <div className="pln-modal-actions">
              <button ref={cancelRef} className="pln-btn-secondary" type="button" onClick={close}>
                Cancel
              </button>
              <button className="pln-btn-primary" type="button" onClick={handleDownload}>
                &#8595; I agree — Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
