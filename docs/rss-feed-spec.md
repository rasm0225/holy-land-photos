# RSS feed — existing format on holylandphotos.org

The legacy ASP site publishes an RSS 2.0 feed of recent photo additions at
[`/rss/`](https://holylandphotos.org/rss/). Subscribers (RSS readers,
aggregators, etc.) consume this. We need to replicate the same URL and
broadly the same content after the EC2 launch so existing subscribers keep
working.

This doc captures the exact shape so we don't have to reverse-engineer it
later.

---

## URL and format

- **URL:** `https://holylandphotos.org/rss/` (trailing slash; current
  server treats with and without identically).
- **Content-Type:** `application/rss+xml; charset=utf-8`
- **Format:** RSS 2.0, with an XSL stylesheet declaration so browsers
  render a human-readable view instead of raw XML:
  ```xml
  <?xml-stylesheet title="XSL_formatting" href="https://holylandphotos.org/rss/rss.xsl" type="text/xsl"?>
  ```
  We can replicate the XSL or skip it (most modern RSS readers ignore it
  and present the raw feed cleanly). Decide before launch.

---

## Channel metadata

Fields actually used by the current feed:

| Element | Current value |
|---|---|
| `title` | `HLP Recent Additions` |
| `link` | `https://holylandphotos.org/` |
| `description` | `The latest additions to the Holy Land Photos archive.` |
| `language` | `en-us` |
| `copyright` | `Copyright YYYY, Holy Land Photos` (year is dynamic) |
| `managingEditor` | `holylandphotos@gmail.com (Carl G. Rasmussen)` |
| `webMaster` | `jesse@holylandphotos.org (Jesse Gavin)` — **drop after launch** (Jesse is the old developer) |
| `pubDate` | RFC 822 timestamp, e.g. `Fri, 06 Mar 2026 00:00:01 GMT` |
| `lastBuildDate` | Same format as pubDate; refresh on each render |
| `category` | `Archaeology` |
| `generator` | `HLP CMS` — can become `Next.js + Payload CMS` |
| `ttl` | `60` (minutes — hint for aggregators) |
| `image` | Branded RSS logo, 222×58, served from `/images/rss_logo.png` |

Fields present but obsolete — **do NOT carry over**:

- `<cloud …>` element — old RSS Cloud / SOAP ping mechanism, nobody uses it
- `<rating>` element — old PICS content rating, deprecated since ~2010
- `<docs>` element — vestigial pointer to RSS spec; harmless either way

---

## Item structure (per photo)

Each `<item>` represents one photo. Items are ordered newest first by
`pubDate`. The current feed returns ~25 items per request (no pagination).

Example item with field-by-field annotations:

```xml
<item>
  <title><![CDATA[Sardis Artemis Temple Plus: Temple Interior]]></title>
  <link>https://holylandphotos.org/go.asp?rss=1&amp;img=TUANSAPA15</link>
  <description><![CDATA[
    <p><img src="https://img.holylandphotos.org/TUANSAPA15.jpg?w=640&h=640" /></p>
    <p>View looking west along the interior of the Temple of Artemis…</p>
  ]]></description>
  <author><![CDATA[holylandphotos@gmail.com(Carl G. Rasmussen)]]></author>
  <category domain="https://holylandphotos.org/go.asp?rss=1&amp;s=3645">
    <![CDATA[Sardis Artemis Temple Plus]]>
  </category>
  <guid isPermaLink="true">https://holylandphotos.org/go.asp?rss=1&amp;img=TUANSAPA15</guid>
  <pubDate>Fri, 06 Mar 26 21:37:00 GMT</pubDate>
  <source url="https://holylandphotos.org/rss/">
    <![CDATA[HolyLandPhotos.com Recent Additions]]>
  </source>
</item>
```

### Field rules

- **`title`** — `"{Section Title}: {Photo Title}"`. Section comes from the
  photo's parent section.
- **`link`** and **`guid`** — both point to `go.asp?rss=1&img={imageId}`.
  The `rss=1` is a tracking flag the old server used to count RSS-sourced
  visits; we can keep it for analytics continuity or drop it. The new
  middleware already redirects `/go.asp?img=…` → `/photos/{imageId}`,
  so existing subscribers' clicks will resolve correctly.
- **`description`** — HTML wrapped in CDATA. Always starts with a 640×640
  thumbnail `<img>` followed by paragraphs of the photo comment text.
  - Image URL: `https://img.holylandphotos.org/{imageId}.jpg?w=640&h=640`
    (old CloudFront / image-resize CDN). In the new build, swap to the S3
    URL (`https://hlp-dev-photos…s3…amazonaws.com/{imageId}.jpg`) or to
    `img.holylandphotos.org/{imageId}.jpg` if we keep that CNAME pointing
    at CloudFront for legacy compatibility.
  - Body: the photo's comments rendered as HTML (we already store this as
    `html_description` / Lexical, render the same way the photo page does).
- **`author`** — fixed string `holylandphotos@gmail.com(Carl G. Rasmussen)`.
  Note the missing space before `(` in the original — preserve it for byte-
  level continuity, or fix it (RSS readers don't care).
- **`category`** — section title in CDATA, with `domain` attribute pointing
  to the section's URL via `go.asp?rss=1&s={sectionId}`. Multiple categories
  not currently used (one per item), even when a photo belongs to multiple
  sections — original feed picks one.
- **`pubDate`** — RFC 822 format. **Note:** the original uses 2-digit year
  for items (`06 Mar 26`) but 4-digit year for the channel (`06 Mar 2026`).
  Both are valid RFC 822; 4-digit is preferred and clearer. Use 4-digit
  in the rebuild.
- **`source`** — fixed `<source url="…/rss/">HolyLandPhotos.com Recent
  Additions</source>`. Note the `.com` typo in the original (the site
  is `.org`). Fix in rebuild.

---

## How to replicate in the new Next.js build

A natural fit: a route handler at `src/app/(frontend)/rss/route.ts` that
queries the photos collection (sorted newest first, filtered to published,
limited to ~25 — same as `RecentAdditions.tsx`) and returns an XML
response.

Sketch:

```ts
// src/app/(frontend)/rss/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { publishedFilter } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'
const SITE = 'https://holylandphotos.org'
const ITEM_LIMIT = 25

export async function GET() {
  const payload = await getPayload({ config })
  const { docs: photos } = await payload.find({
    collection: 'photos',
    where: publishedFilter(),
    sort: '-createdAt',
    limit: ITEM_LIMIT,
    depth: 2, // resolve section for category/title
  })

  // For each photo, look up its section (one-of-many — pick the first match).
  // Build the XML by hand (the schema is small and Payload doesn't ship an
  // RSS helper). Use a tiny escape function for XML-safe text + wrap free-
  // form fields in CDATA.

  // Important headers:
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
}
```

### Things to verify before flipping the launch switch

- [ ] `https://holylandphotos.org/rss/` returns 200 with
      `Content-Type: application/rss+xml`
- [ ] Item count and ordering match the legacy feed
- [ ] Subscribers (e.g. Feedly) successfully refresh and show new items
- [ ] Item `link` and `guid` URLs resolve to a real photo page on the new
      site (either via `/go.asp?img=…` middleware redirect or by emitting
      the canonical `/photos/{imageId}` URL directly — preferred)
- [ ] `<img>` URLs in `description` actually load (don't reference
      `img.holylandphotos.org` if that CNAME has been retired)
- [ ] XSL stylesheet either present and styled, or omitted cleanly
      (subscribers won't notice; only humans hitting `/rss/` in a browser
      see the difference)

### Open questions

- **Keep the XSL stylesheet?** Decide whether to recreate `rss.xsl` or
  drop it. Most users hit RSS through an aggregator; the XSL only affects
  browser-direct views.
- **Tracking `rss=1` query param?** The original used this to count
  RSS-driven traffic. Replicate (and log) if you want that analytics, or
  drop and rely on GA referrer data.
- **Pagination?** Original returns ~25 items with no `next` link. Standard
  RSS doesn't support pagination cleanly. Probably leave as-is.
- **Atom feed too?** Some readers prefer Atom. Worth offering at
  `/atom.xml`? Low priority — RSS is sufficient for this audience.
