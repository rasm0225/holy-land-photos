'use client'

import React, { useState } from 'react'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('submitting')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      const data = await res.json()

      if (data.result === 'success') {
        setStatus('success')
        setMessage(
          data.msg
            ?.replace(/<[^>]*>/g, '')
            || 'Please check your email to confirm your subscription.',
        )
      } else {
        setStatus('error')
        setMessage(
          data.msg
            ?.replace(/<a [^>]*>([^<]*)<\/a>/g, '$1')
            ?.replace(/<[^>]*>/g, '')
            || 'Subscription failed. Please try again.',
        )
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="pln-sep">›</span>
        <span className="pln-current">Newsletter</span>
      </nav>

      <h1 className="pln-h1">Newsletter Signup</h1>
      <p className="pln-lead" style={{ maxWidth: '62ch' }}>
        Subscribe to receive updates from Holy Land Photos, including new photo
        additions, site features, and announcements about upcoming study tours
        led by Dr. Carl Rasmussen.
      </p>

      {status === 'success' ? (
        <div className="pln-hint">
          <strong>Thank you for subscribing!</strong>
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="mce-EMAIL" style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, fontFamily: 'var(--sans)' }}>
              Email Address <span style={{ color: '#c00' }}>*</span>
            </label>
            <input
              type="email"
              id="mce-EMAIL"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 17,
                fontFamily: 'var(--serif)',
                border: '1px solid var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="mce-FNAME" style={{ display: 'block', marginBottom: 4, fontSize: 14, fontFamily: 'var(--sans)' }}>
                First Name
              </label>
              <input
                type="text"
                id="mce-FNAME"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 17,
                  fontFamily: 'var(--serif)',
                  border: '1px solid var(--line-strong)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="mce-LNAME" style={{ display: 'block', marginBottom: 4, fontSize: 14, fontFamily: 'var(--sans)' }}>
                Last Name
              </label>
              <input
                type="text"
                id="mce-LNAME"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 17,
                  fontFamily: 'var(--serif)',
                  border: '1px solid var(--line-strong)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {status === 'error' && (
            <p style={{ color: '#c00', marginBottom: 12, fontSize: 14, fontFamily: 'var(--sans)' }}>
              {message}
            </p>
          )}

          <button type="submit" disabled={status === 'submitting'} className="pln-download">
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  )
}
