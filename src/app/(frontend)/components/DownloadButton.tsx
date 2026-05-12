'use client'

import React, { useState, useEffect, useCallback } from 'react'

export default function DownloadButton({
  imageId,
}: {
  imageId: string
}) {
  const [showModal, setShowModal] = useState(false)

  const close = useCallback(() => setShowModal(false), [])

  useEffect(() => {
    if (!showModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showModal, close])

  function handleDownload() {
    // Use our proxy endpoint which sets Content-Disposition: attachment
    window.location.href = `/api/download?id=${encodeURIComponent(imageId)}`
    setShowModal(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          marginTop: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          cursor: 'pointer',
          borderRadius: '4px',
          border: '1px solid #ccc',
          background: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '16px' }}>&#8595;</span> Download Photo
      </button>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Download agreement"
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '24px 32px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>
              Before you download
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: 1.6, color: '#333' }}>
              Images from this site are free for personal, non-commercial use
              with credit to <strong>holylandphotos.org</strong>.
            </p>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.6, color: '#333' }}>
              For commercial or web use, please contact{' '}
              <a href="mailto:holylandphotos@gmail.com" style={{ color: '#0066cc' }}>
                holylandphotos@gmail.com
              </a>{' '}
              for permission.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDownload}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  background: '#333',
                  color: '#fff',
                }}
              >
                I Agree — Download
              </button>
              <button
                onClick={close}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  color: '#333',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
