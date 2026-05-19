import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Add `published` (boolean, default true) to the photos and sections tables.
 *
 * Hand-written rather than auto-generated. Payload's `migrate:create` produced
 * a full from-scratch CREATE TABLE script because the live DB has never been
 * tracked in payload_migrations — running that as-is would have dropped every
 * table. This file is minimal on purpose: just the two columns and their
 * indexes, with no other schema diff.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`photos\` ADD COLUMN \`published\` integer DEFAULT true;`)
  await db.run(sql`CREATE INDEX \`photos_published_idx\` ON \`photos\` (\`published\`);`)

  await db.run(sql`ALTER TABLE \`sections\` ADD COLUMN \`published\` integer DEFAULT true;`)
  await db.run(sql`CREATE INDEX \`sections_published_idx\` ON \`sections\` (\`published\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`sections_published_idx\`;`)
  await db.run(sql`ALTER TABLE \`sections\` DROP COLUMN \`published\`;`)

  await db.run(sql`DROP INDEX IF EXISTS \`photos_published_idx\`;`)
  await db.run(sql`ALTER TABLE \`photos\` DROP COLUMN \`published\`;`)
}
