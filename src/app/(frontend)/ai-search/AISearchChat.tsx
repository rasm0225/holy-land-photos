'use client'

import React, { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

// Minimal markdown renderer — handles [text](url) links, **bold**, and paragraphs
function renderMarkdown(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => (
    <p key={pi} style={{ margin: '0 0 0.75rem 0' }}>
      {renderInline(para)}
    </p>
  ))
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Combined regex: links, bold, line breaks
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\n/g
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
      // Bold
      parts.push(<strong key={key++}>{m[3]}</strong>)
    } else if (m[0] === '\n') {
      parts.push(<br key={key++} />)
    }
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts
}

export default function AISearchChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Request failed')
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const hasContent = messages.length > 0 || loading || error

  return (
    <div style={{ maxWidth: 800 }}>
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
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 4,
                background: m.role === 'user' ? '#e6f0ff' : '#fff',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>
                {m.role === 'user' ? 'You' : 'Assistant'}
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
    </div>
  )
}
