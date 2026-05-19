# Holy Land Photos — SEO TODO

Created 2026-05-19. Derived from a route-by-route audit of meta tags, Open Graph, Twitter Cards, and JSON-LD structured data. See also: main [TODO list](TODO.md).

Goal: maximize visibility in Google Search, Google Image Search, and knowledge-panel placements for archaeological sites — the surfaces most relevant to scholars and educators looking for Holy Land photography.

---

## Tier 1 — Foundational (do first; small PR, unlocks everything else)

- [x] **Set `metadataBase` in the frontend root layout** (`src/app/(frontend)/layout.tsx`) to `new URL('https://holylandphotos.org')`. Currently all relative `og:image` and canonical URLs are technically broken — social crawlers need absolute URLs. *(Done 2026-05-19.)*
- [x] **Add `sitemap.ts` at the App Router root.** Query Payload for all photos, sections, news, and pages; emit URLs with `lastModified`. Without this, Google has to discover 7,000+ photos by crawling links — slow and incomplete. *(Done 2026-05-19 — 7,969 URLs emitted.)*
- [x] **Add `robots.ts` at the App Router root** referencing the sitemap. *(Done 2026-05-19.)*
- [x] **Add `og:url` to every dynamic route's `generateMetadata()` return value** — disambiguates the canonical resource for social platforms. *(Done 2026-05-19: photos, browse, news, pages, keywords.)*

## Tier 2 — High-value structured data (one PR across photo, browse, homepage templates)

- [x] **Enrich `ImageObject` JSON-LD on `/photos/[imageId]`** with the properties Google's image-SEO docs reward:
  - `license` — `https://holylandphotos.org/pages/permission-to-use`
  - `acquireLicensePage` — same URL
  - `creditText` — `Image courtesy of www.HolyLandPhotos.org`
  - `copyrightNotice` — `© 1995–{current year} Dr. Carl Rasmussen. All rights reserved.`
  - `copyrightHolder` — Person: Dr. Carl Rasmussen
  - `publisher` — Organization: HolyLandPhotos.org
  - *(Done 2026-05-19 — wording confirmed by Carl via Peter.)*
  - *Note: upgrading `about: { Place, name }` to a full `contentLocation: { Place, name, geo }` is tracked as a separate item below now that coordinates exist.*

- [ ] **Add `Place` JSON-LD to leaf browse pages** (`/browse/[slug]` for archaeological sites). Properties: `name`, `description`, `geo` (lat/long — now available!), `containedInPlace` (e.g. "Israel"), `photo` (array of ImageObjects on the page). Effect: knowledge-panel candidacy for 612 sites — biblical scholars searching "Caesarea Maritima photos" could see a panel, not just blue links.
  - **Coords now available** — see the "Geocoding for `geo` properties" section below. Render `geo` only when `geoReviewStatus = 'approved'`, omit the whole Place block when `excluded`, and fall back to no `geo` for `pending`/`needs_research`.

- [ ] **Wire `contentLocation.geo` into `ImageObject` on `/photos/[imageId]`** — the existing ImageObject (already deployed with license/credit/copyright) currently only has `about: { @type: Place, name: <section title> }`. Upgrade it to `contentLocation: { @type: Place, name, geo: { latitude, longitude }, containedInPlace }` when the parent section has approved coords. Same gating as the Place schema above.

- [x] **Add `WebSite` + `SearchAction` JSON-LD to the homepage.** Enables the Google Sitelinks Search Box (a search input directly inside the search result for the domain). One JSON-LD block pointing at `/search?q={search_term_string}`. *(Done 2026-05-19.)*

- [x] **Complete `BreadcrumbList` items on `/browse/[slug]`** — audit found `position` and `name` populated but `item` (URL) is missing. ~~Without URLs, Google can't render breadcrumb-style search results.~~ *On closer inspection of the code, item URLs were already being emitted (the audit was wrong on this one). No change needed.*

## Tier 3 — Medium impact

- [ ] **Add `Article` JSON-LD to `/news/[id]`** — `headline`, `datePublished`, `dateModified`, `author`, `image`. Candidacy for Top Stories carousels.
  - ⚠️ **Needs input from Carl** — see below.
- [ ] **Set Twitter handle** in root metadata (`twitter.creator`, `twitter.site`).
  - ⚠️ **Needs input from Carl** — see below.
- [ ] **Add `CollectionPage` + `ItemList` JSON-LD** on the thumbnail-grid pages and `/keywords/[keyword]`. Improves grid-style indexing of related photos.
- [ ] **Bake IPTC metadata into the JPEGs themselves in S3** — `Creator`, `Copyright Notice`, `Description`, `Keywords`. Google reads these directly from the image bytes; they survive hotlinking and scraping. Highest-leverage single change for downstream attribution (AI training datasets, image reuse).
  - ⚠️ **Needs input from Carl + Peter** — see below.

## Geocoding for `geo` properties — completed infrastructure

Both the `Place` schema and `ImageObject.contentLocation.geo` items above need lat/long coordinates per site. That infrastructure now exists:

- **Schema** — the `sections` collection has `latitude`, `longitude`, `geoReviewStatus` (pending / approved / excluded / needs_research), `geoSource`, and `geoNotes` fields (migration `20260519_150309_add_section_geo`).
- **Three-pass geocoder** — `scripts/geocode_sites.py` (Wikidata SPARQL + Nominatim) and `scripts/geocode_pass3_llm.py` (Claude Haiku reading the site's body text) populated `docs/site-geocode-enriched.csv` with proposed coords for all 549 sites that have a real country in their ancestry.
- **Import** — `scripts/import_geocode.py` seeded the proposed coords into the DB. Auto-approves Wikidata HIGH (226 sites, sample 100% accurate) and LLM HIGH (246 sites, description-anchored). Auto-excludes 48 regional/thematic sections that LLM correctly flagged as "not a single place." Leaves 25 lower-confidence sites + 4 unresolved + 63 thematic-no-country sites for manual review. Safety guard: only updates rows still at `status='pending'`, so re-runs never clobber manual edits.
- **Approval app** — `/admin/geo-review` (custom Payload admin view) renders one pending site at a time on a Leaflet/OSM map with a draggable pin and Y/E/R keyboard shortcuts.

**Current prod state (as of 2026-05-19):**
| status | count |
|---|---|
| approved | 472 |
| excluded | 55 |
| needs_research | 4 |
| pending | 81 |

**What's left:**
- Peter to clear the 81 pending sites via `/admin/geo-review` (mostly thematic sections needing `E`, plus ~25 LLM-medium real sites needing a quick look).
- Wire `geo` into `Place` and `contentLocation` (the two items above) once the queue is small enough that most browse pages will have a usable coord.

## Tier 4 — Low priority / skip unless bored

- [ ] `LearningResource` schema on static educational pages — niche, only helps with Google Classroom / educational search.
- [ ] `DefinedTerm` on keyword pages — overkill for a tag taxonomy.
- [ ] Schema.org `mainEntity` on the site directory — Google rarely uses these.

---

## Related work already tracked in [TODO.md](TODO.md)

These aren't structured-data issues but materially affect SEO performance:

- **27 unmapped old URLs** — bleeding link equity until they redirect.
- **Alt text strategy for 7,022 photos** — alt text drives image-search *ranking*; schema enables *features* once you rank. Both matter.
- **242 records with inline `<img>`** not yet converted — affects content discoverability.

---

## Input needed

### From Carl Rasmussen

1. ~~License URL and exact wording.~~ **Answered 2026-05-19:** `/pages/permission-to-use`.
2. ~~`creditText` — preferred attribution string.~~ **Answered 2026-05-19:** `Image courtesy of www.HolyLandPhotos.org`.
3. ~~`copyrightNotice` — full copyright text.~~ **Answered 2026-05-19:** `© 1995–{current year} Dr. Carl Rasmussen. All rights reserved.`
4. ~~`copyrightHolder` — Person or Organization?~~ **Answered 2026-05-19:** Dr. Carl Rasmussen as `copyrightHolder` (Person), HolyLandPhotos.org as `publisher` (Organization).
5. **Twitter / X handle** — do you have an X account you want associated with shared links? If not, we'll skip `twitter.creator` and just set `twitter.site` to the site name.
6. **For `Article` schema on news items** — is the author always you, or are guest posts / multi-author pieces ever a thing? (If always you, we hard-code; if not, we add a field.)
7. **IPTC metadata in the JPEGs themselves** — are you OK with a one-shot batch job that rewrites every JPEG in S3 to embed `Creator`, `Copyright Notice`, `Description` (from the photo's first-sentence comment), and `Keywords`? Best practice but it does touch all 7,022 image files. There's a small risk of re-encoding subtly changing image bytes; we'd want to test on a sample first. *(Wording for the embedded strings now confirmed — see items 1–4 above. Still need a yes/no on doing the batch.)*

### From Peter

1. ~~Geographic coordinates for archaeological sites.~~ **Resolved 2026-05-19.** Built a three-pass geocoder (Wikidata + Nominatim + Claude Haiku reading site descriptions), seeded all 549 sites with country ancestry, auto-approved 472 high-confidence rows, and stood up `/admin/geo-review` for the remaining manual pass. See the "Geocoding for `geo` properties" section above for the full breakdown.
2. **S3 write access for IPTC batch update.** Confirm we have credentials in this project that can write to the photo bucket (not just read), and that re-uploading 7K images is acceptable from a bandwidth/cost standpoint.
3. ~~Prioritization call.~~ **Resolved 2026-05-19** — Tier 1 + the unblocked Tier 2 items are shipped. Remaining Tier 2 work (Place schema + contentLocation.geo) waits on Peter clearing the geo-review queue.
