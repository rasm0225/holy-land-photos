import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Add the `feedback` collection — public feedback form submissions.
 *
 * Hand-trimmed from the migrate:create output: the generator also re-emitted
 * an `ALTER TABLE sections ADD legacy_old_id` because it can't see that the
 * prior 20260519_180000 migration already applied it on the live DB. Running
 * the verbatim generated script would fail (column already exists), so this
 * keeps only the feedback-related changes. See CLAUDE.md "Schema migrations".
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`feedback\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`status\` text DEFAULT 'new',
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`subject\` text,
  	\`message\` text NOT NULL,
  	\`ip_address\` text,
  	\`user_agent\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`feedback_updated_at_idx\` ON \`feedback\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feedback_created_at_idx\` ON \`feedback\` (\`created_at\`);`)
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`feedback_id\` integer REFERENCES feedback(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_feedback_id_idx\` ON \`payload_locked_documents_rels\` (\`feedback_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite can't DROP a column that participates in a foreign key, so the
  // standard idiom is rebuild-table-without-the-column.
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`sections_id\` integer,
  	\`photos_id\` integer,
  	\`section_photos_id\` integer,
  	\`pages_id\` integer,
  	\`news_id\` integer,
  	\`site_of_the_week_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`sections_id\`) REFERENCES \`sections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`photos_id\`) REFERENCES \`photos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`section_photos_id\`) REFERENCES \`section_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`site_of_the_week_id\`) REFERENCES \`site_of_the_week\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "sections_id", "photos_id", "section_photos_id", "pages_id", "news_id", "site_of_the_week_id") SELECT "id", "order", "parent_id", "path", "users_id", "sections_id", "photos_id", "section_photos_id", "pages_id", "news_id", "site_of_the_week_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_sections_id_idx\` ON \`payload_locked_documents_rels\` (\`sections_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_photos_id_idx\` ON \`payload_locked_documents_rels\` (\`photos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_section_photos_id_idx\` ON \`payload_locked_documents_rels\` (\`section_photos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_site_of_the_week_id_idx\` ON \`payload_locked_documents_rels\` (\`site_of_the_week_id\`);`,
  )
  await db.run(sql`DROP TABLE \`feedback\`;`)
}
