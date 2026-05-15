# Holy Land Photos — Consolidated TODO List

Last updated: 2026-05-13

---

## Functional / Must-do before launch

- [ ] **Fix newsletter MailChimp integration** — server error on submit (broken since April)
- [ ] **Transfer domains to Namecheap** — `holylandphotos.org` and `holylandarchive.com` (transfers initiated, waiting for completion — check email for approval requests)
- [ ] **Launch: point holylandphotos.org at EC2** — change A record to `18.220.101.13`, get SSL cert, update nginx
- [x] **Old ASP URL redirects** — middleware handles go.asp, browse.asp, page.asp, search.asp, whats_new.asp with 301 redirects
- [ ] **Decide on `holylandarchive.com`** — keep and redirect to holylandphotos.org, or let it lapse?

## Design / UI

- [x] **Restyle AI search full page** (`/ai-search`) — done, Round 2 side rail available if needed later
- [x] **Mobile hamburger menu QA** — tested on real devices, mobile nav now also sticks to top on scroll
- [x] **Lightbox + download modal QA** — tested on real devices
- [ ] **7 miscategorized section types** — Climate/Water, Dead Sea, Flowers, Houses, People, Plants, Sheep & Shepherding tagged as "country" but aren't (ask Dr. Rasmussen)

## Content / Data

- [ ] **242 records with inline `<img>` tags** — still rendering from htmlBody, not converted to Lexical (`docs/tricky-html-content.csv`)
- [ ] **592 section images without photo records** — low-res thumbnails in S3 `section/` folder need uploading as proper photos (`docs/section-images-without-photo-record.csv`)
- [ ] **10 pages with missing userfile images** — also missing on old site, need originals from Dr. Rasmussen (`docs/missing-userfile-images.csv`)
- [ ] **27 unmapped old URLs** referencing deleted sections — flag to Dr. Rasmussen
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

- [ ] **Recent Additions page** — logic for showing recently added photos/content
- [ ] **AI-suggested alternate spellings/tags** — on-save hook for transliterations
- [ ] **Feedback form** — replace mailto link with a web form
- [ ] **Payment/accounts for AI search** — Stripe integration if usage warrants it
