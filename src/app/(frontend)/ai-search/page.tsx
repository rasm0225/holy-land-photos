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
      <h1 className="pln-h1" style={{ fontSize: 28, marginBottom: 16 }}>AI Search</h1>
      <p className="pln-ai-blurb">
        Ask about biblical sites, archaeological places, or specific photos.
        The assistant will search the archive and suggest matches. Try things like
        &ldquo;photos of Caesarea&rdquo;, &ldquo;where is Nain?&rdquo;, or
        &ldquo;show me the Rolling Stone Tomb&rdquo;.
      </p>
      <p className="pln-ai-disclaimer-inline">
        Powered by Claude AI. Responses are based on content from
        this website but are not written by or endorsed by Dr. Carl Rasmussen.
      </p>

      <AISearchChat />

      <p style={{ marginTop: 48, fontSize: '12.5px', color: 'var(--ink-faint)', fontFamily: 'var(--sans)' }}>
        Search queries are logged anonymously to help us improve the site.
        No personal information, IP addresses, or identifiers are collected.
      </p>
    </div>
  )
}
