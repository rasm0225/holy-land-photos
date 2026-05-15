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
- [ ] **Mobile hamburger menu QA** — just built, needs testing on real devices
- [ ] **Lightbox + download modal QA** — just restyled, needs testing
- [ ] **7 miscategorized section types** — Climate/Water, Dead Sea, Flowers, Houses, People, Plants, Sheep & Shepherding tagged as "country" but aren't (ask Dr. Rasmussen)

## Content / Data

- [ ] **242 records with inline `<img>` tags** — still rendering from htmlBody, not converted to Lexical (`docs/tricky-html-content.csv`)
- [ ] **592 section images without photo records** — low-res thumbnails in S3 `section/` folder need uploading as proper photos (`docs/section-images-without-photo-record.csv`)
- [ ] **10 pages with missing userfile images** — also missing on old site, need originals from Dr. Rasmussen (`docs/missing-userfile-images.csv`)
- [ ] **27 unmapped old URLs** referencing deleted sections — flag to Dr. Rasmussen
- [ ] **Discuss photo metadata with Dr. Rasmussen** — year field, photographer attribution, alt text strategy

## DevOps / Maintenance

- [x] **Create deploy script** — one-command EC2 deploys instead of manual SSH
- [x] **Consider upgrading to t3.medium** — tight on RAM with two apps (HLP + GGF), must stop app before builds
- [x] **Update project status memory** — several items are stale (still mentions Vercel/Railway as active)
- [ ] **Stand up a real staging environment** — currently `hlp.everyphere.com` *is* the only deployed environment. Once we point `holylandphotos.org` at EC2, every deploy is a prod deploy with no chance to catch breakage first. We had one full-site outage during the May 2026 ASP-redirect work (a `next.config.mjs` flag that crashed at server startup); `deploy.sh` now auto-rolls back, but that only catches failures we can detect from a homepage 200 check. Notes on how to set this up:
  - **Cheapest option:** add a second nginx vhost + pm2 process on the *same* EC2 box (`staging.holylandphotos.org`) running from a `staging` git branch with its own `.next/` build dir and its own copy of the SQLite file (refreshed nightly from prod, or shared read-only). ~free, but staging shares CPU/RAM with prod so a bad staging build can still affect prod indirectly.
  - **Cleaner option:** a second small EC2 instance (t3.small ≈ $15/mo) running the same stack from the `staging` branch. Fully isolated. DNS: `staging.holylandphotos.org` → second instance. Promote to prod by merging `staging` → `main`.
  - **Workflow change either way:** deploy to `staging` first, smoke-test the changed pages (and any pages that touch shared infra like middleware, layout, next.config), then deploy to prod. The deploy script can be parameterized: `./deploy.sh staging` vs `./deploy.sh prod`.
  - **DB strategy:** staging should have its own SQLite file so destructive content migrations (like the `remap_urls.py` run) can be rehearsed there first. Sync from prod periodically (e.g. `scp` nightly) so staging content stays representative.
  - **Don't overbuild:** for this site (low traffic, one maintainer, infrequent changes) the same-EC2-second-vhost option is probably right. The cost of a Friday-afternoon prod outage is much lower than for a SaaS app.

## CMS Cleanup (low priority)

- [ ] **Remove SectionPhotos junction collection** — hidden but still in code
- [ ] **Remove SectionImages.ts file** — no longer registered in config
- [ ] **Decide HTML body field strategy** — keep dual fields (Lexical + htmlBody) or consolidate

## Future Features (backlog)

- [ ] **Recent Additions page** — logic for showing recently added photos/content
- [ ] **AI-suggested alternate spellings/tags** — on-save hook for transliterations
- [ ] **Feedback form** — replace mailto link with a web form
- [ ] **Payment/accounts for AI search** — Stripe integration if usage warrants it
