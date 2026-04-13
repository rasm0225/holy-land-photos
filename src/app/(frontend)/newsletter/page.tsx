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
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>Newsletter</strong>
      </nav>

      <h1>Newsletter Signup</h1>
      <p style={{ color: '#666', marginBottom: '24px', maxWidth: 600 }}>
        Subscribe to receive updates from Holy Land Photos, including new photo
        additions, site features, and announcements about upcoming study tours
        led by Dr. Carl Rasmussen.
      </p>

      {status === 'success' ? (
        <div style={{ padding: '16px', background: '#e8f5e9', borderRadius: 4, maxWidth: 500 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Thank you for subscribing!</p>
          <p style={{ margin: '8px 0 0 0', color: '#555' }}>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="mce-EMAIL" style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '14px' }}>
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
                padding: '10px 14px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="mce-FNAME" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
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
                  padding: '10px 14px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="mce-LNAME" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
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
                  padding: '10px 14px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {status === 'error' && (
            <p style={{ color: '#c00', marginBottom: '12px', fontSize: '14px' }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontWeight: 600,
              background: status === 'submitting' ? '#eee' : '#fff',
            }}
          >
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  )
}
