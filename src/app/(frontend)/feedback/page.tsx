'use client'

import React, { useState } from 'react'

export default function FeedbackPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website, // honeypot
        }),
      })

      const data = await res.json()

      if (res.ok && data.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="pln-sep">›</span>
        <span className="pln-current">Feedback</span>
      </nav>

      <h1 className="pln-h1">Feedback</h1>
      <p className="pln-lead" style={{ maxWidth: '62ch' }}>
        Have a question, correction, or comment about the site or a photo?
        Send a message and Dr. Rasmussen will read it personally.
      </p>

      {status === 'success' ? (
        <div className="pln-hint">
          <strong>Thank you for your message.</strong>{' '}
          We&rsquo;ll read it and reply if needed.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="fb-name" style={fieldLabelStyle}>
              Name <span style={{ color: '#c00' }}>*</span>
            </label>
            <input
              type="text"
              id="fb-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'submitting'}
              style={fieldInputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="fb-email" style={fieldLabelStyle}>
              Email <span style={{ color: '#c00' }}>*</span>
            </label>
            <input
              type="email"
              id="fb-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={status === 'submitting'}
              style={fieldInputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="fb-subject" style={fieldLabelStyle}>
              Subject
            </label>
            <input
              type="text"
              id="fb-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={status === 'submitting'}
              style={fieldInputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="fb-message" style={fieldLabelStyle}>
              Message <span style={{ color: '#c00' }}>*</span>
            </label>
            <textarea
              id="fb-message"
              required
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={status === 'submitting'}
              style={{ ...fieldInputStyle, resize: 'vertical', minHeight: 160 }}
            />
          </div>

          {/* Honeypot: hidden from humans, bots will fill it. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <label htmlFor="fb-website">Website</label>
            <input
              type="text"
              id="fb-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {status === 'error' && (
            <p style={{ color: '#c00', marginBottom: 12, fontSize: 14, fontFamily: 'var(--sans)' }}>
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={status === 'submitting'} className="pln-download">
            {status === 'submitting' ? 'Sending…' : 'Send'}
          </button>
        </form>
      )}
    </div>
  )
}

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 4,
  fontWeight: 600,
  fontSize: 14,
  fontFamily: 'var(--sans)',
}

const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 17,
  fontFamily: 'var(--serif)',
  border: '1px solid var(--ink)',
  boxSizing: 'border-box',
}
