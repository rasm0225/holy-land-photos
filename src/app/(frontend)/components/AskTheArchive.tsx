'use client'

import React, { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string; durationMs?: number }

const SUGGESTED = [
  'Where did Abraham settle?',
  'What is a Rolling Stone Tomb?',
  'Roman ruins in Turkey',
  'Photos for a sermon on the resurrection',
]

function renderMarkdown(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => {
    const h3Match = /^###\s+(.+)$/.exec(para)
    if (h3Match) return <h4 key={pi} style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16, margin: '14px 0 6px' }}>{renderInline(h3Match[1])}</h4>
    const h2Match = /^##\s+(.+)$/.exec(para)
    if (h2Match) return <h3 key={pi} style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 18, margin: '14px 0 6px' }}>{renderInline(h2Match[1])}</h3>
    // Check for list items
    const lines = para.split('\n')
    const isList = lines.every(l => /^[\-\*]\s/.test(l.trim()) || !l.trim())
    if (isList && lines.some(l => l.trim())) {
      return <ul key={pi} style={{ margin: '4px 0 12px', paddingLeft: 22 }}>{lines.filter(l => l.trim()).map((l, li) => <li key={li} style={{ margin: '0 0 4px' }}>{renderInline(l.replace(/^[\-\*]\s+/, ''))}</li>)}</ul>
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
      parts.push(<a key={key++} href={m[2]} style={{ color: 'var(--link)' }}>{m[1]}</a>)
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

export default function AskTheArchive() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const start = Date.now()
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const durationMs = Date.now() - start
      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply, durationMs }])
      }
    } catch {
      // Silently fail on homepage — user can try the full page
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    ask(input)
  }

  return (
    <section className="pln-ai-section">
      <h2 className="pln-h2">Ask the archive</h2>
      <p className="pln-ai-blurb">
        Have a question about a site, a Bible passage, or where to find a photo?
        Ask in plain English.{' '}
        <span className="pln-ai-disclaimer-inline">
          Powered by Claude AI; verify with primary sources.
        </span>
      </p>

      <div className="pln-ai-panel">
        <div className="pln-ai-input-wrap">
          <form className="pln-ai-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about biblical sites…"
              aria-label="Ask the archive"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Thinking…' : 'Ask'}
            </button>
          </form>
        </div>

        {messages.length === 0 && !loading ? (
          <div className="pln-ai-chips">
            <span className="pln-ai-chips-label">Try asking</span>
            {SUGGESTED.map((q) => (
              <button key={q} className="pln-ai-chip" onClick={() => ask(q)}>
                {q}
              </button>
            ))}
          </div>
        ) : (
          <div className="pln-ai-thread">
            {messages.map((m, i) => (
              <div key={i} className={`pln-ai-msg pln-ai-msg-${m.role}`}>
                {m.role === 'user' ? (
                  <div className="pln-ai-user-bubble">{m.content}</div>
                ) : (
                  <div>
                    <div className="pln-ai-assistant-tag">Holy Land Photos · AI</div>
                    <div className="pln-ai-md">{renderMarkdown(m.content)}</div>
                    {m.durationMs != null && (
                      <div className="pln-ai-foot">— answered in {(m.durationMs / 1000).toFixed(1)}s</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="pln-ai-msg">
                <div className="pln-ai-assistant-tag">Holy Land Photos · AI</div>
                <div className="pln-ai-loading">Searching the archive…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}

        <a className="pln-ai-open-full" href="/ai-search">
          Open the full AI Search page →
        </a>
      </div>
    </section>
  )
}
