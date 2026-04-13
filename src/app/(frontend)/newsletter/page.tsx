'use client'

import React, { useState } from 'react'

const MAILCHIMP_URL =
  'https://us15.list-manage.com/subscribe/post?u=4cedd2d8f94e4e97e74c4a8eb&id=32bd9fafb9'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

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
          <p style={{ margin: '8px 0 0 0', color: '#555' }}>
            Please check your email to confirm your subscription.
          </p>
        </div>
      ) : (
        <form
          action={MAILCHIMP_URL}
          method="post"
          target="_blank"
          onSubmit={() => {
            setStatus('success')
          }}
          style={{ maxWidth: 500 }}
        >
          {/* MailChimp hidden fields */}
          <input type="hidden" name="u" value="4cedd2d8f94e4e97e74c4a8eb" />
          <input type="hidden" name="id" value="32bd9fafb9" />

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="mce-EMAIL" style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '14px' }}>
              Email Address <span style={{ color: '#c00' }}>*</span>
            </label>
            <input
              type="email"
              name="EMAIL"
              id="mce-EMAIL"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
                name="FNAME"
                id="mce-FNAME"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                name="LNAME"
                id="mce-LNAME"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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

          {/* Bot honeypot — hidden from real users */}
          <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
            <input type="text" name="b_4cedd2d8f94e4e97e74c4a8eb_32bd9fafb9" tabIndex={-1} defaultValue="" />
          </div>

          {status === 'error' && (
            <p style={{ color: '#c00', marginBottom: '12px' }}>
              Something went wrong. Please try again.
            </p>
          )}

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontWeight: 600,
            }}
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  )
}
