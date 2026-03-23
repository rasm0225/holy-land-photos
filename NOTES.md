# HolyLandPhotos.org — Project Notes

## Overview
Rebuilding holylandphotos.org — a photography and scholarship website belonging to **Dr. Carl Rasmussen**.
Originally built and maintained for free by a former student named **Jesse Gavin**.
Rebuild is being done by Claude Code under Peter's supervision.

**Scale:** 612 sites, 7,022 photos. ~10–15 images added weekly.

---

## Current Tech Stack (via BuiltWith analysis)
- **Server-side:** Classic ASP + ASP.NET, IIS 10
- **Hosting:** Microsoft Azure (US Central)
- **Assets:** Amazon S3 + CloudFront CDN
- **Frontend:** jQuery 1.9 / 1.11.1, FlexSlider, lodash
- **Email:** MailChimp
- **Payments:** PayPal (donations)
- **Analytics:** Google Analytics 4, Google Tag Manager
- **SSL:** DigiCert

## Key Observations
- Site has a custom CMS/admin interface for content management
- Two jQuery versions running simultaneously — sign of incremental patching over the years
- Classic ASP dates to early 2000s — no longer maintained/supported
- S3 + CloudFront infrastructure is modern and should be preserved

---

## Access Checklist
Items needed from current developer before rebuild can begin:

- [ ] Source code (all ASP/HTML/CSS/JS files)
- [ ] Database export (SQL Server or Access)
- [ ] AWS access (S3 bucket + CloudFront distribution)
- [ ] Microsoft Azure hosting account
- [ ] Domain registrar access (holylandphotos.org)
- [ ] MailChimp account
- [ ] Google Analytics / Tag Manager account
- [ ] PayPal account

---

## URL Patterns (Current Site)
- `page.asp?page_ID=X` — static/editorial pages
- `browse.asp?s=X` — category landing and browse pages
- `go.asp?s=X` — individual site/gallery pages (photos)

These URL patterns should be preserved or redirected in the new build to protect SEO and inbound links.

---

## Site Architecture (from 50-page crawl)

Only **5 ASP files** power the entire site:
- `index.asp` — homepage
- `browse.asp` — everything in the photo/site hierarchy (4 sub-modes)
- `page.asp` — all static content pages
- `search.asp` — search results
- `whats_new.asp` — recent additions feed

### URL Routing
```
go.asp?s=64           → browse.asp?s=1,2,9,25,64         (site lookup)
go.asp?img=INSGCP03   → browse.asp?s=1,2,5,14,37&img=INSGCP03  (image lookup)
```
The `s=` param is a **comma-separated ancestry path** of node IDs encoding the full tree path. The left sidebar is built from this on every request.

---

## Content Templates (confirmed from crawl)

### 1. Homepage (`index.asp`)
- 3-column layout (unique to homepage)
- Left: Featured Collection (rotated manually in CMS) + MailChimp signup form
- Center: Search bar + Site News & Recent Additions + 7-frame image slideshow with captions
- Right: Browse Collections + Site Information links + RSS badge
- Header: logo + "Complete Site List" and "Topical Easy Find" buttons + live DB stats counter
- Footer: copyright + PayPal donate button (encrypted PKCS7 token) + blog/feedback links

### 2. Browse — Folder/Category (`browse.asp?s=X`)
- 2-column layout
- Left sidebar: hierarchical breadcrumb (clickable ancestry) + "Site Info | Thumbnails" toggle + child folder links with counts
- Main: section image (map or representative photo, watermarked) + descriptive paragraphs with inline links
- Some nodes return "Ain't no Content" — valid tree nodes with no description loaded (not errors)

### 3. Browse — Site/Leaf (`browse.asp?s=X,Y,Z` — leaf node, no img param)
- Same 2-column layout
- Left sidebar: breadcrumb + toggle + full list of all photo names in this site as links
- Main: section image + 1–4 paragraphs of site description (geography, biblical refs, archaeology) + inline links to related photos
- Footer: "Last modified: DATE" (per-site)

### 4. Browse — Individual Photo View (`browse.asp?s=...&img=IMAGEID`)
- 3-region layout
- Left sidebar: breadcrumb + toggle + sibling photo list (current photo bolded/non-linked)
- Main:
  - Photo title (H1)
  - Pagination: `< Prev | 9 of 32 | Next >`
  - Photo at ~640px (served from `img.holylandphotos.org` with `?w=640&h=640&mode=max&timestamp=HEX`)
  - "Click Photo for Larger Version" → lightbox at 1200px (custom JS, no framework)
  - "Photo Comments" — 1–4 descriptive paragraphs with inline links
- Right "Image Toolbar":
  - PowerPoint Ready link (950×710px)
  - Printable Page link
  - Download: Small (400px) / Medium (640px) / Large (800px) / **Max Size Available**
- Footer: "Last modified: DATE" (per-image)

### 5. Browse — Thumbnail Grid (`browse.asp?s=...&thumbs=1`)
- Same 2-column layout as site/leaf
- Main: CSS grid of 220×220px thumbnails, photo title link below each
- All thumbnails for the site shown at once — no pagination
- Some older images have no thumbnail (shows dot placeholder)

### 6. Browse — Print Mode (`browse.asp?s=...&img=IMAGEID&mode=print`)
- Fully stripped layout — no header, nav, sidebar, or footer
- Photo on right (~45%), comments text on left (~55%)
- No watermark on image in print mode
- GA tag still present in source

### 7. Search Results (`search.asp?searchText=QUERY&page=N`)
- 2-column (same sidebar as page.asp — Browse Photos + Site Information)
- Paginated: 10 results/page with count ("1–10 of 44")
- Each result: thumbnail (80×80) or "VIEW SITE" placeholder, linked title, Keywords: list with search term bolded
- Search indexes titles + keywords (NOT full-text photo comments)
- Image ID embedded as last keyword in every record — enables search-by-ID

### 8. What's New (`whats_new.asp?d=FILTER`)
- 2-column (same sidebar as search/page.asp)
- Time filter tabs: 1 Week / 2 Weeks / 3 Weeks / 1 Month / 2 Months
- Each entry: 80×80 thumbnail + "**Site Name :: Photo Name**" title link + date + keywords
- No pagination — all results for the time window shown
- RSS feed available

### 9. Static Content Pages (`page.asp?page_ID=N`)
- 2-column (Browse Photos + Site Information sidebar — static, not contextual)
- Known pages:

| page_ID | Page |
|---|---|
| 2 | About this Site |
| 4 | Recent Additions (redirects to whats_new behavior) |
| 5 | Permission to Use |
| 6 | Recommended Reading (with Amazon + YouTube links) |
| 7 | How to Use this Site |
| 8 | Complete Site List (deep nested `<ul>`, 4–5 levels, all items linked to `go.asp`) |
| 48 | Topical Easy Find (thematic index with image counts, tour announcements) |
| 63 | Tour Page (prose + contact email) |

---

## Database Schema (inferred)

Two main entity types:

**Nodes** (tree structure — folders and sites):
- `id` (int), `parent_id`, `name`, `type` (folder vs site/leaf)
- `description_html` (rich text with inline links)
- `section_image_filename`
- `last_modified`

**Images** (photos):
- `id` (alphanumeric — e.g. `INSGCP03`)
- `node_id` (parent site/leaf node)
- `title`, `photo_comments_html` (rich text with inline links)
- `keywords` (flat comma-separated string — image ID itself is last keyword)
- `date_added`, `sort_order`, `last_modified`
- `thumbnail_exists` (bool — some older images lack thumbnails)
- `timestamp_hex` (cache-buster for image CDN URLs)

**Image ID naming convention** (manually applied, not auto-generated):
`CC[TYPE][SITE][NN]` — e.g. `INSGCP03` = Israel / Synagogue / Capernaum / 03

---

## Image CDN

Images served from `img.holylandphotos.org` (separate subdomain) with on-the-fly resizing:
```
img.holylandphotos.org/INSGCP03.jpg?w=640&h=640&mode=max&timestamp=HEX
```
Likely **ImageResizer.net** or similar .NET image processing tool. The `timestamp` hex is a fixed per-image cache key tied to last-modified date. This is a separate service that will need to be accounted for in the new architecture.

---

## Open Questions
- What database is behind the site? (SQL Server or Access?)
- How complex is the custom CMS? (simple CRUD vs. multi-user workflow?)
- How many distinct page/content types are there?
- Are any images stored in the database rather than S3?
- Who will manage content after the rebuild — Dad, Peter, or a new developer?
- Does Dad want to be able to make updates himself?

---

## GitHub
Repo: https://github.com/rasm0225/holy-land-photos
GitHub Pages (mockups): https://rasm0225.github.io/holy-land-photos/mockups/

## Mockup Phase
Before full build begins, HTML/CSS mockups are being built and reviewed:
- Covers the full Turkey → Western Turkey → Aegean → Smyrna → Photo hierarchy
- Peter reviews and QAs each page; Dr. Rasmussen to review for overall direction
- Mockups live in `/mockups/` — generated by `generate_mockups.py`
- Confirmed: Open Graph, Twitter Card, and Schema.org markup validated on mockups via metatags.io and validator.schema.org

## Status
- [x] Brief sent to Dad / current developer (2026-03-23)
- [x] Mockup of Turkey → Smyrna → Photo hierarchy built and published
- [ ] Dr. Rasmussen reviews mockup
- [ ] Access received from Jesse Gavin
- [ ] Code audit complete
- [ ] Scope and timeline confirmed
- [ ] Build started
