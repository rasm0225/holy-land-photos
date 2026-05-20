import { NextRequest, NextResponse } from 'next/server'

const LIST_ID = '32bd9fafb9'

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = (await req.json()) as {
      email?: string
      firstName?: string
      lastName?: string
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ result: 'error', msg: 'Valid email required' }, { status: 400 })
    }

    const apiKey = process.env.MAILCHIMP_API_KEY
    if (!apiKey) {
      console.error('Newsletter: MAILCHIMP_API_KEY is not set')
      return NextResponse.json(
        { result: 'error', msg: 'Newsletter is temporarily unavailable. Please try again later.' },
        { status: 500 },
      )
    }

    // API key format is `xxxxxxxxxxxx-usNN` — the suffix is the datacenter.
    const dc = apiKey.split('-')[1]
    if (!dc) {
      console.error('Newsletter: MAILCHIMP_API_KEY is missing datacenter suffix')
      return NextResponse.json(
        { result: 'error', msg: 'Newsletter is temporarily unavailable. Please try again later.' },
        { status: 500 },
      )
    }

    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`
    const auth = Buffer.from(`any:${apiKey}`).toString('base64')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email.trim(),
        status: 'pending', // double opt-in — MailChimp sends the confirmation email
        merge_fields: {
          FNAME: (firstName || '').trim(),
          LNAME: (lastName || '').trim(),
        },
      }),
    })

    if (res.ok) {
      return NextResponse.json({
        result: 'success',
        msg: 'Please check your email to confirm your subscription.',
      })
    }

    const errBody = (await res.json().catch(() => null)) as
      | { title?: string; detail?: string }
      | null

    // Member Exists is returned as 400 with title "Member Exists". Treat as a friendly message,
    // not an error, so people who already signed up aren't confused.
    if (errBody?.title === 'Member Exists') {
      return NextResponse.json({
        result: 'success',
        msg: 'You are already subscribed. Thank you!',
      })
    }

    console.error('Newsletter: MailChimp returned', res.status, errBody)
    const msg = errBody?.detail || 'Subscription failed. Please try again.'
    return NextResponse.json({ result: 'error', msg }, { status: 400 })
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json(
      { result: 'error', msg: 'Server error. Please try again.' },
      { status: 500 },
    )
  }
}
