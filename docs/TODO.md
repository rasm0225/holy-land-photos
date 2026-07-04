# Holy Land Photos — Consolidated TODO List

Last updated: 2026-05-22 (post-launch)

🚀 **Live at https://holylandphotos.org since 2026-05-22.**

See also: [SEO TODO](seo-todo.md) — structured-data, sitemap, and meta-tag improvements split out from this list.

---

## Post-launch follow-ups

- [x] **Convert SSL cert to HTTP-01 auto-renewal** (done 2026-05-22). Cert re-issued via `certbot --nginx`, renewal config switched from `authenticator=manual` to `authenticator=nginx`, `certbot-renew.timer` enabled. Renewal runs daily; certbot only actually contacts Let's Encrypt when the cert is within 30 days of expiry.
- [ ] **Raise TTLs back to 1800s** at Namecheap once the launch has stabilised (24h+). Currently 60s on both A records as a fast-rollback hedge.
- [ ] **+1 month: ping Jesse to decommission Azure App Service.** Confirms the old site is no longer needed and stops the monthly bill. (Dropped the related "email Carl the Azure fallback URL" item 2026-07-04 — six weeks of stable production made the fallback moot.)
- [x] **Submit sitemap to Search Console** (done 2026-07-04). `https://holylandphotos.org/sitemap.xml`. (Property ownership preserved via the kept `google-site-verification` TXT record.)
- [x] **Close out AIT cPanel account** (done 2026-07-04). Old DNS records there are no longer authoritative.
- [ ] **Clean up the duplicate `google-site-verification` TXT** at Namecheap — the one with the prefix in the Host field. Harmless, but dead weight.

## Functional (launch complete)

- [x] **Fix newsletter MailChimp integration** — migrated to MailChimp Marketing API v3; classic `subscribe/post-json` was deprecated and 404'd. `MAILCHIMP_API_KEY` lives in EC2 `.env`.
- [x] **Transfer domains to Namecheap** — `holylandphotos.org` and `holylandarchive.com` (both done 2026-05-18 / 2026-05-20).
- [x] **Launch: point holylandphotos.org at EC2** — done 2026-05-22. A records flipped, Azure-specific records removed, Let's Encrypt cert issued, nginx serving on apex + www with HTTPS. See [`docs/dns-snapshot.md`](dns-snapshot.md).
- [x] **Old ASP URL redirects** — middleware handles go.asp, browse.asp, page.asp, search.asp, whats_new.asp with 301 redirects. Also rewrote 222 in-content `.asp` URLs to modern routes via `scripts/rewrite_asp_links.py`.
- [x] **Disconnect hlp.everyphere.com** — DNS record removed at everyphere.com; nginx vhost + Let's Encrypt cert removed on EC2.

## Design / UI

- [x] **Restyle AI search full page** (`/ai-search`) — done, Round 2 side rail available if needed later
- [x] **Mobile hamburger menu QA** — tested on real devices, mobile nav now also sticks to top on scroll
- [x] **Lightbox + download modal QA** — tested on real devices
- [ ] **7 miscategorized section types** — Climate/Water, Dead Sea, Flowers, Houses, People, Plants, Sheep & Shepherding tagged as "country" but aren't (ask Dr. Rasmussen)

## Content / Data

- [ ] **242 records with inline `<img>` tags** — still rendering from htmlBody, not converted to Lexical (`docs/tricky-html-content.csv`)
- [ ] **592 section images without photo records** — low-res thumbnails in S3 `section/` folder need uploading as proper photos (`docs/section-images-without-photo-record.csv`)
- [ ] **10 pages with missing userfile images** — also missing on old site, need originals from Dr. Rasmussen (`docs/missing-userfile-images.csv`)
- [ ] **27 unmapped old URLs** referencing deleted sections — flag to Dr. Rasmussen. (Note: `scripts/rewrite_asp_links.py` left 14 of these untouched in DB content; they continue to work via middleware → /gone redirect.)
- [ ] **2 sections with broken cover-image references** — DB has `sectionImage` filename but the file is missing from S3:
  - [`central-turkey`](https://holylandphotos.org/browse/central-turkey) (region) — `PergeTarsusPA.jpg`
  - [`views-to-and-from-masada`](https://holylandphotos.org/browse/views-to-and-from-masada) (site) — `534_ICDSMSVS01_400.jpg`
- [ ] **37 sections with no cover image at all** — neither `primaryImage` nor `sectionImage` set. Mostly museums, people categories, and trip pages. Carl can pick one in the admin per section.
- [ ] **Discuss photo metadata with Dr. Rasmussen** — `year` column (separate from added-date) and `photographer` column are both empty for all 7,025 rows; alt text strategy still TBD. (Note: `created_at` is now accurate from 2001-2026, repaired from the archived ASP `image_DateAdded`.)

## DevOps / Maintenance

- [x] **Create deploy script** — one-command EC2 deploys instead of manual SSH
- [x] **Consider upgrading to t3.medium** — tight on RAM with two apps (HLP + GGF), must stop app before builds
- [x] **Update project status memory** — several items are stale (still mentions Vercel/Railway as active)
- [x] **Stand up a real staging environment** — decided 2026-05-15 to *not* set up a separate staging environment. Release cadence is expected to be ≤ once a day for the first week post-launch and then weekly-to-monthly, with a 30-300s outage tolerance. The cost of a separate t3.small (~$15/mo, ~30% of total infra spend) wasn't justified at this volume. Instead we rely on three things:
  1. `deploy.sh` builds before stopping the app and auto-rolls back to the previous commit on build failure or post-restart healthcheck failure.
  2. A GitHub Actions build workflow (`.github/workflows/build.yml`) runs `npm run build` on every push and PR — catches the kind of build/config errors that took the site down on 2026-05-15.
  3. Local dev is reliable: `push: false` on the SQLite adapter (in `payload.config.ts`) suppresses Drizzle's destructive interactive prompt, so `npm run dev` always starts cleanly. Schema changes go through `npx payload migrate:create` + `npx payload migrate`.

  Reconsider this if release cadence picks up, the site gets a watcher whose tolerance for downtime is < 1 minute, or a destructive content migration needs to be rehearsed against representative data. The same-EC2-second-vhost option (~$0) is the natural next step if so — see git history of this file for notes.

## CMS Cleanup (low priority)

- [ ] **Remove SectionPhotos junction collection** — hidden but still in code
- [ ] **Remove SectionImages.ts file** — no longer registered in config
- [ ] **Decide HTML body field strategy** — keep dual fields (Lexical + htmlBody) or consolidate

## Future Features (backlog)

- [x] **Recent Additions page** — `/pages/recent-additions` shows recently added photos with 7 / 30 / 60 day filters
- [ ] **RSS feed at `/rss/`** — replicate the legacy ASP RSS 2.0 feed. Spec captured in [`docs/rss-feed-spec.md`](rss-feed-spec.md). Existing subscribers (RSS readers, aggregators) consume this URL today; we need it to keep working after the EC2 launch.
- [ ] **AI-suggested alternate spellings/tags** — on-save hook for transliterations
- [x] **Feedback form** — on-site form at `/feedback` writes to a `Feedback` Payload collection. Footer/drawer "Feedback" links updated; mailto removed (except on `/gone` page). Honeypot + per-IP rate limit guard against bot spam.
- [ ] **Payment/accounts for AI search** — Stripe integration if usage warrants it
- [ ] **Decide on `holylandarchive.com`** — keep and redirect to holylandphotos.org, or let it lapse?
