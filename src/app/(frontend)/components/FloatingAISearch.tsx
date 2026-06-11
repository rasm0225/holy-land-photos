'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type Message = { role: 'user' | 'assistant'; content: string; durationMs?: number }

const SUGGESTED = [
  'Where did Abraham settle?',
  'What is a Rolling Stone Tomb?',
  'Roman ruins in Turkey',
  'Photos for a sermon on the resurrection',
]

const AI_SEARCH_LIMIT = 100
const COOKIE_NAME = 'hlp_ai_searches'
// Remembers, per-browser, that the user has opened the bubble before, so the
// "New — try it" attention nudge only shows to people who have never used it.
const SEEN_COOKIE = 'hlp_ai_fab_seen'
// The site navigates with full page loads (plain <a href>, force-dynamic), so
// React state is wiped on every navigation. We mirror the panel's open state
// and conversation into sessionStorage so following an answer link keeps the
// overlay open with the conversation intact. Cleared when the tab closes.
const STATE_KEY = 'hlp_ai_fab_state'

type PersistedState = { open: boolean; messages: Message[] }

function loadState(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STATE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : null
  } catch {
    return null
  }
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage may be unavailable (private mode quota) — degrade quietly.
  }
}

function getCount(name: string): number {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=(\\d+)`))
  return match ? parseInt(match[1]) : 0
}

function setSearchCount(count: number) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=${count}; expires=${expires}; path=/; SameSite=Lax`
}

function markSeen() {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${SEEN_COOKIE}=1; expires=${expires}; path=/; SameSite=Lax`
}

// Minimal markdown renderer — links, bold, italics, headings, lists, paragraphs.
function renderMarkdown(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => {
    const h3Match = /^###\s+(.+)$/.exec(para)
    if (h3Match) return <h4 key={pi} style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 15, margin: '12px 0 5px' }}>{renderInline(h3Match[1])}</h4>
    const h2Match = /^##\s+(.+)$/.exec(para)
    if (h2Match) return <h3 key={pi} style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16, margin: '12px 0 5px' }}>{renderInline(h2Match[1])}</h3>
    const lines = para.split('\n')
    const isList = lines.every((l) => /^[\-\*]\s/.test(l.trim()) || !l.trim())
    if (isList && lines.some((l) => l.trim())) {
      return <ul key={pi} style={{ margin: '4px 0 10px', paddingLeft: 20 }}>{lines.filter((l) => l.trim()).map((l, li) => <li key={li} style={{ margin: '0 0 4px' }}>{renderInline(l.replace(/^[\-\*]\s+/, ''))}</li>)}</ul>
    }
    return <p key={pi} style={{ margin: '0 0 10px' }}>{renderInline(para)}</p>
  })
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+?)\*\*|\*([^*]+?)\*|\n/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index))
    if (m[1] && m[2]) {
      const href = m[2]
      // Internal links navigate in the same tab so the overlay (restored from
      // sessionStorage on the next page) stays open. External links open in a
      // new tab so the user keeps their place on the site.
      const external = /^https?:\/\//i.test(href) && !/holylandphotos\.org/i.test(href)
      parts.push(
        external ? (
          <a key={key++} href={href} target="_blank" rel="noopener" style={{ color: 'var(--link)' }}>{m[1]}</a>
        ) : (
          <a key={key++} href={href} style={{ color: 'var(--link)' }}>{m[1]}</a>
        ),
      )
    } else if (m[3]) {
      parts.push(<strong key={key++}>{renderInline(m[3])}</strong>)
    } else if (m[4]) {
      parts.push(<em key={key++}>{m[4]}</em>)
    } else if (m[0] === '\n') {
      parts.push(<br key={key++} />)
    }
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts
}

export default function FloatingAISearch() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchCount, setSearchCountState] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Restore any in-progress conversation / open panel from a prior page in
  // this tab, and decide whether to show the first-time nudge.
  useEffect(() => {
    setSearchCountState(getCount(COOKIE_NAME))
    const saved = loadState()
    if (saved) {
      if (saved.messages?.length) setMessages(saved.messages)
      if (saved.open) {
        setOpen(true)
        return // restored an open panel — never show the nudge over it
      }
    }
    if (!getCount(SEEN_COOKIE)) setShowNudge(true)
  }, [])

  // Persist open state + conversation so it survives full-page navigation.
  useEffect(() => {
    saveState({ open, messages })
  }, [open, messages])

  useEffect(() => {
    if (open) {
      // Wait for the open transition before focusing so the panel is in view.
      const t = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  // Close on Escape while the panel is open.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function toggle() {
    setOpen((o) => !o)
    if (showNudge) {
      setShowNudge(false)
      markSeen()
    }
  }

  async function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const start = Date.now()
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const durationMs = Date.now() - start
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.reply, durationMs }])
        const newCount = searchCount + 1
        setSearchCount(newCount)
        setSearchCountState(newCount)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    ask(input)
  }

  function resetConversation() {
    setMessages([])
    setError('')
    setInput('')
    inputRef.current?.focus()
  }

  // The dedicated /ai-search page already is the full experience — don't
  // double up the bubble there.
  if (pathname === '/ai-search') return null

  return (
    <div className="pln-fab-root">
      {open && (
        <div
          className="pln-fab-panel"
          ref={panelRef}
          role="dialog"
          aria-label="AI Search"
          aria-modal="false"
        >
          <div className="pln-fab-head">
            <div className="pln-fab-head-title">
              <span className="pln-fab-spark" aria-hidden="true">✦</span>
              AI Search
            </div>
            <div className="pln-fab-head-actions">
              {messages.length > 0 && (
                <button type="button" className="pln-fab-head-btn" onClick={resetConversation} disabled={loading}>
                  New
                </button>
              )}
              <button type="button" className="pln-fab-head-btn pln-fab-close" onClick={() => setOpen(false)} aria-label="Close AI Search">
                ✕
              </button>
            </div>
          </div>

          <div className="pln-fab-body">
            {messages.length === 0 && !loading && !error ? (
              <div className="pln-fab-intro">
                <p className="pln-fab-blurb">
                  Ask anything about the archive — sites, Bible passages, or where to find a
                  photo — in plain English.
                </p>
                <div className="pln-ai-chips" style={{ padding: 0 }}>
                  <span className="pln-ai-chips-label">Try asking</span>
                  {SUGGESTED.map((q) => (
                    <button key={q} className="pln-ai-chip" onClick={() => ask(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pln-fab-thread">
                {messages.map((m, i) => (
                  <div key={i} className={`pln-ai-msg pln-ai-msg-${m.role}`}>
                    {m.role === 'user' ? (
                      <div className="pln-ai-user-bubble">{m.content}</div>
                    ) : (
                      <div>
                        <div className="pln-ai-assistant-tag">Holy Land Photos · AI</div>
                        <div className="pln-ai-md">{renderMarkdown(m.content)}</div>
                        {m.durationMs != null && (
                          <div className="pln-ai-foot" style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 6 }}>
                            — answered in {(m.durationMs / 1000).toFixed(1)}s
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="pln-ai-msg">
                    <div className="pln-ai-assistant-tag">Holy Land Photos · AI</div>
                    <div className="pln-ai-loading" style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>Searching the archive…</div>
                  </div>
                )}
                {error && <div className="pln-fab-error">{error}</div>}
                <div ref={endRef} />
              </div>
            )}
          </div>

          {searchCount >= AI_SEARCH_LIMIT && (
            <div className="pln-fab-limit">
              You&apos;ve used {searchCount} AI searches this month. If you find this
              valuable, please consider supporting Holy Land Photos to help keep it running.
            </div>
          )}

          <form className="pln-fab-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a site or photo…"
              aria-label="Ask the archive"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '…' : 'Ask'}
            </button>
          </form>

          <a className="pln-fab-fulllink" href="/ai-search">
            Open the full AI Search page →
          </a>
        </div>
      )}

      {showNudge && !open && (
        <button type="button" className="pln-fab-nudge" onClick={toggle}>
          New — ask the archive anything
          <span className="pln-fab-nudge-x" aria-hidden="true">›</span>
        </button>
      )}

      <button
        type="button"
        className={`pln-fab-btn${open ? ' pln-fab-btn-open' : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Close AI Search' : 'Open AI Search'}
      >
        {open ? (
          <span className="pln-fab-icon" aria-hidden="true">✕</span>
        ) : (
          <>
            <span className="pln-fab-spark" aria-hidden="true">✦</span>
            <span className="pln-fab-btn-label">Ask AI</span>
          </>
        )}
      </button>
    </div>
  )
}
