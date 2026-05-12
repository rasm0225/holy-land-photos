/**
 * Search logging — stores anonymous search query stats.
 *
 * Privacy: no IP, no session, no user ID. Only the query text,
 * type, result count, duration, and optional referrer path.
 */

import { dbExecute } from './db'

export type SearchType = 'regular' | 'ai'

export async function logSearch(params: {
  query: string
  searchType: SearchType
  resultCount?: number | null
  durationMs?: number | null
  referrerPath?: string | null
}): Promise<void> {
  try {
    const q = params.query.slice(0, 500).replace(/'/g, "''")
    const t = params.searchType
    const rc = params.resultCount != null ? String(params.resultCount) : 'NULL'
    const dm = params.durationMs != null ? String(params.durationMs) : 'NULL'
    const rp = params.referrerPath
      ? `'${params.referrerPath.slice(0, 200).replace(/'/g, "''")}'`
      : 'NULL'

    await dbExecute(
      `INSERT INTO search_logs (query, search_type, result_count, duration_ms, referrer_path) VALUES ('${q}', '${t}', ${rc}, ${dm}, ${rp})`,
    )
  } catch (err) {
    // Never let logging break a search
    console.error('searchLog error:', err)
  }
}
