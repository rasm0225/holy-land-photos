'use client'

import React, { useEffect, useRef, useState } from 'react'

export type AboutDropdownItem = { href: string; label: string }

/**
 * Desktop-only About dropdown. Click to open, click-outside / Esc to
 * close. Items come from the same Payload query that powers the
 * homepage Pages section, so the menu stays in sync with the admin.
 */
export default function AboutDropdown({ items }: { items: AboutDropdownItem[] }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="pln-dropdown" ref={rootRef}>
      <button
        type="button"
        className="pln-dropdown-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        About
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
          style={{ marginLeft: 4, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 120ms' }}
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="pln-dropdown-menu" role="menu">
          {items.map((item) => (
            <li key={item.href} role="none">
              <a
                href={item.href}
                role="menuitem"
                className="pln-dropdown-item"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
