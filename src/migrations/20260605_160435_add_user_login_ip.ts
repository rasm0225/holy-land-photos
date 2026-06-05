import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`last_login_ip\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`last_login_at\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`last_login_ip\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`last_login_at\`;`)
}
