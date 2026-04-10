/**
 * Search logging — stores anonymous search query stats in Turso.
 *
 * Privacy: no IP, no session, no user ID. Only the query text,
 * type, result count, duration, and optional referrer path.
 */

export type SearchType = 'regular' | 'ai'

export async function logSearch(params: {
  query: string
  searchType: SearchType
  resultCount?: number | null
  durationMs?: number | null
  referrerPath?: string | null
}): Promise<void> {
  try {
    const dbUrl = (process.env.DATABASE_URL || '').replace('libsql://', 'https://') + '/v2/pipeline'
    const token = process.env.DATABASE_AUTH_TOKEN || ''
    if (!dbUrl || !token) return

    await fetch(dbUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql: `INSERT INTO search_logs (query, search_type, result_count, duration_ms, referrer_path) VALUES (?, ?, ?, ?, ?)`,
              args: [
                { type: 'text', value: params.query.slice(0, 500) },
                { type: 'text', value: params.searchType },
                params.resultCount != null
                  ? { type: 'integer', value: String(params.resultCount) }
                  : { type: 'null', value: null },
                params.durationMs != null
                  ? { type: 'integer', value: String(params.durationMs) }
                  : { type: 'null', value: null },
                params.referrerPath
                  ? { type: 'text', value: params.referrerPath.slice(0, 200) }
                  : { type: 'null', value: null },
              ],
            },
          },
          { type: 'close' },
        ],
      }),
    })
  } catch (err) {
    // Never let logging break a search
    console.error('searchLog error:', err)
  }
}
