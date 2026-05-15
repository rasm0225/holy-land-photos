import React from 'react'
import Script from 'next/script'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { EditLink } from './components/EditLink'
import PageLogger from './components/PageLogger'
import ExternalLinkHandler from './components/ExternalLinkHandler'
import MobileDrawer from './components/MobileDrawer'
import '../styles/design.css'

export const metadata: Metadata = {
  title: {
    default: 'Holy Land Photos',
    template: '%s — Holy Land Photos',
  },
  description: '7,000+ free, high-resolution photographs of biblical and archaeological sites across 612 locations in 12 countries.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    siteName: 'Holy Land Photos',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

async function getIsLoggedIn(): Promise<boolean> {
  // Treat any failure as "not logged in". This matters in CI where there
  // is no real database — without the try/catch the build fails when it
  // tries to prerender a static page like /gone.
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await getHeaders() })
    return !!user
  } catch {
    return false
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = await getIsLoggedIn()

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
      <body>
        <a href="#main-content" className="pln-skip">Skip to content</a>

        {/* Desktop nav */}
        <header className="pln-nav">
          <div className="pln-nav-inner">
            <a href="/" className="pln-brand">
              <span className="pln-brand-name">HolyLandPhotos.org</span>
              <span className="pln-brand-tag">Biblical &amp; Archaeological Archive</span>
            </a>
            <nav className="pln-nav-links">
              <a href="/search">Search</a>
              <a href="/ai-search">AI Search</a>
              <a href="/pages/about-this-site">About</a>
              <a href="/pages/permission-to-use">Permission</a>
              <EditLink isLoggedIn={isLoggedIn} />
            </nav>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="pln-mobile-nav">
          <MobileDrawer />
          <a href="/" className="pln-mobile-brand">HolyLandPhotos</a>
          <a href="/search" className="pln-mobile-nav-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          </a>
        </div>

        <main id="main-content" className="pln-main">
          {children}
        </main>

        <footer className="pln-footer">
          <span className="pln-footer-cr">&copy; 1995&ndash;{new Date().getFullYear()} Dr. Carl Rasmussen</span>
          <a href="/pages/about-this-site">About</a>
          <a href="/pages/permission-to-use">Permission to Use</a>
          <a href="/news">News</a>
          <a href="mailto:holylandphotos@gmail.com?subject=Feedback">Feedback</a>
        </footer>

        <PageLogger />
        <ExternalLinkHandler />
      </body>
    </html>
  )
}
