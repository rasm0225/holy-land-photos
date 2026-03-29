import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`sections_photos\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`photo_id\` integer NOT NULL,
    FOREIGN KEY (\`photo_id\`) REFERENCES \`photos\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sections_photos_order_idx\` ON \`sections_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sections_photos_parent_id_idx\` ON \`sections_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sections_photos_photo_idx\` ON \`sections_photos\` (\`photo_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`sections_photos\`;`)
}
