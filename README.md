# Holy Land Photos

A photography and biblical scholarship website by Dr. Carl Rasmussen, rebuilt with modern web technology.

**Live site:** https://holylandphotos.org
**CMS admin:** https://holylandphotos.org/admin
**GitHub:** https://github.com/rasm0225/holy-land-photos

Launched 2026-05-22, replacing the legacy Azure-hosted ASP site. See [`docs/dns-snapshot.md`](docs/dns-snapshot.md) for the cut-over record.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | [Next.js](https://nextjs.org/) 15 + React 19 | Full-stack web framework |
| CMS | [Payload CMS](https://payloadcms.com/) 3.0 | Content management, embedded in the Next.js app |
| Database | SQLite (local file) | Fast local database via @libsql/client |
| Image Storage | [AWS S3](https://aws.amazon.com/s3/) (private) + [CloudFront](https://aws.amazon.com/cloudfront/) | 7,000+ photos (6.3 GB), served via `photos.holylandphotos.org` over HTTP/2+3 with long-lived cache headers |
| AI Search | [Claude Haiku 4.5](https://anthropic.com/) | Conversational search assistant via Anthropic API |
| Analytics | GA4 + custom logging | Google Analytics + anonymous search/page load logs |
| Email | [MailChimp Marketing API v3](https://mailchimp.com/developer/marketing/api/) | Newsletter signup (key in `MAILCHIMP_API_KEY` env var) |
| Feedback | Payload `feedback` collection + on-site form | `/feedback` page with honeypot + per-IP rate limit; submissions visible in admin |
| Hosting | AWS EC2 (t3.small) | Always-on server with nginx + Let's Encrypt SSL |

## Content

- **730 sections** organized in a 5-level hierarchy (Top Level > Country > Region > Site > Artifact)
- **7,025 photos** with scholarly descriptions, keywords, and metadata, dated from 2001 through 2026 (`created_at` reflects when each photo was added to the original site, repaired from the ASP `image_DateAdded` column)
- **36 static pages** (About, Permissions, How to Use, Tours, etc.)
- **171 news articles** with image galleries
- **120 Site of the Week** entries

The original SQL Server CSV exports that the site was migrated from are preserved in [`archive/`](archive/) — re-running migrations or repair scripts only requires this repo.

## Architecture

```
Browser ─→ nginx (HTTP/2, SSL termination) → Next.js/Payload (port 3000) ─→ SQLite (local file)
       │                                                                  ├─→ Anthropic API (AI search)
       │                                                                  └─→ MailChimp API v3 (newsletter)
       └─→ CloudFront → S3 bucket (private, OAC-only)   (photos.holylandphotos.org)
```

The site runs on a single EC2 instance. The database is a local SQLite file, eliminating the network latency that caused slow page loads when using a remote database (Turso). Page loads are typically under 200ms.

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Local Development

```bash
# Clone the repo
git clone https://github.com/rasm0225/holy-land-photos.git
cd holy-land-photos

# Install dependencies
npm install

# Create .env file (see Environment Variables below)

# Start dev server
npm run dev
```

Visit `http://localhost:3000` for the public site, or `http://localhost:3000/admin` for the CMS.

### Environment Variables

Create a `.env` file in the project root:

```
# Database — local SQLite file (production) or Turso URL (dev)
DATABASE_URL=file:./data/payload.db

# Payload CMS
PAYLOAD_SECRET=a-random-secret-string

# AWS S3
S3_BUCKET=hlp-dev-photos-335804564725-us-east-2-an
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-2

# Anthropic (for AI search)
ANTHROPIC_API_KEY=sk-ant-...

# MailChimp (newsletter signup; key suffix encodes the datacenter, e.g. -us15)
MAILCHIMP_API_KEY=...
```

## Project Structure

```
holy-land-photos/
  payload.config.ts              # CMS configuration (collections, plugins, database)
  src/
    app/
      (frontend)/                # Public website
        page.tsx                 # Homepage (browse, pages, news carousel, STW)
        browse/[slug]/           # Section pages (two-column: image + body)
        photos/[imageId]/        # Photo pages (two-column: image + description, lightbox)
        search/                  # Keyword search with word-boundary matching
        ai-search/               # AI-powered conversational search (Claude Haiku)
        newsletter/              # MailChimp newsletter signup
        feedback/                # On-site feedback form, writes to Payload `feedback` collection
        news/, news/[id]/        # News listing and detail
        site-of-the-week/        # STW listing
        site-list/               # Full section hierarchy
        keywords/[keyword]/      # Photos/sections by keyword
        pages/[slug]/            # Static pages
        api/
          ai-search/             # Claude API endpoint with tool use
          newsletter/            # MailChimp v3 subscribe proxy
          feedback/              # Feedback-form endpoint (honeypot + per-IP rate limit)
          page-log/              # Anonymous page load timing collector
        components/
          PhotoSlideshow.tsx      # Auto-advancing carousel (News + SOTW on homepage)
          PhotoLightbox.tsx       # Fullscreen image overlay
          PageLogger.tsx          # Client-side performance measurement
          EditLink.tsx            # Admin edit link in nav
          KeywordLinks.tsx        # Clickable keyword tags
      (payload)/                 # CMS admin panel (auto-generated by Payload)
    collections/                 # Payload collection definitions
      Sections.ts                # Site hierarchy (730 sections)
      Photos.ts                  # Photo metadata (7,025 photos)
      Pages.ts                   # Static pages
      News.ts                    # News articles with image galleries
      SiteOfTheWeek.ts           # Featured sites
      Feedback.ts                # Public feedback form submissions (admin-only read)
      Users.ts                   # Admin users
    components/
      SectionHierarchy/          # Custom admin tree view
      KeywordIndex/              # Custom admin keyword browser
      SearchLogs/                # Custom admin search analytics dashboard
      PageLogs/                  # Custom admin page load analytics dashboard
      PhotoRowLabel/             # Photo thumbnail + title in section editor
      KeywordTagInput/           # Tag chip input for keywords
    lib/
      db.ts                      # Shared database query helper (@libsql/client)
      searchLog.ts               # Anonymous search logging
  scripts/
    migrate.py                   # CSV-to-database migration
    html_to_lexical.py           # HTML to Lexical rich text converter
    fix_photo_order.cjs          # Restore original photo ordering
    generate_breadcrumbs.py      # Generate section breadcrumbs
    generate_redirect_maps.py    # Build-time section/page slug map for middleware (run by deploy.sh)
    migrate_news_gallery.py      # Migrate news image galleries
    remap_urls.py                # (legacy) Rewrite legacy .asp links in HTML content to new routes
    rewrite_asp_links.py         # Modern .asp content rewriter; covers Lexical JSON + HTML, handles typos, idempotent
    repair_photo_dates.py        # Restore photos.created_at from archive/ ASP CSV
  archive/
    dbo.holylandphotos_*.csv     # Original ASP DB exports (March 2026), source-of-truth for migrations
  docs/
    section-images-without-photo-record.csv  # 592 section images needing upload
    missing-userfile-images.csv              # 10 pages with missing images
    tricky-html-content.csv                  # Records with complex HTML
```

## CMS Admin Features

- **Section Hierarchy** — tree view of all sections at `/admin/section-hierarchy`
- **Keyword Index** — searchable keyword browser at `/admin/keyword-index`
- **Search Logs** — anonymous search analytics at `/admin/search-logs`
- **Page Logs** — page load performance data at `/admin/page-logs`
- **Photo row labels** — thumbnails and titles in section photo lists
- **Preview buttons** — "View on site" links on Sections, Photos, Pages, and News
- **Tag chip input** — comma-separated keyword entry with removable pills
- **Drag-and-drop** photo ordering within sections
- **Searchable photos** — search by image ID, title, or keywords

## Public Frontend Features

- **Two-column layouts** — image + body on section and photo pages
- **Photo lightbox** — click any photo for fullscreen overlay (Escape to close)
- **AI Search** — conversational search powered by Claude Haiku 4.5 with tool use
- **Regular search** — word-boundary keyword search with "Searching..." indicator
- **News carousel** — active news items with photo slideshow on homepage
- **Site of the Week** — featured section on homepage
- **Breadcrumb navigation** — full hierarchy path on all section pages
- **Prev/next photos** — navigate within a section's photo set
- **Schema.org markup** — ImageObject, Place, BreadcrumbList on all pages
- **Open Graph tags** — social sharing metadata on all pages
- **Google Analytics** — GA4 tracking (measurement ID: G-8NL9MZ67TD)
- **Performance logging** — anonymous page load times via Performance API

## Deployment (EC2)

The site runs on AWS EC2 (t3.medium) in us-east-2 (Ohio).

### Deploy

```bash
./deploy.sh
```

The script SSHs into EC2 and runs an atomic-ish deploy:

1. **Records the currently-deployed commit** as a rollback target.
2. **Pulls** the latest `main`.
3. **Installs** dependencies (`npm ci`).
4. **Regenerates** `src/redirect-maps.generated.ts` from the live DB so the middleware has fresh section/page slug lookups.
5. **Builds** with the previous binary still serving traffic.
6. **Stops + restarts pm2** only after a successful build.
7. **Healthchecks** the homepage. If the build fails, or the homepage doesn't return 200, the script `git reset --hard`s back to the rollback commit, rebuilds, and restarts. So a bad commit can take the site down for the rebuild window (~1-2 minutes), but not longer.
8. **Runs `scripts/qa-smoke.sh`** against the live URL — 21 automated checks (routes, redirects, orphan handler, content presence, OG tags, JSON-LD). Smoke failures don't trigger an auto-rollback (the EC2 healthcheck already covers the catastrophic case) but they exit non-zero and tell you how to revert.

### No separate staging environment

`holylandphotos.org` is the only deployed environment — there is no `staging.holylandphotos.org`. With release cadence expected to be ≤ once a day initially and then weekly-to-monthly, and a 30–300s outage tolerance, a separate $15/mo EC2 instance wasn't justified. Three things take its place:

- **Reliable local dev.** `payload.config.ts` sets `push: false` on the SQLite adapter so `npm run dev` no longer prompts to rewrite the schema and risk data loss. Local dev is the primary way to catch breakage.
- **CI build check.** [`.github/workflows/build.yml`](.github/workflows/build.yml) runs `npm run build` on every push to `main` and every PR. Catches build/config errors (e.g. an unsupported `next.config.mjs` flag) before they hit EC2.
- **Auto-rollback in `deploy.sh`** (above).

See [`docs/TODO.md`](docs/TODO.md) for the conditions under which standing up a separate staging environment becomes worth the cost.

### SSH Access

```bash
ssh -i ~/.ssh/hlp-ec2-key.pem ec2-user@18.220.101.13
```

### Server Details

- **Elastic IP:** 18.220.101.13
- **Instance:** i-0f8a6e9a492f149d8 (t3.medium, 4GB RAM)
- **App directory:** /home/ec2-user/app
- **Database:** /home/ec2-user/data/payload.db
- **Process manager:** pm2 (process name: hlp)
- **Reverse proxy:** nginx with Let's Encrypt SSL, HTTP/2 enabled. Main vhost config in `/etc/nginx/conf.d/holylandphotos.conf`; default catch-all in `default.conf`.
- **Backups:** Daily SQLite dump to S3 at 2 AM UTC (30-day retention)
- **Backup location:** s3://hlp-dev-photos-335804564725-us-east-2-an/backups/db/

### Image CDN (CloudFront)

Photos are served via CloudFront at `photos.holylandphotos.org` (origin: the S3 bucket, locked to OAC-only). Configuration:

- **CloudFront distribution:** `E1LUVR8CWQDM5E` (`d38bzcfj2cy9zm.cloudfront.net`)
- **Origin Access Control:** `E37VLT7Z4KTS7M` — the bucket's only allowed reader
- **Response headers policy:** `90554b79-04f1-4ec9-84cc-d607d770f642` — injects `Cache-Control: public, max-age=31536000` on every response
- **ACM cert (us-east-1):** `arn:aws:acm:us-east-1:335804564725:certificate/80a19808-0710-455c-876f-5eaeb3fb0028` — DNS-validated via `_dff33600efab8f56daf78b432ff19e0b.photos.holylandphotos.org` CNAME (must stay in Namecheap for auto-renewal)
- **DNS:** `photos.holylandphotos.org` CNAME → `d38bzcfj2cy9zm.cloudfront.net.` (Namecheap)
- **HTTP versions served:** HTTP/2 + HTTP/3
- **S3 bucket access:** Block Public Access enabled; only CloudFront can read (via signed `cloudfront.amazonaws.com` principal in the bucket policy).

The CDN URL is referenced as the `S3_BASE` const in 12 page/component files plus `next.config.mjs` and `payload.config.ts`'s `s3Storage.generateFileURL`. If you ever switch CDNs, update all of them — there's no central helper today.

### Payload Commands

```bash
npx payload generate:types      # Regenerate TypeScript types
npx payload generate:importmap  # Regenerate admin import map (after adding components)
npx payload migrate:create      # Create a migration file from current code/schema diff
npx payload migrate             # Apply pending migrations to the configured database
```

Schema changes go through `migrate:create` + `migrate` because Drizzle's auto-push is disabled (see `db.push: false` in `payload.config.ts`).

## QA

See [`docs/QA.md`](docs/QA.md) for the manual checklists — a 90-second per-deploy smoke test and per-feature focus runs.

## Pending Work

See [`docs/TODO.md`](docs/TODO.md) for the consolidated task list.
