'use client'

import React, { useState } from 'react'

// MailChimp's JSONP endpoint for cross-origin subscription
// Uses post-json instead of post, and adds c=callback for JSONP
const MAILCHIMP_BASE =
  'https://us15.list-manage.com/subscribe/post-json?u=4cedd2d8f94e4e97e74c4a8eb&id=32bd9fafb9'

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
      // Build the subscribe URL with JSONP callback
      const params = new URLSearchParams({
        EMAIL: email.trim(),
        FNAME: firstName.trim(),
        LNAME: lastName.trim(),
        c: 'mcCallback',
      })
      const url = `${MAILCHIMP_BASE}&${params.toString()}`

      // Use JSONP since MailChimp doesn't support CORS on the subscribe endpoint
      const result = await new Promise<{ result: string; msg: string }>((resolve, reject) => {
        const callbackName = 'mcCallback'
        const timeout = setTimeout(() => {
          cleanup()
          reject(new Error('Request timed out'))
        }, 10000)

        function cleanup() {
          clearTimeout(timeout)
          delete (window as unknown as Record<string, unknown>)[callbackName]
          const el = document.getElementById('mc-jsonp')
          if (el) el.remove()
        }

        ;(window as unknown as Record<string, (data: { result: string; msg: string }) => void>)[callbackName] = (data) => {
          cleanup()
          resolve(data)
        }

        const script = document.createElement('script')
        script.id = 'mc-jsonp'
        script.src = url
        script.onerror = () => {
          cleanup()
          reject(new Error('Network error'))
        }
        document.head.appendChild(script)
      })

      if (result.result === 'success') {
        setStatus('success')
        setMessage(result.msg || 'Thank you for subscribing! Please check your email to confirm.')
      } else {
        setStatus('error')
        // Clean up MailChimp's HTML in error messages
        const cleanMsg = result.msg
          ?.replace(/<a [^>]*>([^<]*)<\/a>/g, '$1')
          ?.replace(/<[^>]*>/g, '')
          || 'Subscription failed. Please try again.'
        setMessage(cleanMsg)
      }
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
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
