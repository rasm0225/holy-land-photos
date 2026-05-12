/**
 * Shared database query helper.
 *
 * Works with both local SQLite (file:) and remote Turso (libsql://) URLs.
 * Uses @libsql/client which is already a dependency of @payloadcms/db-sqlite.
 */

import { createClient } from '@libsql/client'

let client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!client) {
    const url = process.env.DATABASE_URL || ''
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined
    client = createClient({ url, authToken })
  }
  return client
}

export async function dbQuery(
  sql: string,
): Promise<Array<Record<string, unknown>>> {
  const db = getClient()
  const result = await db.execute(sql)
  // Convert to plain objects
  return result.rows.map((row) => {
    const obj: Record<string, unknown> = {}
    for (const col of result.columns) {
      obj[col] = row[col as keyof typeof row]
    }
    return obj
  })
}

export async function dbExecute(sql: string): Promise<void> {
  const db = getClient()
  await db.execute(sql)
}
