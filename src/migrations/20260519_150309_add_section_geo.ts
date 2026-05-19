import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`sections\` ADD \`latitude\` numeric;`)
  await db.run(sql`ALTER TABLE \`sections\` ADD \`longitude\` numeric;`)
  await db.run(sql`ALTER TABLE \`sections\` ADD \`geo_review_status\` text DEFAULT 'pending';`)
  await db.run(sql`ALTER TABLE \`sections\` ADD \`geo_source\` text;`)
  await db.run(sql`ALTER TABLE \`sections\` ADD \`geo_notes\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`sections\` DROP COLUMN \`latitude\`;`)
  await db.run(sql`ALTER TABLE \`sections\` DROP COLUMN \`longitude\`;`)
  await db.run(sql`ALTER TABLE \`sections\` DROP COLUMN \`geo_review_status\`;`)
  await db.run(sql`ALTER TABLE \`sections\` DROP COLUMN \`geo_source\`;`)
  await db.run(sql`ALTER TABLE \`sections\` DROP COLUMN \`geo_notes\`;`)
}
