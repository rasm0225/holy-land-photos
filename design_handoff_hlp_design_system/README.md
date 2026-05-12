# Handoff: HolyLandPhotos · Design System & Hero Pages

## Overview

This package documents the **visual design** for HolyLandPhotos.org — a free archive of 7,000+ photographs of biblical and archaeological sites maintained by Dr. Carl Rasmussen. The brief called for a scholarly, museum-like archive (Wikipedia-leaning) that lets the photography do the work; this design delivers that with minimal chrome, classic serif body, blue links, and hairline rules.

It covers:
- A design system (colors, type, spacing, components)
- 4 desktop hero pages (Home, Section, Photo, Search)
- 4 mobile hero pages (same set at 390 px width)
- A live AI search section embedded on the homepage
- Favicon

---

## About the design files

The files in `source/` are **design references prototyped in HTML/JSX inside a Babel + React 18 sandbox** — they show intended layout, copy, spacing, type, and interaction. They are *not* production code to ship as-is.

**Your job is to recreate these designs in the existing HolyLandPhotos codebase** (Next.js 15 + React 19, per the brief), using its established patterns:
- A single `styles/design.css` (the brief: "A single CSS file… or CSS modules — keep it simple")
- Plain React components — no styled-components, emotion, etc.
- Next.js `<Image>` for photos with `sharp` optimization (already in place)
- System fonts only — Georgia + system sans, no Google Fonts loaded

The prototype source uses one JSX file per direction with CSS injected inline via `<style>` tags. **Treat the CSS in those files as authoritative** — copy it into your global stylesheet near-verbatim. Treat the JSX structure as the markup reference — port it into your component tree using your Next.js layout conventions.

---

## Fidelity

**High-fidelity.** Pixel-perfect mockups with final colors, typography, spacing, and inline styles. The developer should match these closely.

That said, this round covers **the 4 hero pages** (Home, Section, Photo, Search). The brief lists more pages that are *not yet designed*: AI Search (full page), News index/detail, Site of the Week list, static pages, Newsletter, Keywords, Site List, Recent Additions, Print stylesheet, lightbox overlay, download/copyright modal. These should be implemented by **applying the design system tokens and component patterns documented below** — not by waiting for individual mocks.

---

## How to run the prototype

```sh
cd source/
python3 -m http.server 8080
# open http://localhost:8080/screens.html — flat view of all hero pages
# open http://localhost:8080/index.html  — the design canvas (zoomable, side-by-side)
```

No build step. Babel runs in the browser.

---

## Files in this package

```
README.md                      ← this file
source/
  index.html                   ← design canvas (pan/zoom, all artboards)
  screens.html                 ← flat runnable view of all hero pages
  app.jsx                      ← canvas mount
  plain.jsx                    ← desktop CSS + components (Home, Section, Photo, Search)
  mobile.jsx                   ← mobile (390 px) CSS + components
  ai-chat.jsx                  ← AI Search section (live, wired to Claude)
  shared.jsx                   ← Icon and Paragraphs/Runs helpers
  content.jsx                  ← real sample content from hlp.everyphere.com
  design-canvas.jsx            ← canvas scaffold (don't port — design-time only)
  ios-frame.jsx                ← iPhone frame (don't port — preview only)
assets/
  favicon-h.svg                ← the favicon
```

You only need to port `plain.jsx`, `mobile.jsx`, `ai-chat.jsx`, and the favicon into the real site.

---

## 1 · Design tokens

All tokens are scoped under `.pln-doc` (desktop) and `.mpln` (mobile) in the prototype. Port them into a single `:root` block in `styles/design.css`.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#ffffff` | Page background |
| `--bg-alt` | `#f7f6f3` | Subtle alternate surface (hints, footers, image placeholders) |
| `--ink` | `#1c1c1c` | Body text, primary buttons |
| `--ink-muted` | `#555555` | Secondary text |
| `--ink-faint` | `#7a7a7a` | Captions, eyebrows, meta |
| `--line` | `#e3e1dc` | Hairline borders, dividers |
| `--line-strong` | `#c9c6bf` | Stronger borders (input chrome, separators in dotted lists) |
| `--link` | `#0b50a0` | Body links |
| `--link-visited` | `#5c2b8f` | Visited links (optional) |
| `--accent` | `#8a3a18` | Reserved (used in sidebar variant — not currently shown) |

**User-message tint** (AI chat bubble): background `#eaf0f9`, border `#c8d6ea`.

### Typography

| Token | Value |
|---|---|
| `--serif` | `Georgia, "Times New Roman", serif` |
| `--sans` | `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif` |
| `--fs-body` | `17.5px` desktop, `17px` mobile |
| Body line-height | `1.6` desktop, `1.55` mobile |

**Rules:**
- Body, headings, lead paragraphs → serif (Georgia)
- Nav, breadcrumbs, badges, captions, buttons, badges, eyebrows, meta → sans (system)
- Italics for figcaptions and the homepage intro line
- Small-caps eyebrows: 11–12 px, letter-spacing `0.14em`–`0.18em`, `text-transform: uppercase`, color `var(--ink-faint)`

**Type scale** (rounded to nearest 0.5 px):

| Use | Desktop | Mobile |
|---|---|---|
| H1 (page title) | 36 px | 28 px |
| H1 (photo page) | 30 px | 28 px |
| H2 (section header w/ rule) | 21 px | 19 px |
| H3 | 17 px | 17 px |
| Lead paragraph | 19 px | 18 px |
| Body | 17.5 px | 17 px |
| Captions / meta | 13–13.5 px | 13 px |
| Eyebrow (UPPERCASE) | 11–12 px | 11 px |

H1 letter-spacing: `-0.012em`. H1 line-height: `1.15`.
Lead line-height: `1.55`.
Body line-height: `1.6`.

### Spacing scale (px)

`4 · 8 · 12 · 14 · 16 · 18 · 22 · 24 · 28 · 32 · 40 · 44 · 56`

Desktop main container padding: `32 px`. Mobile main padding: `22 px 18 px 32 px`.

### Borders / radii

- All borders **1 px solid**. No thick strokes anywhere.
- Border radius is **mostly 0** — this is the "Wikipedia plain" direction. The only exceptions are: 3 px radius on the AI input/badge/buttons and 50% on the AI loading-pulse dot.
- No shadows. No glass effects. No gradients.

### Animation

- AI loading dot: `pln-ai-pulse` keyframes, 1.1 s, alternating 0.3 → 1.0 opacity.
- Nothing else animates.
- Respect `prefers-reduced-motion` — disable the loading pulse if set.

---

## 2 · Global chrome

### Desktop nav (`.pln-nav`)

```
┌──────────────────────────────────────────────────────────────────┐
│ HolyLandPhotos.org           Search  AI Search  About  Permission│
│ BIBLICAL & ARCHAEOLOGICAL ARCHIVE                                │
└──────────────────────────────────────────────────────────────────┘
```

- Max width `1120 px`, padding `18 px 32 px`, bottom border `1 px solid var(--line)`.
- Brand: two-line block, no link underline. Top line "HolyLandPhotos.org" in serif 20 px / 600. Sub-line "BIBLICAL & ARCHAEOLOGICAL ARCHIVE" in sans 11.5 px, `letter-spacing: 0.06em`, `text-transform: uppercase`, color `--ink-faint`.
- Nav links: sans 14.5 px / 500, color `--ink`. Hover: underline, 1 px, offset 2 px.
- **No search-pill on desktop.** The "Search" nav link is the only search affordance in the chrome.

### Mobile nav (`.mpln-topnav`)

```
┌──────────────────────────────┐
│ ☰   HolyLandPhotos        🔍 │
└──────────────────────────────┘
```

- 44 × 44 px hit targets on both buttons (icon centered).
- Burger and search icons (1.75 px stroke). Brand centered.
- Bottom border `1 px solid var(--line)`.
- The hamburger drawer is **not designed yet** — match iOS / Android system sheet patterns when implementing.

### Footer

Both desktop and mobile: hairline top border, sans 13 px (12.5 mobile), `--ink-muted`. Order: copyright (`mr-auto` flex spacer), About, Permission to Use, News, Feedback. Mobile: copyright on its own row, links wrap below.

---

## 3 · Screens

### 3.1 Homepage

**Order of sections, top → bottom:**

1. **Intro paragraph** — single italicized serif sentence, max-width `62ch`, `--ink-muted`. Tells the visitor what the archive is. No H1 (the nav brand is enough).
2. **Browse + Pages columns** — 2-col grid, gap `56 px`, top + bottom hairline borders. Each column has a sans-uppercase-eyebrow H2 (12 px, `0.14em` tracking) and a list (`<ul>` no markers, dotted bottom borders between items, 6 px vertical padding).
3. **Holy Week and Easter feature** — 2-col grid 1.2 : 1. Left: H2 (linking the news item) + carousel (single image with caption + prev/next arrow buttons). Right: body paragraphs + `.pln-hint` callout (left-rule, alt-tint background).
4. **Ask the archive** (AI Search) — see § 4.
5. **Site of the Week** — H2 with bottom hairline, then 2-col `1fr 1fr` with photo left and title-link + body right.

**Mobile:** all sections stack to single column, in the same order. The carousel and Site of the Week photo become full-bleed (escape main padding via `margin: 0 -18px`).

### 3.2 Section / Browse page (`/browse/[slug]`)

**Example: `/browse/haran`.**

1. **Breadcrumbs** — sans 13.5 px, ` › ` separators in `--line-strong`, current page in `--ink` 500.
2. **H1 + type badge** — serif 36 px, badge below (sans uppercase, hairline border, 3 px padding, 11 px font). Badge values: `site`, `region`, `country`, `artifact`.
3. **Two-column 5:7 grid (gap 40 px):**
   - Left: lead figure (clickable lightbox) with sans figcaption underneath.
   - Right: body text. First paragraph styled `.pln-lead` (19 px). Subsequent paragraphs `.pln-p` (17.5 px). Inline `<em>`, `<strong>`, `<a>` per the prototype.
4. **Photos heading** — `.pln-h2` "Photos (n)" with `--line` bottom border.
5. **Photo grid** — 5-column on desktop, 2-column on mobile. Each thumbnail: `<a>` containing `<img>` (aspect 4:3, `object-fit: cover`, 1 px border, `--bg-alt` placeholder background) + sans caption underneath (13 px desktop, 13.5 mobile). Gap 18 px desktop, 14 mobile.
6. **Keywords** — top hairline rule, "Keywords:" label in serif 600, then ` · ` separated links to `/keywords/<encoded>`.

**Empty / lightly-populated sections:** the layout must degrade gracefully. The brief notes ~730 sections range from 2 to 40+ photos. Render the grid even with 2 photos (don't collapse to a different layout); render body even if empty (skip the lead-paragraph styling if there's nothing to lead).

### 3.3 Photo page (`/photos/[imageId]`)

1. **"← Parent section" link** — sans 13 px.
2. **Prev / N of M / Next bar** — flex row, top + bottom hairlines.
3. **Two-column grid (gap 44 px), ~1.05 : 1:**
   - Left: photo (1 px border, click → lightbox) + meta line (sans uppercase 12.5 px: "ID: ICSHMD10 · © Carl Rasmussen") + Download Photo button.
   - Right: H1 (30 px, smaller than section page), `photo` badge, then the description as rich text (inline `<a>`, `<em>`, `<strong>` per the API), then "Found in" eyebrow + list, then keywords.
4. **Download button** style: 1 px ink border, white fill, ink text, sans 14/500, padding 9×14, square corners. Hover: invert (black fill, white text). Always renders the download icon to the left of the label.
5. **Description spec from brief:** "Photo descriptions are scholarly HTML with `<em>` for terms, inline links to other photos, `<strong>` for emphasis." All three render correctly with the prototype's typography.

**Mobile photo page** stacks single-column: prev/next bar → title/badge → full-bleed photo → meta → download button → description → found-in → keywords.

### 3.4 Search results (`/search`)

1. **H1** "Search" (28 px).
2. **Search box** — `display: flex` row with 1 px ink border (no radius), serif input 19 px, ink-filled button on the right with white text "Search".
3. **Result count + duration** — sans 13.5 px, `--ink-muted`. Format: `23 results for "haran" · 0.28s` (italicized query).
4. **"Sites & Sections" eyebrow row** with bottom hairline. Each result: `display: flex` with type badge (70 px fixed) + title H3 (serif 19/600) + path sub-line (sans 13.5 px, `--ink-muted`). Bottom hairline between rows.
5. **"Photos" eyebrow row** — same eyebrow treatment.
6. **Photo result grid** — same as the section-page grid (5-col / 2-col), but each thumbnail caption gets a sub-line showing the parent section name in `--ink-faint`.

The brief notes a "Searching…" loading state — render an italic "Searching…" line in the result-count slot during fetch. The 100-search soft limit message is not designed; render it as a `.pln-hint` block above the search box when triggered.

---

## 4 · AI Search section (homepage embed) · `ai-chat.jsx`

This is the **interactive** part of the homepage. It's a self-contained section anyone can use without navigating away.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Ask the archive                                             │  ← .pln-h2 with rule
│  Have a question about a site, a Bible passage, or where    │
│  to find a photo? Ask in plain English. Powered by Claude   │
│  AI; verify with primary sources.                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [ Ask anything about biblical sites…    ] [ Ask ]      │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ TRY ASKING [ Where did Abraham settle? ]               │ │
│  │            [ What is a Rolling Stone Tomb? ]           │ │
│  │            [ Roman ruins in Turkey ]                   │ │
│  │            [ Photos for a sermon on the resurrection ] │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Open the full AI Search page →                        │ │ ← --bg-alt strip
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

When messages exist, the chip row hides and a thread (`max-height: 460 px`, scrolls) replaces it.

### Component states

| State | What renders |
|---|---|
| **Empty** | Chip row with 4 suggested questions. |
| **Sending** | Input disabled (`--ink-faint` text). Button label: "Thinking…", disabled. |
| **Loading reply** | New entry in thread: tag "Holy Land Photos · AI" + italic "Searching the archive…" with a 6 px pulsing dot. |
| **Error** | Renders an error-marked assistant message: "Sorry — couldn't reach the AI right now. Please try again, or [open the full AI Search page](/ai-search)." |
| **With thread** | Each turn rendered; latest message scrolled into view. |

### Message rendering

- **User**: right-aligned bubble. Background `#eaf0f9`, border `#c8d6ea`. Serif text 16.5 px. `max-width: 78%`.
- **Assistant**: full-width with `Holy Land Photos · AI` eyebrow above. Renders markdown:
  - `**bold**` → `<strong>`
  - `*italic*` → `<em>`
  - `[label](/href)` → `<a>` (color `--link`)
  - `* item` lines → `<ul>` with 22 px left padding
  - `1. item` lines → `<ol>`
  - `## h` → `<h3>` (serif 18 px)
  - `### h` → `<h4>` (serif 16 px)
  - `\`code\`` → mono inline code on `--bg-alt`
- After each assistant message, a `.pln-ai-foot` sans 12.5 px line: `— answered in 1.4s`.

### Behavior

- Submit on Enter or "Ask" button click.
- Click a chip → immediately call `ask(question)`. Chips hide after first message.
- Thread auto-scrolls to bottom on new message.
- "Open the full AI Search page →" link is always present at the bottom of the panel (even in empty state). Routes to `/ai-search`.

### API call

The prototype uses `window.claude.complete({ system, messages })` (a sandbox helper). In the real Next.js app, **replace this with an API route** (e.g. `app/api/ai-search/route.ts`) that calls the Anthropic API server-side with the API key in env. The client should POST `{messages}` and get back `{content}` plus optionally a duration.

System prompt (current):

> You are a scholarly assistant for HolyLandPhotos.org, a free archive of 7,000+ photographs of biblical and archaeological sites curated by Dr. Carl Rasmussen. Answer concisely — 3-5 sentences, with a short bulleted list when it helps. Plain language; avoid emoji. When relevant, recommend specific sites or photos by linking like [Haran](/browse/haran), [Rolling Stone Tomb](/photos/ICSHMD20), [Ephesus](/browse/ephesus). Make up reasonable slugs from the site/place name. Never invent specific photo IDs (those start with letters and a number); only link to /browse/<slug>. If the user asks something outside biblical archaeology, gently steer them back to the archive's subject matter.

Tune as needed. Recommended model: Claude Haiku (cheap, fast, plenty smart for this) with `max_tokens` ~1024.

---

## 5 · Components · the design system pieces

Build these as reusable React components in the real codebase:

| Component | Notes |
|---|---|
| `<NavBar />` | Desktop + mobile responsive. No props — site-wide. |
| `<Footer />` | Same. |
| `<Breadcrumbs items={[{label, href}]} />` | Last item is current page (no href). |
| `<TypeBadge>{type}</TypeBadge>` | Renders a `site` / `region` / `country` / `artifact` / `photo` badge. |
| `<Eyebrow>{children}</Eyebrow>` | Sans uppercase 11–12 px helper used across the site. |
| `<PhotoThumb id title section? sectionSlug? />` | Image + caption (+ optional section sub-line for search results). Uses Next.js `<Image>`. |
| `<PhotoGrid>{children}</PhotoGrid>` | 5-col desktop / 2-col mobile container. |
| `<LeadFigure src alt caption />` | The clickable hero figure on section pages. Triggers lightbox. |
| `<DownloadButton onClick />` | The black-outlined photo download CTA. Triggers the copyright modal. |
| `<PrevNextBar prev next index total />` | Top of photo pages. |
| `<KeywordList keywords />` | The ` · ` separated link list. |
| `<Hint><strong>{title}</strong>{body}</Hint>` | The left-rule callout (Sunday Service Hint, etc.). |
| `<AskTheArchive />` | The AI section. Self-contained — drop in anywhere. |
| `<Lightbox />` | Not designed yet — see § 7. |
| `<DownloadModal />` | Not designed yet — see § 7. |

---

## 6 · Responsive breakpoints

The prototype uses a single breakpoint at **768 px**. Below 768: mobile rules. Above: desktop rules. The brief says: 375 / 768 / 1024+ — I went with 390 (iPhone 14) for the mobile mocks because 375 is now uncommon. Either width renders the design correctly.

| Width | Behavior |
|---|---|
| `< 768 px` | Single column everywhere. Hamburger nav. 2-up photo grid. Body padding 18 px. |
| `≥ 768 px` | Desktop layouts kick in. Max content width 1120 px, centered. |

No intermediate "tablet" treatment — the desktop layout works down to 768 px.

---

## 7 · Not yet designed (next round)

These were called out in the brief but not designed this round. Implement them by extending the existing tokens and component patterns:

- **Lightbox overlay** — fullscreen black background, image centered with `object-fit: contain`, ESC + click-outside close, prev/next chevrons, focus trap, restore focus on close.
- **Download / copyright modal** — modal over dimmed body, brief copyright agreement text, "I agree, download" primary button, "Cancel" secondary. Match the search-box treatment for buttons.
- **Full `/ai-search` page** — same chat experience but page-height, full-width thread, with conversation history persisted (URL-based or local storage).
- **News index + detail** — index is a list of cards (thumbnail + title + date). Detail page is a section-page layout + YouTube embed allowance.
- **Newsletter signup form** — email (required), first + last name. Use the `.pln-searchbox` chrome for the email input. Success state: replace form with a confirmation card. Error: inline `--ink` on red text below input.
- **Static pages** (`/pages/[slug]`) — section-page chrome with breadcrumb + H1, then rich-text body. No grid. May contain inline `<img>` for maps.
- **Site list (`/site-list`)** — the full 730-section hierarchy. Render as nested `<ul>` with collapse/expand at the top level. Sans typography, dense.
- **Keywords pages (`/keywords/[keyword]`)** — same chrome as search results, no search box.
- **Print stylesheet** — see § 8.

---

## 8 · Print stylesheet

Required by the brief. From `@media print`:

- Hide nav, footer, breadcrumbs, prev/next bar, download button, keywords, "Found in" lists, AI section.
- Force photo to print at full page width (`width: 100%; max-width: none`), `object-fit: contain`, `page-break-inside: avoid`.
- Print the photo title (H1, smaller — 22 pt), the description body, and a footer line: `Source: holylandphotos.org/photos/<id> · © Carl Rasmussen`.
- Black on white, no background colors. Serif body, 12 pt minimum.
- Section pages: print breadcrumb as plain text path, then H1, then body. Skip the photo grid.

---

## 9 · Accessibility (from brief)

- WCAG 2.1 AA. All text ≥ 4.5:1 contrast against its background (the palette in § 1 satisfies this).
- Visible focus ring on every interactive element. The prototype doesn't override `:focus-visible` — let the browser default fire, or use a 3 px `--link` outline with 2 px offset.
- Keyboard navigable. Lightbox traps focus; ESC closes.
- Skip-to-main-content link (visually hidden until focused).
- Respect `prefers-reduced-motion` — disable the AI loading pulse and any future transitions.

---

## 10 · Content samples used

All copy in the prototypes is real, scraped from `hlp.everyphere.com`:

- Homepage carousel: "Holy Week and Easter — Click on Image for More Photos"
- Site of the Week: Haran
- Section page sample: `/browse/haran` — full body, breadcrumbs, 18-photo grid, 11 keywords
- Photo page sample: `/photos/ICSHMD10` — Tomb and Courtyard 2 (Midras Rolling Stone Tomb)
- Search query: "haran"

Image URLs come straight from the S3 bucket: `https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com/<id>.jpg`. The prototype hot-links these; the production Next.js `<Image>` component should proxy them through the optimizer as it already does.

**One note:** the section-page lead image in the live site at `/section/HaranMap23.jpg` 404s on S3. The prototype falls back to `TEETHN06`. Investigate whether `section/` images exist for other sites or whether the lead-image strategy needs to change.

---

## 11 · Implementation checklist

1. Add `styles/design.css` with all `--*` tokens from § 1 in `:root`.
2. Port the CSS rules from `plain.jsx` (everything inside `PLAIN_CSS`) and `mobile.jsx` (`MPLAIN_CSS`) into `design.css`. Strip the `.pln-doc` / `.mpln` scoping — they were prototype isolation, not needed in production.
3. Update `app/layout.tsx`: drop the giant H1, add `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` pointing to `assets/favicon-h.svg`.
4. Build the components in § 5 as React components under `components/`.
5. Wire pages in `app/`:
   - `/` (Home) — see § 3.1
   - `/browse/[slug]` — see § 3.2
   - `/photos/[imageId]` — see § 3.3
   - `/search` — see § 3.4
6. Build the AI route — see § 4. Server-side Anthropic call, client-side `<AskTheArchive />` component embedded on the home page.
7. Add `@media print` rules — see § 8.
8. QA: focus rings, keyboard nav, contrast, print preview.

---

## Questions

Anything ambiguous, ask back. The fastest reference is opening `source/index.html` in a browser and panning around the canvas — every artboard is the real CSS and markup.
