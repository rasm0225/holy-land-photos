'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AI_SEARCH_LABEL, AI_ASSISTANT_TAG } from '@/lib/aiSearch'
import { renderMarkdown } from './aiMarkdown'

/**
 * Auto-runs Smart Search when a keyword search returns nothing, and shows
 * the answer inline underneath the zero-result message.
 *
 * TO REMOVE: delete the <SmartSearchFallback> line in search/page.tsx.
 * Nothing else references this file. Kept deliberately self-contained
 * because the UX is on trial.
 *
 * Runs CLIENT-side on purpose, not in the server component:
 *
 *   - Latency. Measured over 129 real AI searches, the median is 5.5s,
 *     p90 is 10.8s and p95 is 33s. Awaiting that in the server component
 *     would stall a page that currently paints instantly. Here the page
 *     renders immediately and the answer arrives underneath.
 *   - Cost. Zero-result queries skew toward bots probing /search?q=<junk>
 *     — exactly the queries that match nothing. A fetch from the browser
 *     is never made by crawlers that don't run JS, which removes most of
 *     the wasted spend for free.
 *   - Rate limiting. Going through /api/ai-search keeps the existing
 *     20-per-10-minutes-per-IP cap. A direct Anthropic call from the
 *     server component would bypass it entirely.
 */

// Don't spend a request on input that can't be a real site name.
const MIN_LEN = 2
const MAX_LEN = 120

function isPlausibleQuery(q: string): boolean {
  if (q.length < MIN_LEN || q.length > MAX_LEN) return false
  // Needs at least one letter — bare punctuation/digits are probe traffic.
  return /\p{L}/u.test(q)
}

export default function SmartSearchFallback({ query }: { query: string }) {
  const [reply, setReply] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'failed'>('idle')
  // Guards against React 18 StrictMode double-invoking effects in dev,
  // which would otherwise fire two billable requests per render.
  const firedFor = useRef<string | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (!isPlausibleQuery(q)) return
    if (firedFor.current === q) return
    firedFor.current = q

    let cancelled = false
    setState('loading')

    ;(async () => {
      try {
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: q }] }),
        })
        if (cancelled) return
        const data = await res.json()
        if (res.ok && data?.reply) {
          setReply(data.reply)
          setState('done')
        } else {
          // Includes the 429 rate-limit case. The static recommendation
          // above this component is still on screen, so there's a path
          // forward either way.
          setState('failed')
        }
      } catch {
        if (!cancelled) setState('failed')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [query])

  if (state === 'idle' || state === 'failed') return null

  return (
    <section className="pln-ssf" aria-live="polite">
      <div className="pln-ssf-head">
        <span className="pln-fab-spark" aria-hidden="true">✦</span>
        {state === 'loading'
          ? `Asking ${AI_SEARCH_LABEL}…`
          : `${AI_SEARCH_LABEL} found this`}
      </div>

      {state === 'loading' && (
        <p className="pln-ssf-loading">
          Searching the archive for &ldquo;{query}&rdquo;. This usually takes
          a few seconds.
        </p>
      )}

      {state === 'done' && reply && (
        <>
          <div className="pln-ai-assistant-tag">{AI_ASSISTANT_TAG}</div>
          <div className="pln-ai-md">{renderMarkdown(reply)}</div>
          <a className="pln-ssf-more" href={`/ai-search?q=${encodeURIComponent(query)}`}>
            Continue in {AI_SEARCH_LABEL} →
          </a>
        </>
      )}
    </section>
  )
}
