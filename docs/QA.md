# QA Checklist

Three flavors:

1. **Pre-launch** — full sweep, run once before pointing `holylandphotos.org` at EC2.
2. **Per-deploy smoke** — 90 seconds after every `./deploy.sh`.
3. **Per-feature** — when a specific area changes (lightbox, search, mobile nav, etc.).

Run on the live URL (`https://hlp.everyphere.com` until launch, then `https://holylandphotos.org`). Use an **incognito window** for anything where logged-in vs logged-out matters — the admin "Edit" link in the nav is a good logged-in/logged-out canary.

---

## Per-deploy smoke (≤ 90 seconds)

Right after `./deploy.sh` reports success:

- [ ] Homepage loads — `https://hlp.everyphere.com/` returns within ~1s, no missing images
- [ ] One browse page — e.g. `/browse/greece-north`, image + text both render
- [ ] One photo page — e.g. `/photos/IJNTMZSP09`, image loads, "Added: YYYY" shows under it
- [ ] One static page — e.g. `/pages/about-this-site`, body renders, no broken links visible
- [ ] Old URL redirect — `https://hlp.everyphere.com/search.asp` redirects to `/search`
- [ ] Mobile shape — open dev tools, switch to iPhone view, scroll the homepage. Top nav stays pinned.

If any of these fail, run `git revert HEAD && git push origin main && ./deploy.sh`.

---

## Pre-launch full sweep

### Critical user flows

- [ ] **Browse all the way down.** Homepage → a country → a region → a site → a photo. Nothing 404s, breadcrumbs are correct at every step.
- [ ] **Photo download.** Open any photo, click the download button, confirm the copyright clickthrough appears, accept it, confirm the JPG actually downloads.
- [ ] **Keyword search.** Search for a real keyword (e.g. "Jerusalem"). Results page shows photos AND sections. Click a result, it's the right page.
- [ ] **AI search.** From the homepage panel or `/ai-search`, ask "Where can I find photos of the Sea of Galilee?" Confirm the assistant responds with relevant links.
- [ ] **Newsletter signup.** Try the form. Either confirm it submits successfully, or note it's still broken (it's on the TODO list — don't be surprised if so).
- [ ] **News.** `/news` lists articles in date order; click into one, body and gallery render.
- [ ] **Site of the Week.** Featured section on the homepage links to a real page.

### Old URL redirects

These are inbound links from old books, references, and search engines. Test a couple:

- [ ] `/search.asp` → `/search` (no DB lookup needed)
- [ ] `/whats_new.asp` → `/news`
- [ ] `/go.asp?img=TWCSSM20` → `/photos/TWCSSM20`
- [ ] `/browse.asp?SiteID=13` → `/browse/greece-north` (DB lookup)
- [ ] `/browse.asp?SiteID=99999` → `/gone` (orphan handler — should show "page no longer available", not 404)
- [ ] `/browse/greece-north/browse.asp?SiteID=99999` → `/gone` (relative link from inside a page, also handled)

### Mobile (use a real phone if possible — desktop dev tools is OK as a fallback)

- [ ] **Sticky top nav.** Scroll down a long photo page; the top bar with the hamburger and search icon stays in place.
- [ ] **Hamburger menu.** Tap the hamburger; drawer opens. Tap outside it; closes. Tap a link; navigates and closes.
- [ ] **Lightbox on touch.** Tap a photo; fullscreen overlay opens. Tap outside the image; closes. Tap the X button; closes.
- [ ] **No pinch-to-zoom needed.** Body text is comfortably readable without zooming on a 5–6" phone.
- [ ] **No horizontal scroll.** Scroll any long page side-to-side; should not move.

### Accessibility quick pass

- [ ] **Keyboard-only nav.** From the homepage, press Tab repeatedly. You should be able to reach every nav link, the search input, and at least the first photo on the page. Focus indicator (an outline) is visible at every step.
- [ ] **Lightbox keyboard.** Open a lightbox with Enter/Space on a focused thumbnail. Press Esc; closes. Focus returns to the thumbnail.
- [ ] **Screen reader spot-check.** Turn on VoiceOver (Cmd+F5 on Mac). Navigate the homepage. Confirm photo alts are described, not skipped or read as filenames.
- [ ] **Run [axe DevTools](https://www.deque.com/axe/devtools/)** on the homepage and on a photo page. Note any "serious" or "critical" issues for follow-up.

### Cross-browser

Open the homepage and one photo page in each:

- [ ] Safari (Mac)
- [ ] Safari (iOS)
- [ ] Chrome (desktop)
- [ ] Chrome (Android, if you have one)

Note any rendering differences. Photo pages are the most likely place to see issues (lightbox, sticky nav).

### Social sharing previews

Use [metatags.io](https://metatags.io) on:

- [ ] Homepage URL — preview shows photo, title, description
- [ ] One photo URL — preview shows the photo as the OG image
- [ ] One section URL — preview shows the section image

### Structured data

Use the [Schema.org Validator](https://validator.schema.org/) on:

- [ ] Homepage — `WebSite` + `SearchAction` validate
- [ ] One photo URL — `ImageObject` validates with creator and (when available) date
- [ ] One section URL — `Place` and `BreadcrumbList` validate

### Edge cases

- [ ] **404.** Visit `https://hlp.everyphere.com/browse/this-does-not-exist`. Should be a real "not found", not a stack trace.
- [ ] **Print view.** From a photo page, File → Print (or ⌘P). Should show photo + caption + URL, no nav chrome, no Edit link.
- [ ] **Logged-in vs logged-out.** Open a photo page in incognito — no "Edit" link in the nav. Open the same page in a window where you're signed in to `/admin` — "Edit" link appears.

---

## Per-feature QA

When something specific changes, focus the run on the area:

- **Lightbox change** → photo page sweep (open, navigate prev/next, close, mobile, keyboard)
- **Mobile nav change** → mobile sticky-nav test, hamburger open/close, scroll behavior
- **Search/AI search change** → run 5–10 representative queries
- **Section/photo page layout change** → spot-check 3–5 sections of different shapes (with section image, without, with long body, with short body)
- **Middleware/redirect change** → the "Old URL redirects" block above

---

## Reporting issues

If you find anything, file it (or just text Claude) with:

1. The exact URL
2. What you expected
3. What you saw (screenshot if visual)
4. Browser + device

Most issues caught during QA can be fixed and redeployed within a few minutes.
