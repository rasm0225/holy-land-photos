'use client'

import React, { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string; durationMs?: number }

// Minimal markdown renderer — handles [text](url) links, **bold**, and paragraphs
function renderMarkdown(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => {
    // Check for headings at start of paragraph
    const h3Match = /^###\s+(.+)$/.exec(para)
    if (h3Match) {
      return (
        <h3 key={pi} style={{ fontSize: '1rem', fontWeight: 600, margin: '0.75rem 0 0.4rem 0' }}>
          {renderInline(h3Match[1])}
        </h3>
      )
    }
    const h2Match = /^##\s+(.+)$/.exec(para)
    if (h2Match) {
      return (
        <h2 key={pi} style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1rem 0 0.5rem 0' }}>
          {renderInline(h2Match[1])}
        </h2>
      )
    }
    const h1Match = /^#\s+(.+)$/.exec(para)
    if (h1Match) {
      return (
        <h2 key={pi} style={{ fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>
          {renderInline(h1Match[1])}
        </h2>
      )
    }
    return (
      <p key={pi} style={{ margin: '0 0 0.75rem 0' }}>
        {renderInline(para)}
      </p>
    )
  })
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Combined regex: links, bold, line breaks
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+?)\*\*|\n/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index))
    if (m[1] && m[2]) {
      // Link
      parts.push(
        <a key={key++} href={m[2]} style={{ color: '#0066cc' }}>
          {m[1]}
        </a>,
      )
    } else if (m[3]) {
      // Bold — recursively render so nested links/formatting work
      parts.push(<strong key={key++}>{renderInline(m[3])}</strong>)
    } else if (m[0] === '\n') {
      parts.push(<br key={key++} />)
    }
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts
}

const AI_SEARCH_LIMIT = 100
const COOKIE_NAME = 'hlp_ai_searches'

function getSearchCount(): number {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=(\\d+)`))
  return match ? parseInt(match[1]) : 0
}

function setSearchCount(count: number) {
  // Cookie expires in 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=${count}; expires=${expires}; path=/; SameSite=Lax`
}

export default function AISearchChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchCount, setSearchCountState] = useState(0)
  const [freshIndex, setFreshIndex] = useState<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const latestAssistantRef = useRef<HTMLDivElement>(null)
  const prevAssistantCount = useRef(0)

  useEffect(() => {
    setSearchCountState(getSearchCount())
    inputRef.current?.focus()
  }, [])

  // Two scroll behaviors:
  //  - User just sent a message (or is loading): pin to the bottom so the user
  //    sees their own message and the "Searching…" indicator.
  //  - A new assistant message just arrived: scroll the top of THAT message
  //    into view so the user lands at the start of the new answer rather than
  //    at the bottom of a long response. Also flag it as "fresh" for a few
  //    seconds so a coloured border draws the eye.
  useEffect(() => {
    const assistantCount = messages.filter((m) => m.role === 'assistant').length
    const newAssistantArrived = assistantCount > prevAssistantCount.current
    prevAssistantCount.current = assistantCount

    if (newAssistantArrived) {
      setFreshIndex(messages.length - 1)
      // setTimeout lets the layout settle before measuring scroll positions.
      const scrollT = setTimeout(() => {
        latestAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
      const fadeT = setTimeout(() => setFreshIndex(null), 4000)
      return () => {
        clearTimeout(scrollT)
        clearTimeout(fadeT)
      }
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function resetConversation() {
    setMessages([])
    setError('')
    setInput('')
    setFreshIndex(null)
    inputRef.current?.focus()
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
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
        setError(data.error || 'Request failed')
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.reply, durationMs }])
        const newCount = searchCount + 1
        setSearchCount(newCount)
        setSearchCountState(newCount)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const hasContent = messages.length > 0 || loading || error

  let lastAssistantIdx = -1
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantIdx = i
      break
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {hasContent && messages.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            type="button"
            onClick={resetConversation}
            disabled={loading}
            style={{
              fontSize: 12,
              fontFamily: 'var(--sans)',
              padding: '4px 10px',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: 3,
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#555',
            }}
          >
            New conversation
          </button>
        </div>
      )}
      {hasContent && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: 16,
            maxHeight: 500,
            overflowY: 'auto',
            marginBottom: 16,
            background: '#fafafa',
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              ref={i === lastAssistantIdx ? latestAssistantRef : null}
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 4,
                background: m.role === 'user' ? '#e6f0ff' : '#fff',
                border: '1px solid #e0e0e0',
                borderLeft: '3px solid',
                borderLeftColor:
                  i === freshIndex ? 'var(--accent, #B85C2C)' : 'transparent',
                transition: 'border-left-color 1.5s ease-out',
              }}
            >
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.role === 'user' ? 'You' : 'Assistant'}</span>
                {m.durationMs != null && (
                  <span>{(m.durationMs / 1000).toFixed(1)}s</span>
                )}
              </div>
              {m.role === 'assistant' ? renderMarkdown(m.content) : <p style={{ margin: 0 }}>{m.content}</p>}
            </div>
          ))}
          {loading && (
            <div style={{ color: '#888', fontStyle: 'italic', padding: '0.5rem 0' }}>
              Searching…
            </div>
          )}
          {error && (
            <div style={{ color: '#c00', padding: '0.5rem 0' }}>
              Error: {error}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <form onSubmit={send} style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a site or photo…"
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: 16,
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: loading ? '#eee' : '#fff',
          }}
        >
          {loading ? '…' : 'Send'}
        </button>
      </form>

      {searchCount >= AI_SEARCH_LIMIT && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#fef9e7',
          border: '1px solid #f0e4b8',
          borderRadius: 4,
          fontSize: 14,
          color: '#555',
        }}>
          You&apos;ve used {searchCount} AI searches this month. If you find this feature
          valuable, please consider supporting Holy Land Photos to help keep it running.
        </div>
      )}
    </div>
  )
}
