import { NextRequest, NextResponse } from 'next/server'

const MAILCHIMP_URL =
  'https://us15.list-manage.com/subscribe/post-json?u=4cedd2d8f94e4e97e74c4a8eb&id=32bd9fafb9'

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

    const params = new URLSearchParams({
      EMAIL: email.trim(),
      FNAME: (firstName || '').trim(),
      LNAME: (lastName || '').trim(),
    })

    // Call MailChimp's subscribe endpoint server-side (no CORS issues)
    const res = await fetch(`${MAILCHIMP_URL}&${params.toString()}`, {
      method: 'GET', // post-json uses GET with params
      headers: {
        'User-Agent': 'HolyLandPhotos/1.0',
      },
    })

    const text = await res.text()

    // MailChimp wraps JSONP responses — strip the callback if present
    // Response format: callbackName({"result":"success","msg":"..."})
    // Without a callback param, it returns plain JSON
    let data: { result: string; msg: string }
    try {
      data = JSON.parse(text)
    } catch {
      // Try to extract JSON from JSONP wrapper
      const match = text.match(/\{.*\}/)
      if (match) {
        data = JSON.parse(match[0])
      } else {
        data = { result: 'error', msg: 'Unexpected response from MailChimp' }
      }
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json(
      { result: 'error', msg: 'Server error. Please try again.' },
      { status: 500 },
    )
  }
}
