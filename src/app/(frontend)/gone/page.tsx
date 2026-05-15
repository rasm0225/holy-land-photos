import React from 'react'
import type { Metadata } from 'next'

type Props = {
  searchParams: Promise<{ from?: string }>
}

export const metadata: Metadata = {
  title: 'Page Not Available',
  robots: { index: false, follow: false },
}

export default async function GonePage({ searchParams }: Props) {
  const { from } = await searchParams

  return (
    <div>
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="pln-sep">›</span>
        <span className="pln-current">Page Not Available</span>
      </nav>

      <h1 className="pln-h1">This page is no longer available</h1>

      <p>
        The link you followed points to a section of the old Holy Land Photos
        site that has since been moved or removed. We&apos;re sorry for the
        inconvenience.
      </p>

      {from && (
        <p className="pln-path">
          You were looking for: <code>{from}</code>
        </p>
      )}

      <p>You might find what you&apos;re looking for here:</p>

      <ul>
        <li><a href="/">Browse the homepage</a></li>
        <li><a href="/search">Search the archive</a></li>
        <li><a href="/ai-search">Ask the Archive (AI search)</a></li>
        <li><a href="/site-list">Full site directory</a></li>
      </ul>

      <p>
        If you arrived here from a published reference (a book, article, or
        external link) and would like help locating the photo,{' '}
        <a href="mailto:holylandphotos@gmail.com?subject=Broken%20link%20on%20Holy%20Land%20Photos">
          please let us know
        </a>{' '}
        and we&apos;ll point you to the right place.
      </p>
    </div>
  )
}
