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

### Open Questions — Design
- [ ] Does Dr. Rasmussen want a visual refresh or a faithful recreation of the current aesthetic?
- [ ] Color palette and typography preferences?
- [ ] Should the site support dark mode?

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

## Conventions (to be added as build progresses)
- Always use `npm run dev` to start the dev server
- QA sign-off from Peter required before any section is considered done
- Match the original site's URLs where possible to preserve SEO and inbound links

## QA Tools (confirmed working)
- **metatags.io** — validates Open Graph and Twitter Card tags; confirms social share previews
- **validator.schema.org** — validates Schema.org structured data markup
Both were tested against the old site (failing) and the new mockups (passing). Run both on every new page template before sign-off.
