'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

export default function MobileDrawer() {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    document.body.style.overflow = ''
  }, [])

  const openDrawer = useCallback(() => {
    setOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <button
        className="pln-mobile-nav-btn"
        onClick={openDrawer}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <>
          <div className="mpln-drawer-overlay" onClick={close} />
          <div
            className="mpln-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="mpln-drawer-head">
              <span className="mpln-drawer-brand">HolyLandPhotos</span>
              <button
                ref={closeRef}
                className="mpln-drawer-close"
                onClick={close}
                aria-label="Close menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>

            <div className="mpln-drawer-section">
              <span className="mpln-drawer-label">Search</span>
              <a className="mpln-drawer-link" href="/search" onClick={close}>Search photos</a>
              <a className="mpln-drawer-link" href="/ai-search" onClick={close}>AI Search</a>
            </div>

            <div className="mpln-drawer-section">
              <span className="mpln-drawer-label">Archive</span>
              <a className="mpln-drawer-link" href="/browse/browse-by-countries" onClick={close}>Browse by Countries</a>
              <a className="mpln-drawer-link" href="/browse/daily-life-and-artifacts" onClick={close}>Daily Life and Artifacts</a>
              <a className="mpln-drawer-link" href="/browse/museums-of-the-world" onClick={close}>Museums of the World</a>
              <a className="mpln-drawer-link" href="/site-list" onClick={close}>Complete Site List</a>
            </div>

            <div className="mpln-drawer-section">
              <span className="mpln-drawer-label">About</span>
              <a className="mpln-drawer-link" href="/pages/about-this-site" onClick={close}>About this Site</a>
              <a className="mpln-drawer-link" href="/pages/permission-to-use" onClick={close}>Permission to Use</a>
              <a className="mpln-drawer-link" href="/news" onClick={close}>News</a>
              <a className="mpln-drawer-link" href="/newsletter" onClick={close}>Newsletter</a>
              <a className="mpln-drawer-link" href="/feedback" onClick={close}>Feedback</a>
            </div>

            <div className="mpln-drawer-foot">
              &copy; 1995&ndash;{new Date().getFullYear()} Dr. Carl Rasmussen
            </div>
          </div>
        </>
      )}
    </>
  )
}
