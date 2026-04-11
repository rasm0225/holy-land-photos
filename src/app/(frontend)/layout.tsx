import React from 'react'
import Script from 'next/script'
import type { Metadata } from 'next'
import { EditLink } from './components/EditLink'
import PageLogger from './components/PageLogger'

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
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-8NL9MZ67TD" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8NL9MZ67TD');
        `}</Script>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.6 }}>
        <nav style={{ padding: '12px 24px', borderBottom: '1px solid #ddd' }}>
          <a href="/" style={{ marginRight: '16px', textDecoration: 'none', fontWeight: 600 }}>
            Holy Land Photos
          </a>
          <a href="/search" style={{ fontSize: '14px', color: '#666', textDecoration: 'none', marginRight: '16px' }}>
            Search
          </a>
          <a href="/ai-search" style={{ fontSize: '14px', color: '#666', textDecoration: 'none', marginRight: '16px' }}>
            AI Search
          </a>
          <a href="/admin" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>
            Admin
          </a>
          <EditLink />
        </nav>
        <main style={{ padding: '24px', maxWidth: '1000px' }}>
          {children}
        </main>
        <PageLogger />
      </body>
    </html>
  )
}
