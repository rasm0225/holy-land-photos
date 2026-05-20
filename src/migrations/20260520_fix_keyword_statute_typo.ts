import { MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

// Data fix: "Statute" → "Statue" in 13 photos' keywords. The misspelling
// broke whole-word search for "Statue" on those rows (mostly the Piraeus
// museum bronzes plus one Olympia model and one Aphrodisias governor).
// All 13 occurrences were reviewed individually — none were the legal
// "statute". Down is intentionally irreversible.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`UPDATE photos SET keywords = REPLACE(keywords, 'Statute', 'Statue') WHERE keywords LIKE '%Statute%';`,
  )
}

export async function down(): Promise<void> {
  throw new Error(
    'Irreversible: re-introducing the typo would corrupt cleanly-spelled "Statue" keywords.',
  )
}
