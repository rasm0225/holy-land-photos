# Design Brief — HolyLandPhotos.org

## For Claude Design: Design System + Visual Design

---

## 1. Project Overview

**What is it?**
A free photography archive of 7,000+ high-resolution photographs of biblical and archaeological sites across 12 countries. Created and maintained by Dr. Carl Rasmussen, a biblical scholar and photographer who has been documenting these sites for over four decades.

**Who uses it?**
- Biblical scholars and seminary students
- Clergy preparing sermons and presentations
- Educators teaching biblical history/archaeology
- General visitors interested in the Holy Land
- Age skew: older (40-70+), not highly technical

**What's the tone?**
Scholarly but accessible. The photography is stunning and should be the hero. The design should feel like a well-curated museum archive — authoritative, clean, quiet. Not flashy, not trendy. Think: university press, National Geographic archive, or a well-designed academic resource. Overly modern design elements like text over images are unlikely to be accepted.  E.g don't have text reveal when hovering over an image.  It might look cool but is really unusable

**Current state:**
All pages are built and functional but **completely unstyled** — using inline styles and system fonts. The site works well but looks like a developer prototype. We need a design system and visual treatment to make it feel polished and professional.

---

## 2. Design System Needs

### Colors
- The site currently has no intentional color palette
- The mockups (in `mockups/style.css`) had a warm, earthy palette that was well-received:
  - Background: warm off-white (#F9F7F4)
  - Text: dark brown (#2C2C2C)
  - Accent: burnt orange (#B85C2C)
  - Links: deep brown (#7A3B18)
  - Nav background: dark brown (#2C2416)
- HOWEVER - it has been unsettled for a while and the Client Dr. Carl Rasmussen likes the plain look.  It has more of a Wikipedia vibe where you are there to explore the content, look at the photos and read the text.  A visitor is not there to admire the design of the website.  They are likely a middle age to elderly English speaking person with an interest in archeological sites referenced in the Bible.

### Typography
- Serif for body text (scholarly feel) — the mockups used Georgia
- Sans-serif for UI elements, navigation, labels
- Base font size should be generous (17-18px) — the audience includes older users
- Max line length ~70-75 characters for readability

### Key Components Needed
- **Navigation bar** — site name, Search, AI Search, Admin links. Needs a mobile hamburger.
- **Breadcrumb trail** — hierarchical path on section pages (e.g., Home / Browse by Countries / Turkey / Western Turkey / Ephesus)
- **Photo card/thumbnail** — used in grids on browse pages, search results, keywords pages
- **Photo page layout** — two-column: image left (with lightbox + download button), description right
- **Section page layout** — two-column: lead image left (with lightbox), body text right. Photo grid below.
- **Lightbox overlay** — fullscreen photo view on dark background
- **Download button + copyright modal** — button near photo, modal with agreement
- **Search input** — used on /search and /ai-search
- **Chat interface** — AI search conversation (user bubbles, assistant responses with markdown)
- **News carousel** — image slideshow with prev/next arrows, caption, counter
- **Form inputs** — newsletter signup (email, first name, last name, submit)
- **Footer** — copyright, links to About, Permission to Use, Blog, Feedback
- **Sidebar** (browse pages on old site had a left nav sidebar — this is a design decision: do we keep it or use breadcrumbs-only?)

### Accessibility Requirements
- WCAG 2.1 AA compliance
- All text must meet 4.5:1 contrast ratio (normal text) or 3:1 (large text)
- Visible focus indicators on all interactive elements
- Keyboard navigable (lightbox traps focus, Escape closes)
- Skip-to-main-content link
- Prefers-reduced-motion respected for any animations
- See CLAUDE.md for detailed accessibility notes and a contrast audit of the mockup palette

---

## 3. Page Inventory

Every page that needs design treatment:

### Homepage (`/`)
**Layout:** Two-column top section
- Left: Browse links (5 top-level categories + Complete Site List + Search)
- Right: Pages links (About, How to Use, Permission to Use, etc.)

Below that:
- Active news items with photo carousel + body text (two-column)
- Site of the Week with lead image + body text (two-column)

### Browse/Section Pages (`/browse/[slug]`)
**Layout:** Two-column header (lead image + body text), then full-width content
- Breadcrumb trail at top
- Section title + type badge (site/region/country/artifact)
- Lead image (clickable lightbox) + body text side by side
- Child sections list (if any)
- Photo thumbnail grid
- Keywords

**Note:** There are ~730 sections. Some have 2 photos, some have 40+. Some have long descriptions, some have none. The layout needs to handle all cases gracefully.

### Photo Pages (`/photos/[imageId]`)
**Layout:** Two-column
- Left: Photo (clickable lightbox) + Download button below
- Right: Description (rich text with inline links, italic terms, etc.)
- Below: "Found in" section links + keyword tags
- Top: prev/next navigation with section context and photo counter (e.g., "3 of 14")

**Important:** Photo descriptions are scholarly HTML with `<em>` for terms, inline links to other photos, `<strong>` for emphasis. The typography needs to handle these well.

### Search (`/search`)
- Search input with "Searching..." state
- Results split into "Sites & Sections" and "Photos"
- Photo results in a thumbnail grid
- Section results as a list with type badges
- Duration shown (e.g., "12 results for 'Assos' (0.3s)")

### AI Search (`/ai-search`)
- Description text + Claude AI disclaimer
- Chat interface: user messages (blue tint), assistant messages (white)
- Assistant messages contain markdown: headers, bold, links, lists
- "Searching..." indicator while waiting
- Duration shown per response
- Soft usage counter message after 100 searches

### News (`/news`, `/news/[id]`)
- Index: list of news items with thumbnail, title, date
- Detail: image gallery grid + YouTube embed (optional) + body text
- Only active news shown on index

### Site of the Week (`/site-of-the-week`)
- List with thumbnail, section title, date

### Static Pages (`/pages/[slug]`)
- Simple: breadcrumb, title, rich text body
- Some have inline images (maps, photos)

### Newsletter (`/newsletter`)
- Signup form: email (required), first name, last name
- Success/error states
- MailChimp integration

### Other Pages
- `/site-list` — full hierarchical list of all 730 sections
- `/keywords/[keyword]` — photos and sections matching a keyword
- `/recent-additions` — placeholder, coming soon

---

## 4. Responsive Breakpoints

Current breakpoint is 680px (single column below, two column above). This should be reviewed:
- **Mobile** (~375px): single column, hamburger nav, stacked layouts
- **Tablet** (~768px): could do two columns for some layouts
- **Desktop** (~1024px+): full two-column layouts, max content width ~1000-1200px

---

## 5. Print Stylesheet

Scholars and teachers print these pages. A print view should produce:
- Full-width image
- Caption/description
- Attribution and URL
- No navigation chrome

---

## 6. Existing Design Assets

- **Mockups:** `mockups/` directory has static HTML mockups with `style.css` — these were an earlier design pass that was generally approved but never implemented
- **CLAUDE.md:** Contains detailed design notes including:
  - Contrast ratio audit of the mockup palette
  - Accessibility requirements
  - Section intro layout conventions
  - Story page layout conventions
  - Photo comment HTML rendering rules
  - Footer pattern

---

## 7. Things to Preserve

- The photography must be the hero — large, high-quality, never cropped (object-fit: contain)
- Scholarly feel — serif body text, muted colors, no gimmicks
- Simplicity — the audience is not tech-savvy
- All existing functionality — lightbox, download, search, AI search, breadcrumbs, prev/next
- Mobile-first responsive design

---

## 8. Technical Constraints

- **Framework:** Next.js 15 + React 19
- **Current styling:** All inline styles (no CSS framework, no Tailwind, no CSS modules)
- **Preferred approach:** A single CSS file (like the mockups used) or CSS modules — keep it simple
- **No JavaScript frameworks for styling** — no styled-components, emotion, etc.
- **Images:** Served from AWS S3, optimized by Next.js Image component with sharp
- **Fonts:** Currently system fonts. Could add 1-2 web fonts via Google Fonts or self-hosted if the design calls for it.
