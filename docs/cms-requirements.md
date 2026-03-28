# CMS Requirements — Holy Land Photos

Collected notes from Peter. This is a living document — not yet structured for planning.

---

## Technology Stack (decided)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js | Public site + CMS in one app |
| CMS | Payload CMS 3.0 | Embedded in Next.js /app folder |
| Database | Turso (SQLite/libSQL) | Already set up from green-garden-fitness |
| Hosting | Vercel | Already set up |
| Image CDN | S3 + CloudFront | Existing, keep as-is |
| ORM | Drizzle | Via Payload's @payloadcms/db-sqlite adapter |

---

## Photos

- Need ability to manage photos (add, edit, delete)
- Photos can be associated with: stories, pages, photo galleries
- Photos live in a **global library** and are associated with sections (many-to-many)

### Add New Photo workflow (current — can be simplified)
Current flow is two-step: create record (ID + title) first, then upload file separately.
**New CMS should combine this into a single step** — upload file + fill in metadata together.

### Image editor tabs
Each photo has these edit tabs:
1. **Image Text** — TBD (presumably title + description/comments, rich text)
2. **Keywords** — TBD (presumably per-photo tags)
3. **Notes** — TBD (internal notes, like section notes)
4. **Collections** — shows every section this photo belongs to, with Remove action. Confirms photos can belong to **multiple sections**.
5. **Image File** — file upload/replace with preview + Clear Image Cache
6. **Reports** — TBD
7. **Delete Photo**

## Site Tree / Hierarchy

- Hierarchy is a major organizing principle of the site
- Current CMS uses a tree of "sections" (729 sections total)
- Sections are nested to arbitrary depth (observed up to 4+ levels deep)
- Example path: Daily Life and Artifacts > Plants > Trees > Fig Trees
- Each section has: ID, title, and actions to edit, add child, or move
- Can add new top-level categories
- Can add child sections to any existing section
- Can move sections (reposition in tree)
- Photos live at leaf nodes of this tree

### Section types (from dropdown)
- (empty)
- Top Level
- Country
- Region
- Site
- Artifact

### Section edit tabs
Each section has these edit tabs in the current CMS:
1. **Section Text** — title, type dropdown, rich text body (CKEditor)
2. **Maps** — misleading name; this is actually the **section primary image** (the main image shown at the top of a gallery/browse page, e.g. a map or representative photo). Shows current image preview + file upload to replace it. Uploads go to `hlpupload.azurewebsites.net/home/section`. Filenames follow pattern `{sectionID}_{descriptiveName}.jpg`.
3. **Keywords** — tags for the overall gallery/section. Plain textarea with comma-separated keywords (e.g. "Olives, Processing, Olive, Tree, Press, Crusher, Images, Photos, Pictures, PowerPoint")
4. **Notes** — plain textarea for internal notes. Currently empty/unused. Dr. Rasmussen doesn't know what this is for. May not need to carry forward.
5. **Photos** — manage which photos appear in this section. Three actions:
   - **Add Existing Photos** — associate photos from the global photo library to this section (popup)
   - **Add New Photo** — upload a brand new photo (popup)
   - **Sort Photos** — reorder photos within the section
   - Shows a thumbnail grid of all photos currently in the section, each linking to image editor
   - Key concept: photos live in a global library and are *associated* with sections (not uploaded per-section)
6. **Delete Section**

### Section edit sidebar
- Lists all photos belonging to the section, linked to image editor

## Pages (standalone content)

- Separate content type, **not** part of the site tree hierarchy
- Used for informational/static pages (About, Permission to Use, Tours, Recommended Reading, etc.)
- List view columns: Page Title, View (public link), Display (True/False toggle), Last Modified, Delete
- ~34 pages total, mix of active (Display=True) and inactive (Display=False)
- Actions: Add New Page, sort page order, edit, delete
- Two tabs: **Pages List** and **Page Order** (for sorting)
- Public URL pattern: `page.asp?page_ID=N`
- Content types include: site info pages, tour descriptions, book sale listings, seasonal collections, topical indexes

### Page edit fields
- Page Title (text)
- Display Page (checkbox — show/hide on public site)
- Page Redirect URL (optional — for redirecting to an external URL instead of showing body content)
- Page Text (rich text body via CKEditor, stores full HTML including inline images)

## Site of the Week (STW)

- Featured content block on the homepage (upper left, below navigation)
- Each entry has: Section name, Image ID, Date Added
- Radio button selects which entry is the **current** featured item
- Large archive (~120+ entries dating back to 2003)
- Actions: Add New STW (via site tree picker), Edit, Delete
- Adding a new STW involves picking a section from the full site tree (rendered as a clickable picker, color-coded by depth)
- STW module also has a **Slideshow Photos** tab (TBD — need to see what this manages)

### STW edit fields
- Site Name (text, disabled — comes from the selected section)
- Image ID (text — the photo to feature, e.g. "TEETHN02")
- Rich text body (CKEditor) for the featured description

## News

- Structurally very similar to Pages — list with: News Title, Display (toggle), Date Added, Delete
- Actions: Add News, edit, delete
- ~230 entries (much larger than Pages), dating back years
- Appears to be date-driven content (new site additions, tour announcements, place features) vs. Pages which are permanent/informational
- **Key difference from Pages:** News items power the main homepage content area (e.g. a Palm Sunday photo gallery). They include an image gallery feature that Pages don't have.

### News edit fields
- News Title (text)
- Active (checkbox)
- News Text (rich text body via CKEditor)
- **Image Gallery** — special pipe-delimited text format, one image per line:
  - `IMAGEID | Caption | Optional URL`
  - Caption and URL are optional
  - If URL provided, clicking the image goes there instead of the default photo page
  - Can embed a YouTube video instead: `YOUTUBE|{video-id}`
- YouTube Video ID (separate text input, alternative to gallery)

## Search

- Search is critical for site users (public-facing)
- CMS role: ensure content is well-tagged and structured to support search
- Search technology choice is a separate decision — not part of the CMS build, but CMS data model needs to support it
- Decision deferred: what search tech to use (e.g. Algolia, Elasticsearch, built-in DB search, etc.)

## Workflow & Permissions

- Small number of users: likely 2, max 10
- Admin account needed to create/remove users — could be database-level, doesn't need to be in the CMS UI
- **Not needed:** version control, version history, content locking, approval workflows
- Keep it simple — all authenticated users can edit everything

### Existing CMS top-level navigation
The current CMS (`/control/tree.asp`) has these modules:
- Site Tree (the main hierarchy manager) — **carry forward**
- Edit Pages (static pages) — **carry forward**
- Site of the Week — **carry forward**
- News — **carry forward**
- Users — **carry forward** (minimal — may be DB-only)
- Tips — **not needed, drop**
- RSS Feed — **defer, not part of CMS**
