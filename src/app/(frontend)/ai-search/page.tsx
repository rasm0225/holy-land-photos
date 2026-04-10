import React from 'react'
import type { Metadata } from 'next'
import AISearchChat from './AISearchChat'

export const metadata: Metadata = {
  title: 'AI Search — Holy Land Photos',
  description: 'Chat with an AI assistant to find biblical and archaeological photos.',
}

export default function AISearchPage() {
  return (
    <div>
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>AI Search</strong>
      </nav>

      <h1>AI Search</h1>
      <p style={{ color: '#666', marginBottom: '12px' }}>
        Ask about biblical sites, archaeological places, or specific photos.
        The assistant will search the archive and suggest matches. Try things like
        &ldquo;photos of Caesarea&rdquo;, &ldquo;where is Nain?&rdquo;, or
        &ldquo;show me the Rolling Stone Tomb&rdquo;.
      </p>
      <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic', marginBottom: '24px' }}>
        This search is provided by Claude AI. Responses are based on content from
        this website but are not written by or endorsed by Dr. Carl Rasmussen.
        If you have any feedback, please contact us.
      </p>

      <AISearchChat />
    </div>
  )
}
