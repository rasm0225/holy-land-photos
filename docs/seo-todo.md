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

- [x] **Add `Place` JSON-LD to leaf browse pages** (`/browse/[slug]` for archaeological sites). Properties: `name`, `description`, `geo` (lat/long), `containedInPlace` (e.g. "Israel"). *(Done 2026-05-19 — gated on `geoReviewStatus === 'approved'`. As pending sites clear, more browse pages get the block automatically; no further wiring needed. Helpers in `src/lib/sectionGeo.ts`.)*

- [x] **Wire `contentLocation.geo` into `ImageObject` on `/photos/[imageId]`** — upgraded `about: { Place, name }` to `contentLocation: { Place, name, geo, containedInPlace }` when the parent section has approved coords. Falls back to the topical `about` anchor for unapproved sections. *(Done 2026-05-19.)*

- [x] **Add `WebSite` + `SearchAction` JSON-LD to the homepage.** Enables the Google Sitelinks Search Box (a search input directly inside the search result for the domain). One JSON-LD block pointing at `/search?q={search_term_string}`. *(Done 2026-05-19.)*

- [x] **Complete `BreadcrumbList` items on `/browse/[slug]`** — audit found `position` and `name` populated but `item` (URL) is missing. ~~Without URLs, Google can't render breadcrumb-style search results.~~ *On closer inspection of the code, item URLs were already being emitted (the audit was wrong on this one). No change needed.*

## Tier 3 — Medium impact

- [x] **Add `Article` JSON-LD to `/news/[id]`** — `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `url`, `mainEntityOfPage`, optional `description` + `image`. Candidacy for Top Stories carousels. *(Done 2026-05-19 — author hardcoded as Dr. Carl Rasmussen per Carl.)*
- [x] **Set Twitter handle** in root metadata. *(Resolved 2026-05-19 — no X/Twitter account, so we leave `twitter.creator` and `twitter.site` unset. Current `twitter.card: 'summary_large_image'` stays as-is.)*
- [x] **Add `CollectionPage` + `ItemList` JSON-LD** on the thumbnail-grid pages and `/keywords/[keyword]`. *(Done 2026-05-19. `/browse/[slug]` now emits an `ItemList` alongside the existing BreadcrumbList + Place blocks whenever the leaf site has photos. `/keywords/[keyword]` emits a `CollectionPage` with `mainEntity: ItemList` covering matched sections then photos.)*
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
- Peter to clear the 81 pending sites via `/admin/geo-review` (mostly thematic sections needing `E`, plus ~25 LLM-medium real sites needing a quick look). The Place + contentLocation emitters are already deployed and gated; each approval automatically turns on rich data for that site's browse page and every photo on it.

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
5. ~~Twitter / X handle.~~ **Resolved 2026-05-19** — no account, skipped.
6. ~~For `Article` schema on news items — is the author always you?~~ **Answered 2026-05-19:** Always Carl. Hardcoded.
7. **IPTC metadata in the JPEGs themselves** — are you OK with a one-shot batch job that rewrites every JPEG in S3 to embed `Creator`, `Copyright Notice`, `Description` (from the photo's first-sentence comment), and `Keywords`? Best practice but it does touch all 7,022 image files. There's a small risk of re-encoding subtly changing image bytes; we'd want to test on a sample first. *(Wording for the embedded strings now confirmed — see items 1–4 above. Still need a yes/no on doing the batch.)*

### From Peter

1. ~~Geographic coordinates for archaeological sites.~~ **Resolved 2026-05-19.** Built a three-pass geocoder (Wikidata + Nominatim + Claude Haiku reading site descriptions), seeded all 549 sites with country ancestry, auto-approved 472 high-confidence rows, and stood up `/admin/geo-review` for the remaining manual pass. See the "Geocoding for `geo` properties" section above for the full breakdown.
2. **S3 write access for IPTC batch update.** Confirm we have credentials in this project that can write to the photo bucket (not just read), and that re-uploading 7K images is acceptable from a bandwidth/cost standpoint.
3. ~~Prioritization call.~~ **Resolved 2026-05-19** — Tier 1 + the unblocked Tier 2 items are shipped. Remaining Tier 2 work (Place schema + contentLocation.geo) waits on Peter clearing the geo-review queue.
