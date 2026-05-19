# Holy Land Photos — SEO TODO

Created 2026-05-19. Derived from a route-by-route audit of meta tags, Open Graph, Twitter Cards, and JSON-LD structured data. See also: main [TODO list](TODO.md).

Goal: maximize visibility in Google Search, Google Image Search, and knowledge-panel placements for archaeological sites — the surfaces most relevant to scholars and educators looking for Holy Land photography.

---

## Tier 1 — Foundational (do first; small PR, unlocks everything else)

- [ ] **Set `metadataBase` in the frontend root layout** (`src/app/(frontend)/layout.tsx`) to `new URL('https://holylandphotos.org')`. Currently all relative `og:image` and canonical URLs are technically broken — social crawlers need absolute URLs.
- [ ] **Add `sitemap.ts` at the App Router root.** Query Payload for all photos, sections, news, and pages; emit URLs with `lastModified`. Without this, Google has to discover 7,000+ photos by crawling links — slow and incomplete.
- [ ] **Add `robots.ts` at the App Router root** referencing the sitemap.
- [ ] **Add `og:url` to every dynamic route's `generateMetadata()` return value** — disambiguates the canonical resource for social platforms.

## Tier 2 — High-value structured data (one PR across photo, browse, homepage templates)

- [ ] **Enrich `ImageObject` JSON-LD on `/photos/[imageId]`** with the properties Google's image-SEO docs reward:
  - `license` (URL)
  - `acquireLicensePage` (URL — usually same)
  - `creditText`
  - `copyrightNotice`
  - `copyrightHolder` (Person or Organization)
  - `contentLocation` — `Place` with `geo` lat/long
  - Effect: enables the "Licensable" badge in Google Images.
  - ⚠️ **Needs input from Carl** — see "Input needed" section below.

- [ ] **Add `Place` JSON-LD to leaf browse pages** (`/browse/[slug]` for archaeological sites). Properties: `name`, `description`, `geo` (lat/long), `containedInPlace` (e.g. "Israel"), `photo` (array of ImageObjects on the page). Effect: knowledge-panel candidacy for 612 sites — biblical scholars searching "Caesarea Maritima photos" could see a panel, not just blue links.
  - ⚠️ **Needs input from Peter** — see below.

- [ ] **Add `WebSite` + `SearchAction` JSON-LD to the homepage.** Enables the Google Sitelinks Search Box (a search input directly inside the search result for the domain). One JSON-LD block pointing at `/search?q={search_term_string}`.

- [ ] **Complete `BreadcrumbList` items on `/browse/[slug]`** — audit found `position` and `name` populated but `item` (URL) is missing. Without URLs, Google can't render breadcrumb-style search results.

## Tier 3 — Medium impact

- [ ] **Add `Article` JSON-LD to `/news/[id]`** — `headline`, `datePublished`, `dateModified`, `author`, `image`. Candidacy for Top Stories carousels.
  - ⚠️ **Needs input from Carl** — see below.
- [ ] **Set Twitter handle** in root metadata (`twitter.creator`, `twitter.site`).
  - ⚠️ **Needs input from Carl** — see below.
- [ ] **Add `CollectionPage` + `ItemList` JSON-LD** on the thumbnail-grid pages and `/keywords/[keyword]`. Improves grid-style indexing of related photos.
- [ ] **Bake IPTC metadata into the JPEGs themselves in S3** — `Creator`, `Copyright Notice`, `Description`, `Keywords`. Google reads these directly from the image bytes; they survive hotlinking and scraping. Highest-leverage single change for downstream attribution (AI training datasets, image reuse).
  - ⚠️ **Needs input from Carl + Peter** — see below.

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

1. **License URL and exact wording.** For `ImageObject.license` and `acquireLicensePage`. Is the existing `/pages/permission-to-use` (or wherever the permissions page now lives) the canonical URL we should point to?
2. **`creditText` — preferred attribution string.** Default suggestion: `"Dr. Carl Rasmussen / HolyLandPhotos.org"`. Is that what you want shown when Google displays attribution next to your images?
3. **`copyrightNotice` — full copyright text.** What is the exact string you want embedded as the legal notice? (Example: `"© 2001–2026 Carl Rasmussen. All rights reserved."`)
4. **`copyrightHolder` — Person or Organization?** Should rights be attributed to you as a Person, or to "HolyLandPhotos.org" as an Organization, or both?
5. **Twitter / X handle** — do you have an X account you want associated with shared links? If not, we'll skip `twitter.creator` and just set `twitter.site` to the site name.
6. **For `Article` schema on news items** — is the author always you, or are guest posts / multi-author pieces ever a thing? (If always you, we hard-code; if not, we add a field.)
7. **IPTC metadata in the JPEGs themselves** — are you OK with a one-shot batch job that rewrites every JPEG in S3 to embed `Creator`, `Copyright Notice`, `Description` (from the photo's first-sentence comment), and `Keywords`? Best practice but it does touch all 7,022 image files. There's a small risk of re-encoding subtly changing image bytes; we'd want to test on a sample first.

### From Peter

1. **Geographic coordinates for archaeological sites.** The `Place` schema (Tier 2) and `ImageObject.contentLocation` (Tier 2) both want `geo` lat/long. Questions:
   - Does the Payload `sections` collection have lat/long fields? (If not, we'd need to add them.)
   - If they're empty, what's the plan — manual entry for the most-visited 50? Geocode all 612 from site names (cheap but imprecise)? Skip `geo` and just emit `Place` with `name` + `containedInPlace`?
2. **S3 write access for IPTC batch update.** Confirm we have credentials in this project that can write to the photo bucket (not just read), and that re-uploading 7K images is acceptable from a bandwidth/cost standpoint.
3. **Prioritization call.** Tier 1 is ~1 hour and pure infrastructure. Tier 2 is the big-impact structured-data work but blocks on the Carl/geo questions above. OK to proceed with Tier 1 immediately and queue Tier 2 behind the answers?
