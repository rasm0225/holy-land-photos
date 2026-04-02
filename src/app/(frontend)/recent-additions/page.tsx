import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recent Additions — Holy Land Photos',
  description: 'Recently added photos and content on Holy Land Photos.',
}

export default function RecentAdditionsPage() {
  return (
    <div>
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>Recent Additions</strong>
      </nav>

      <h1>Recent Additions</h1>
      <p>Coming Soon</p>
    </div>
  )
}
