import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Add `legacy_old_id` to sections — the original section_Old_ID from the
 * pre-rebuild ASP site, used by middleware and the body-link remapper to
 * resolve incoming `?SiteID=` and `?SubRegionID=` URLs. Backfilled from
 * archive/dbo.holylandphotos_Sections.csv by
 * scripts/backfill_legacy_old_id.py.
 *
 * Hand-written to scope the change — see CLAUDE.md "Schema migrations".
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`sections\` ADD COLUMN \`legacy_old_id\` integer;`)
  await db.run(
    sql`CREATE INDEX \`sections_legacy_old_id_idx\` ON \`sections\` (\`legacy_old_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`sections_legacy_old_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`sections\` DROP COLUMN \`legacy_old_id\`;`)
}
