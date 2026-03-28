import { createClient } from '@libsql/client'

export async function GET() {
  const url = process.env.DATABASE_URL || ''
  const authToken = process.env.DATABASE_AUTH_TOKEN || ''

  const envCheck = {
    DATABASE_URL: url ? `${url.substring(0, 30)}...` : 'NOT SET',
    DATABASE_AUTH_TOKEN: authToken ? 'SET (hidden)' : 'NOT SET',
    url_length: url.length,
    url_has_whitespace: url !== url.trim(),
  }

  try {
    const client = createClient({ url, authToken })
    const result = await client.execute('SELECT 1 as test')
    return Response.json({ status: 'ok', env: envCheck, dbTest: result.rows })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ status: 'error', env: envCheck, message }, { status: 500 })
  }
}
