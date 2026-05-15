# QA Checklist

Three flavors:

1. **Pre-launch** — full sweep, run once before pointing `holylandphotos.org` at EC2.
2. **Per-deploy smoke** — 90 seconds after every `./deploy.sh`.
3. **Per-feature** — when a specific area changes (lightbox, search, mobile nav, etc.).

Run on the live URL (`https://hlp.everyphere.com` until launch, then `https://holylandphotos.org`). Use an **incognito window** for anything where logged-in vs logged-out matters — the admin "Edit" link in the nav is a good logged-in/logged-out canary.

Each item is tagged with who can do it: `[auto]` runs from `scripts/qa-smoke.sh`, `[claude]` is something Claude can do via the browser preview tool, `[you]` needs a real device or human judgment.

---

## Per-deploy smoke (≤ 90 seconds)

Most of this runs automatically:

```bash
./scripts/qa-smoke.sh                        # tests prod (hlp.everyphere.com)
./scripts/qa-smoke.sh https://localhost:3000 # tests local dev
```

Covered by the script:

- [ ] `[auto]` Homepage returns 200
- [ ] `[auto]` One browse page returns 200
- [ ] `[auto]` One photo page returns 200 and contains "Added: YYYY"
- [ ] `[auto]` One static page returns 200
- [ ] `[auto]` `/search.asp` → `/search` (no DB)
- [ ] `[auto]` `/whats_new.asp` → `/news`
- [ ] `[auto]` `/go.asp?img=…` → `/photos/…`
- [ ] `[auto]` `/browse.asp?SiteID=13` → `/browse/greece-north` (DB lookup)
- [ ] `[auto]` `/browse.asp?SiteID=99999` → `/gone` (orphan)
- [ ] `[auto]` `/browse/foo/browse.asp?SiteID=99999` → `/gone` (relative depth)
- [ ] `[auto]` `/gone` page renders
- [ ] `[auto]` Unknown slug `/browse/this-does-not-exist` returns 404, not 500

Still needs eyeballs:

- [ ] `[you]` Mobile shape — open dev tools, switch to iPhone view, scroll the homepage. Top nav stays pinned.

If anything fails, run `git revert HEAD && git push origin main && ./deploy.sh`.

---

## Pre-launch full sweep

### Critical user flows

- [ ] `[claude]` **Browse all the way down.** Homepage → a country → a region → a site → a photo. Nothing 404s, breadcrumbs are correct at every step.
- [ ] `[you]` **Photo download.** Open any photo, click the download button, confirm the copyright clickthrough appears, accept it, confirm the JPG actually downloads.
- [ ] `[claude]` **Keyword search.** Search for a real keyword (e.g. "Jerusalem"). Results page shows photos AND sections. Click a result, it's the right page.
- [ ] `[you]` **AI search.** From the homepage panel or `/ai-search`, ask "Where can I find photos of the Sea of Galilee?" Confirm the assistant responds with relevant links. (Claude can verify the endpoint responds; only you can judge whether the answer is *good*.)
- [ ] `[you]` **Newsletter signup.** Try the form with a real email. Either confirm it submits successfully, or note it's still broken (it's on the TODO list — don't be surprised if so).
- [ ] `[claude]` **News.** `/news` lists articles in date order; click into one, body and gallery render.
- [ ] `[claude]` **Site of the Week.** Featured section on the homepage links to a real page.

### Old URL redirects

These are inbound links from old books, references, and search engines. Already covered by `qa-smoke.sh`:

- [ ] `[auto]` All redirect cases listed in the smoke section above

### Mobile (use a real phone if possible — desktop dev tools is OK as a fallback)

- [ ] `[both]` **Sticky top nav.** Scroll down a long photo page; the top bar with the hamburger and search icon stays in place. (Claude can verify in Chromium mobile viewport; only you can judge on a real iOS Safari.)
- [ ] `[both]` **Hamburger menu.** Tap the hamburger; drawer opens. Tap outside it; closes. Tap a link; navigates and closes.
- [ ] `[both]` **Lightbox on touch.** Tap a photo; fullscreen overlay opens. Tap outside the image; closes. Tap the X button; closes.
- [ ] `[you]` **No pinch-to-zoom needed.** Body text is comfortably readable without zooming on a 5–6" phone. (Subjective — needs a real device.)
- [ ] `[claude]` **No horizontal scroll.** Page width never exceeds viewport width.

### Accessibility quick pass

- [ ] `[both]` **Keyboard-only nav.** From the homepage, press Tab repeatedly. You should be able to reach every nav link, the search input, and at least the first photo on the page. Focus indicator (an outline) is visible at every step.
- [ ] `[both]` **Lightbox keyboard.** Open a lightbox with Enter/Space on a focused thumbnail. Press Esc; closes. Focus returns to the thumbnail.
- [ ] `[you]` **Screen reader spot-check.** Turn on VoiceOver (Cmd+F5 on Mac). Navigate the homepage. Confirm photo alts are described, not skipped or read as filenames. (Real screen reader, no automation substitute.)
- [ ] `[you]` **Run [axe DevTools](https://www.deque.com/axe/devtools/)** on the homepage and on a photo page. Note any "serious" or "critical" issues for follow-up. (Browser extension, needs your install.)

### Cross-browser

Open the homepage and one photo page in each:

- [ ] `[you]` Safari (Mac)
- [ ] `[you]` Safari (iOS)
- [ ] `[you]` Chrome (desktop)
- [ ] `[you]` Chrome (Android, if you have one)

Note any rendering differences. Photo pages are the most likely place to see issues (lightbox, sticky nav). (Claude's preview is Chromium on macOS — not a substitute.)

### Social sharing previews

- [ ] `[claude]` Fetch homepage HTML and confirm `<meta property="og:image">`, `og:title`, `og:description` are all populated
- [ ] `[claude]` Same for one photo URL — `og:image` should be the photo
- [ ] `[claude]` Same for one section URL — `og:image` should be the section image
- [ ] `[you]` Eyeball the rendered preview on [metatags.io](https://metatags.io) for one of each — confirms the actual social-card render, not just that the tags exist

### Structured data

- [ ] `[claude]` Fetch homepage and one photo/section page, validate JSON-LD via [validator.schema.org's API](https://validator.schema.org/)
- [ ] `[you]` Eyeball the [validator.schema.org](https://validator.schema.org/) UI on one of each — useful for catching formatting issues that the API doesn't flag

### Edge cases

- [ ] `[auto]` **404.** Visit `/browse/this-does-not-exist`. Should be a real "not found", not a stack trace.
- [ ] `[you]` **Print view.** From a photo page, File → Print (or ⌘P). Should show photo + caption + URL, no nav chrome, no Edit link. (Print preview rendering varies by browser; needs your eye.)
- [ ] `[auto]` **Logged-in vs logged-out.** Photo page in incognito has no "Edit" link in the nav. Photo page from a logged-in session has it. (Both can be tested via curl with/without the session cookie.)

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
