import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET() {
  const envCheck = {
    DATABASE_URL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT SET',
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN ? 'SET (hidden)' : 'NOT SET',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ? 'SET (hidden)' : 'NOT SET',
    VERCEL: process.env.VERCEL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  }

  try {
    const payload = await getPayload({ config })
    return Response.json({ status: 'ok', env: envCheck, collections: payload.collections ? Object.keys(payload.collections) : [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    return Response.json({ status: 'error', env: envCheck, message, stack }, { status: 500 })
  }
}
