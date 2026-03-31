import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Holy Land Photos',
    template: '%s — Holy Land Photos',
  },
  description: '7,000+ free, high-resolution photographs of biblical and archaeological sites across 612 locations in 12 countries.',
  openGraph: {
    siteName: 'Holy Land Photos',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.6 }}>
        <nav style={{ padding: '12px 24px', borderBottom: '1px solid #ddd' }}>
          <a href="/" style={{ marginRight: '16px', textDecoration: 'none', fontWeight: 600 }}>
            Holy Land Photos
          </a>
          <a href="/admin" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>
            Admin
          </a>
        </nav>
        <main style={{ padding: '24px', maxWidth: '1000px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
