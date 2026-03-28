import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    return Response.json({ status: 'ok', collections: payload.collections ? Object.keys(payload.collections) : [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('Payload init error:', err)
    return Response.json({ status: 'error', message, stack }, { status: 500 })
  }
}
