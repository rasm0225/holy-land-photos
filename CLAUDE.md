# HolyLandPhotos.org — Instructions for Claude Code

This file is read automatically by Claude Code at the start of every session.
It captures design decisions, preferences, and constraints for the rebuild.

---

## Project Summary
A full rebuild of holylandphotos.org — a photography and Holy Land scholarship website.
- **Owner:** Dr. Carl Rasmussen (photographer, biblical scholar)
- **Supervisor:** Peter (doing QA and approvals)
- **Builder:** Claude Code

The goal is a modern, maintainable site that looks and functions like the original,
with a simple CMS so non-developers can manage content going forward.

---

## Guiding Principles
- **Preserve everything** — no content, photos, or features should be lost in the migration
- **Keep it simple** — this site serves scholars and general visitors, not tech-savvy users
- **Content-first** — the photography and writing are the product; the tech serves them
- **Low maintenance** — the new owner/maintainer should be able to keep it running without a developer for routine updates

---

## Proposed Stack (to be confirmed after code audit)
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (React) | Modern, well-supported, good for image-heavy sites |
| Hosting | TBD (Vercel or Azure Static Web Apps) | Decide after audit |
| Assets | Keep existing S3 + CloudFront | No migration needed |
| CMS | TBD | Depends on complexity of current admin interface |
| Email | MailChimp | Re-integrate existing account |
| Payments | PayPal | Re-integrate existing account |
| Analytics | GA4 + Google Tag Manager | Re-integrate existing accounts |

---

## Design Direction

### Responsive Layout
Build mobile-first. The current site requires pinch-to-zoom on phones — the new site must be fully responsive at all breakpoints with no horizontal scrolling or zooming required.

### Typography
Increase base font size and constrain line length (max ~70–75 characters). The current site has small text and full-width text blocks that are hard to read, especially on large screens.

### Photo Downloads — Simplify to Single Size
The current site offers multiple download sizes, a pattern from an era when file sizes mattered. The new site should offer only the largest/highest-quality version. Storage and bandwidth are no longer a constraint.

### Copyright Clickthrough on Download
The existing clickthrough agreement (user acknowledges copyright before downloading a photo) should be preserved in the new build. Confirm exact wording with Dr. Rasmussen before implementing.

### Social Sharing
- Add modern share options (at minimum: copy link, share to X/Twitter, Facebook, email)
- Implement full Open Graph and Twitter Card meta tags on every page so shared links render with a proper image, title, and description
- Individual site/photo pages are the highest priority for this

### Structured Data (Schema.org)
Implement Schema.org markup throughout — not currently present. Priority types:
- `ImageObject` for photos (with creator, license, and geographic subject)
- `Place` for archaeological sites
- `BreadcrumbList` for navigation hierarchy
- `WebSite` + `SearchAction` for the homepage

This improves SEO and makes content discoverable by Google Image Search, knowledge panels, and AI training datasets.

### Print View
A print stylesheet is worth keeping — scholars and teachers print these pages. The current print view is poor. New implementation should produce clean, readable output: full-width image, caption, site description, attribution, and URL. No navigation chrome.

### Photo Comments — Preserve HTML Formatting
Photo comments are stored as HTML in the database (not plain text). They contain inline formatting such as `<em>` for scholarly terms (e.g. *Cryptoporticus*), inline links to related photos, and other markup. Always render comment fields as HTML — never escape them as plain text.

### Section Intro Layout (confirmed pattern)
Browse pages that have a section image (map or representative photo) use a two-column layout:
- Image on the left, constrained with `max-height: 420px` and `object-fit: contain`
- Descriptive text wrapping to the right
- Stacks vertically on mobile (breakpoint: 680px)
This is implemented via `.section-intro`, `.section-image`, and `.section-desc` in `style.css`.

### Accessibility (WCAG 2.1 AA)
Build to WCAG 2.1 Level AA throughout. This is both good practice and particularly important given:
- The audience includes older users (scholars, clergy, educators)
- Educational and institutional users may have procurement requirements

Key areas to get right for this site specifically:

**Images**
- Every `<img>` must have a meaningful `alt` attribute — never empty on content images
- Photo comments often reference what's in the image; the alt text should summarize the subject (e.g. `alt="View north across the agora of ancient Smyrna, with the western portico visible on the left"`)
- Decorative images (UI chrome, spacers) use `alt=""`

**Color & Contrast**
- Body text must meet 4.5:1 contrast ratio against background (AA)
- Large text (18px+ or 14px+ bold) must meet 3:1
- The dark photo-essay style (#0D0B08 background) needs careful checking — light text on dark is fine but muted/grey text often fails
- Never use color alone to convey information (e.g. active nav state must have more than just a color change)

**Keyboard & Focus**
- All interactive elements (nav, lightbox, download, share, thumbnails) must be reachable and operable by keyboard
- Lightbox must trap focus while open and return focus to the trigger element on close
- Visible focus indicators required — do not suppress `outline` without a replacement style
- Skip-to-main-content link at the top of every page

**Screen Readers**
- Lightbox uses `role="dialog"`, `aria-modal="true"`, `aria-label`
- Photo navigation (1 of 14) must be announced: `aria-live` or proper button labeling
- Hamburger nav toggle: `aria-expanded` state must update on open/close
- Breadcrumb nav: `<nav aria-label="Breadcrumb">` with `aria-current="page"` on last item

**Motion**
- Parallax and scroll animations must respect `prefers-reduced-motion`
- Wrap all `transform`/`transition` scroll effects in a media query check:
  ```css
  @media (prefers-reduced-motion: reduce) { ... }
  ```
- The photo essay page is the highest-risk area for this

**Forms**
- Search input and MailChimp signup must have visible `<label>` elements (not just placeholder text)
- Error messages must be programmatically associated with their fields

**Tools to use during QA:**
- **axe DevTools** (browser extension) — catches ~57% of WCAG issues automatically
- **NVDA** (Windows) or **VoiceOver** (Mac) — manual screen reader testing
- **Chrome DevTools Lighthouse** — accessibility audit score target: 90+
- **WebAIM Contrast Checker** — for any custom color combinations

### Contrast Ratio Audit — Current Mockup Palette

Calculated against WCAG 2.1 AA thresholds (normal text ≥ 4.5:1, large text ≥ 3.0:1).
"Large text" = 18px+ regular or 14px+ bold.

| Combination | Ratio | AA Normal | AA Large |
|---|---|---|---|
| `--text` (#2C2C2C) on `--bg` (#F9F7F4) | 13.1:1 | ✅ | ✅ |
| `--text-muted` (#6B6156) on `--bg` | 5.7:1 | ✅ | ✅ |
| `--text-light` (#9C8E84) on `--bg` | 3.0:1 | ❌ FAIL | ✅ barely |
| `--text-light` (#9C8E84) on `--bg-sidebar` (#F2EDE8) | 2.7:1 | ❌ FAIL | ❌ FAIL |
| `--accent` (#B85C2C) on `--bg` | 4.3:1 | ❌ FAIL | ✅ |
| `--link` (#7A3B18) on `--bg` | 8.0:1 | ✅ | ✅ |
| white on `--accent` | 4.6:1 | ✅ | ✅ |
| white on `--nav-bg` (#2C2416) | 15.3:1 | ✅ | ✅ |
| Dark page `--text` (#EDE8E1) on dark `--bg` (#0D0B08) | 16.1:1 | ✅ | ✅ |
| Dark page muted text (~#8A8178) on dark `--bg` | 5.1:1 | ✅ | ✅ |

**Issues to fix before production:**

1. **`--text-light` (#9C8E84) — FAILS** in both contexts.
   Currently used for: breadcrumb separators, sidebar section labels, pagination disabled state, keywords labels.
   Fix: darken to approximately `#706560` (estimated ~4.5:1 on `--bg`). Alternatively, restrict
   `--text-light` to purely decorative/non-text elements and use `--text-muted` for any readable label.

2. **`--accent` (#B85C2C) on `--bg` — 4.3:1, borderline FAIL for normal text.**
   Currently used for: page titles (large → ✅ fine), breadcrumb current item (small → ❌),
   sidebar label borders, and `.site-wordmark h1`.
   Fix: darken slightly to approximately `#A34F24` to clear 4.5:1, OR restrict accent to
   large text only and use `--link` (#7A3B18, 8.0:1) for small accent-colored text.

3. **Note on the dark photo essay page:** all tested combinations pass, but the very faint
   overlay text (`.carousel-count`, chapter numbers at low opacity) should be re-checked
   once final opacity values are set — anything below ~40% opacity on the dark background
   will likely fail.

### Open Questions — Design
- [ ] Does Dr. Rasmussen want a visual refresh or a faithful recreation of the current aesthetic?
- [ ] Color palette and typography preferences?
- [ ] Should the site support dark mode?

### Open Questions — Accessibility
- [ ] **Institutional users:** Are there universities, seminaries, or church organizations using
  the site who may have formal accessibility procurement requirements? If so, the target may
  need to be WCAG 2.1 AA with a documented conformance statement, not just best-effort.
- [ ] **Alt text strategy for 7,022 photos:** Three options — decide before build starts:
  1. **Auto-generate from first sentence of comments** — most faithful to Dr. Rasmussen's
     voice, requires no extra work, covers ~95% of cases well
  2. **Auto-generate from keywords** — simpler fallback, less descriptive
  3. **Dedicated alt text field in CMS** — correct long-term answer but significant data
     entry effort for existing photos; could be done incrementally
  Recommendation: start with option 1, add the CMS field for new photos going forward.

---

## Content Types (confirmed from 50-page crawl)

The entire site is powered by 5 ASP files. The new build needs these templates:

1. **Homepage** — 3-column, featured collection, slideshow, MailChimp signup, live stats counter
2. **Browse: Folder/Category** — hierarchical nav sidebar + section image + descriptive text
3. **Browse: Site/Leaf** — same sidebar + photo list + site description with inline links
4. **Browse: Individual Photo View** — photo + comments + Image Toolbar (download/print/pptx) + lightbox
5. **Browse: Thumbnail Grid** — all photos for a site in a grid, no pagination
6. **Browse: Print Mode** — stripped layout, photo + comments only, no chrome
7. **Search Results** — paginated 10/page, thumbnail + title + keywords
8. **What's New** — time-filtered feed (1wk/2wk/1mo/2mo), RSS, no pagination
9. **Static Pages** — About, Permissions, How to Use, Recommended Reading, Tour, Site Directory, Topical Index

**Scale:** 612 sites, 7,022 photos, ~10–15 images added weekly.

## URL Strategy
Current URLs must be preserved or redirected to protect SEO and inbound links:
- `go.asp?s=N` and `go.asp?img=IMAGEID` — used extensively in inbound links
- `browse.asp?s=A,B,C,...` — the `s=` param is a full ancestry path (not just a single ID)
- `page.asp?page_ID=N` — static pages
- `search.asp`, `whats_new.asp`

## Data Architecture
Two core entities:
- **Nodes** — a tree of folders and sites (each with id, parent_id, name, description, section image)
- **Images** — photos belonging to a leaf node (alphanumeric ID like `INSGCP03`, title, comments, keywords, sort order, dates)

Keywords are a flat comma-separated string per image. The image ID itself is embedded as the last keyword (enables search by ID).

## Image CDN
Images are served from `img.holylandphotos.org` with on-the-fly resizing (`?w=640&h=640&mode=max`). This is likely ImageResizer.net (.NET-based). The new build should either:
- Keep this service running as-is (lowest risk), or
- Replace with a modern equivalent (Cloudflare Images, imgix, or Next.js Image Optimization)

Decision to be made after reviewing the current infrastructure.

---

## CMS Requirements
*(To be confirmed after reviewing the current admin interface)*

- [ ] Add/edit/delete photos and galleries
- [ ] Add/edit written content
- [ ] Manage mailing list
- [ ] Other: TBD

---

## Autonomy — Pre-Authorized Actions

Peter has pre-authorized the following actions. Do them without asking for confirmation:

- **`git commit` and `git push` to `main`** — commit and push whenever completing a task Peter requested. No need to ask "should I push this?"
- **`python3 generate_mockups.py`** — run freely when content changes require regeneration
- **`python3 apply_themes.py`** — run freely if it exists and theme changes need to be applied to story pages
- **Reading, editing, and writing any file in this repo** — no confirmation needed
- **Running any bash command scoped to this project directory** — grep, ls, cat, etc.

The only things that still require Peter's explicit sign-off before proceeding:
- Deleting files (use caution; ask first)
- Force-pushing or rewriting git history
- Any action that affects external services (MailChimp, PayPal, DNS, S3/CloudFront)

---

## Conventions (to be added as build progresses)
- Always use `npm run dev` to start the dev server
- QA sign-off from Peter required before any section is considered done
- Match the original site's URLs where possible to preserve SEO and inbound links
- **Do not rely on image ID naming conventions for code logic.** The existing photos follow a pattern (e.g. `TEETHN02`, `FRPALOST04`) but this is a convention Dr. Rasmussen used, not a rule. Future uploads may not follow it. Always use database lookups (e.g. querying the photos collection) rather than filename pattern matching to determine whether a file is a photo, which section it belongs to, etc.

## QA Tools (confirmed working)
- **metatags.io** — validates Open Graph and Twitter Card tags; confirms social share previews
- **validator.schema.org** — validates Schema.org structured data markup
Both were tested against the old site (failing) and the new mockups (passing). Run both on every new page template before sign-off.

---

## Mockup Generator Architecture

Mockups are generated by `generate_mockups.py` at the repo root.

**Key principle — shared CSS:**
- All CSS lives in `mockups/style.css`, written once by the generator
- Every HTML file links to it externally (`<link rel="stylesheet" href="style.css">` or `../style.css`)
- **Design changes only require editing `style.css` and pushing** — no regeneration needed
- Regenerate only when **content** changes (new pages, new photo comments, new photos)

**To regenerate all mockups:**
```bash
python3 generate_mockups.py
```

**Template functions in the generator:**
- `photo_page()` — individual photo view (outputs to `mockups/photos/IMAGEID.html`)
- `browse_page()` — folder/category/site pages (outputs to `mockups/*.html`)
- `TOPNAV`, `HEADER`, `FOOTER` — shared HTML fragments used by all templates
- `CSS` — the single source of truth for all styles; written to `style.css`

**Mobile nav:**
- Hamburger toggle implemented via `.nav-toggle` button + `.topnav-links.open` class
- Activates at `max-width: 680px`
- Nav JS is a small inline `<script>` block (`NAV_JS` constant) appended to every page

**Adding a new page type:**
1. Add content data as constants (description, sidebar HTML, etc.)
2. Call `browse_page()` or write a new template function if significantly different
3. Add the output file to the `pages` list in `main()`
4. Run the generator and push

**Story/essay pages (dark theme) are hand-authored**, not generated by `generate_mockups.py`. They live in `mockups/` alongside the generated pages and link to `style.css` only for any shared utilities — they have their own inline `<style>` blocks for the dark theme.

---

## Content Rule — Verbatim Only

All body copy in mockups must come **verbatim from the live site**. Never paraphrase, summarize, or write substitute copy. If content for a section isn't available yet, use a bracketed placeholder like `[Content from DB]`.

This applies to: country descriptions, site descriptions, static page text, photo comments, bibliography entries, etc.

---

## Footer (Decided)

All pages use this footer pattern:

```html
<footer class="site-footer">
  <p class="footer-copy">© <span id="footer-year"></span>. All Images are the property of Dr. Carl Rasmussen unless otherwise noted.</p>
  <nav class="footer-links">
    <a href="permission-story.html">Permission to Use</a>
    <a href="about.html">About</a>
    <a href="https://holylandphotos.wordpress.com" target="_blank" rel="noopener">Dr. Rasmussen's Blog</a>
    <a href="mailto:holylandphotos@gmail.com?subject=Technical%20Feedback">Send Technical Feedback</a>
  </nav>
</footer>
<script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
```

The year is always dynamic — never hardcode `2026` or any year.

---

## Story Page Layout Conventions

- **Images always left** — no alternating left/right layout
- **Max content width:** 1200px via `.chapters-wrapper { max-width: 1200px; margin: 0 auto; }`
- **`object-fit: contain`** — images are never cropped; wider images become shorter, not stretched
- **Gap between chapters** — add `margin-bottom` on `.chapter` so images don't run together
- **Sticky breadcrumb** — `position: sticky; top: 0; z-index: 100` — travels with scroll on all story pages
- **No chapter number watermarks** — `::after` pseudo-elements with `content: attr(data-num)` should not be used (bleeds through with `object-fit: contain`)
- **No return link** — the "Holy Land Photos" return-link has been removed from all pages; top nav bar is a pending design task
