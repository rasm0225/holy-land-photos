# Holy Land Photos — Consolidated TODO List

Last updated: 2026-05-13

---

## Functional / Must-do before launch

- [ ] **Fix newsletter MailChimp integration** — server error on submit (broken since April)
- [ ] **Transfer domains to Namecheap** — `holylandphotos.org` and `holylandarchive.com` (in progress, waiting on EPP codes from AIT)
- [ ] **Launch: point holylandphotos.org at EC2** — change A record to `18.220.101.13`, get SSL cert, update nginx
- [ ] **Old ASP URL redirects** — `go.asp?s=N`, `go.asp?img=ID`, `browse.asp`, `page.asp` — 4,885 remapped URLs need redirect rules so old inbound links still work
- [ ] **Decide on `holylandarchive.com`** — keep and redirect to holylandphotos.org, or let it lapse?

## Design / UI

- [ ] **Restyle AI search full page** (`/ai-search`) — design exists in Round 2 handoff but not yet implemented
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

## CMS Cleanup (low priority)

- [ ] **Remove SectionPhotos junction collection** — hidden but still in code
- [ ] **Remove SectionImages.ts file** — no longer registered in config
- [ ] **Decide HTML body field strategy** — keep dual fields (Lexical + htmlBody) or consolidate

## Future Features (backlog)

- [ ] **Recent Additions page** — logic for showing recently added photos/content
- [ ] **AI-suggested alternate spellings/tags** — on-save hook for transliterations
- [ ] **Feedback form** — replace mailto link with a web form
- [ ] **Payment/accounts for AI search** — Stripe integration if usage warrants it
