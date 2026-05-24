# HolyLandPhotos.org — Instructions for Claude Code

This file is read automatically by Claude Code at the start of every session.
It captures the operational rules currently in force for the site.

Historical context from the migration/build phase — proposed stack, design direction,
accessibility audit, contrast-ratio table, content-type inventory, URL/data architecture,
CMS requirements — has been archived to [docs/build-history.md](docs/build-history.md).

---

## Project Summary
A modern rebuild of holylandphotos.org — a photography and Holy Land scholarship website.
- **Owner:** Dr. Carl Rasmussen (photographer, biblical scholar)
- **Supervisor:** Peter (does QA and approvals)
- **Builder:** Claude Code

**Status:** Live in production at https://holylandphotos.org since 2026-05-22. The old Azure-hosted ASP site at `hlp-web.azurewebsites.net` is still up as a fallback until Jesse decommissions it (planned ~1 month post-launch). Post-launch work is tracked in [`docs/TODO.md`](docs/TODO.md).

---

## Guiding Principles
- **Preserve everything** — no content, photos, or features should be lost in the migration
- **Keep it simple** — this site serves scholars and general visitors, not tech-savvy users
- **Content-first** — the photography and writing are the product; the tech serves them
- **Low maintenance** — the owner should be able to keep it running without a developer for routine updates

---

## Autonomy — Pre-Authorized Actions

Peter has pre-authorized the following actions. Do them without asking for confirmation:

- **`git commit` and `git push` to `main`** — commit and push whenever completing a task Peter requested. No need to ask "should I push this?"
- **`./deploy.sh`** — run after pushing changes that should go live; the script handles local pre-flight build, EC2 deploy with auto-rollback, and post-deploy smoke check.
- **Reading, editing, and writing any file in this repo** — no confirmation needed
- **Running any bash command scoped to this project directory** — grep, ls, cat, etc.

The only things that still require Peter's explicit sign-off before proceeding:
- Deleting files (use caution; ask first)
- Force-pushing or rewriting git history
- Any action that affects external services (MailChimp, PayPal, DNS, S3/CloudFront)

---

## Conventions
- Always use `npm run dev` to start the dev server
- QA sign-off from Peter required before any section is considered done
- Match the original site's URLs where possible to preserve SEO and inbound links
- **Always deploy via `./deploy.sh`** — never SSH to EC2 and run `git pull` / `npm run build` by hand. The script runs a local pre-flight build, atomic-ish EC2 deploy with auto-rollback on build or healthcheck failure, and then `scripts/qa-smoke.sh` against the live site. Bypassing it loses the safety net.
- **Do not rely on image ID naming conventions for code logic.** The existing photos follow a pattern (e.g. `TEETHN02`, `FRPALOST04`) but this is a convention Dr. Rasmussen used, not a rule. Future uploads may not follow it. Always use database lookups (e.g. querying the photos collection) rather than filename pattern matching to determine whether a file is a photo, which section it belongs to, etc.
- **Photo comments are stored as HTML, not plain text.** They contain inline `<em>` for scholarly terms, links to related photos, and other markup. Always render comment fields as HTML — never escape them as plain text.

### Schema migrations — read before running

When adding a field to a collection, the workflow is:

1. Edit the collection `.ts` to add the field.
2. Run `npx payload migrate:create <description>`.
3. **Open the generated `src/migrations/*.ts` file and read every statement.** If it contains `CREATE TABLE` for tables that already exist on the live DB (`photos`, `sections`, `pages`, `news`, `site_of_the_week`, etc.) — or `DROP TABLE` in its `down()` — **do not run it**. Payload's diff generator can't always tell that the live schema is already up to date for unrelated tables and will emit a full-from-scratch script. Running it would destroy data.
4. When that happens (it did on the May 2026 `published`-field migration), replace the generated `.ts` with a hand-written minimal `ALTER TABLE … ADD COLUMN …` (+ matching `CREATE INDEX`) for only your intended change. Keep the `.json` snapshot file — it's the next baseline for `migrate:create`.
5. Test locally: `echo y | npx payload migrate`, then verify with `sqlite3 data/payload.db "PRAGMA table_info(<table>);"`.
6. Commit migration + collection change together.
7. `./deploy.sh` runs `echo y | npx payload migrate` automatically before the build, against the live DB. The DB is backed up first via the standard backup protocol if the change is destructive.

### `deploy.sh` step order matters

Currently: pull → install → **migrate** → regenerate redirect maps → build → stop → start → healthcheck → smoke. Migrations must run before the redirect-map generator because that script queries `sections.published`. Don't reorder without thinking through what each step reads.

### Server-side config is NOT auto-deployed

`./deploy.sh` deploys the Next.js app only. nginx configs, the cron job that refreshes the IP blocklists, and Let's Encrypt certs all live on EC2 and have to be updated manually (`scp` + `nginx -t` + `systemctl reload nginx`). Reference copies and a runbook are at [`server/README.md`](server/README.md). If you touch nginx, sync the repo afterward — and if the repo's `server/nginx/*.conf` look out of date relative to EC2, pull the EC2 versions back in (the runbook covers the exact commands).

---

## QA Tools (confirmed working)
- **metatags.io** — validates Open Graph and Twitter Card tags; confirms social share previews
- **validator.schema.org** — validates Schema.org structured data markup

Run both on any new page template before sign-off. The footer year must always be dynamic (`new Date().getFullYear()`) — never hardcode a year.

---

## Content Rule — Verbatim Only

All body copy on the site must come **verbatim from the original holylandphotos.org content** (now in the database or the `archive/` CSVs). Never paraphrase, summarize, or write substitute copy. Exception: the homepage intro and other Claude-authored framing copy is fine to edit freely.
