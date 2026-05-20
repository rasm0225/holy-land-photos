# DNS — current state and migration plan (holylandphotos.org)

Snapshot of the `holylandphotos.org` DNS zone at the old registrar (AIT/DMT),
captured 2026-05-15 before the transfer to Namecheap. Used as the source of
truth when reconstructing records in the Namecheap panel.

## Current zone (at AIT/DMT)

### A
- `holylandphotos.org. A 20.40.202.31`  *(Azure App Service)*

### CNAME
- `_5844cfa84ae6b823469967641c6bf44d.img. CNAME _21f11cf5a9155a645e55bfaba92d5527.zzxlnyslwt.acm-validations.aws.`
- `awverify. CNAME awverify.holylandphotos.azurewebsites.net.`
- `images. CNAME holylandphotos.imgix.net.`
- `img. CNAME d2upgx86s50j0k.cloudfront.net.`
- `*. CNAME hlp-web.azurewebsites.net.`

### TXT
- `holylandphotos.org. TXT asuid=D20C9D9CA7813620EB66656A7A4163EFF2D06F54ACE9DF4394E3DB1EF215BF16`
- `holylandphotos.org. TXT google-site-verification=aqnxcNYOUYvx6PUTJqLnGNudbpIjAvUEeWwSxpzdQPU`
- `holylandphotos.org. TXT hlp.azurewebsites.net.`
- `test. TXT hlptest.azurewebsites.net.`

### MX
*None.* Confirmed via `dig MX holylandphotos.org` after the registrar transfer. Email is not on this domain, so nothing email-related needs to come over.

### MailChimp deliverability records (DKIM / SPF / DMARC)
*None.* Confirmed by querying `_dmarc.`, `k1._domainkey.`, `k2._domainkey.`, `mandrill._domainkey.`, `selector1._domainkey.` — only the Azure wildcard CNAME responds. So MailChimp sends from a `@mailchimp.com`-style address rather than `@holylandphotos.org`. Nothing to preserve here.

---

## Migration plan

### KEEP (recreate at Namecheap)

| Record | Value | Why |
|---|---|---|
| `holylandphotos.org. TXT` | `google-site-verification=aqnxcNYOUYvx6PUTJqLnGNudbpIjAvUEeWwSxpzdQPU` | Maintains Google Search Console ownership (SEO, sitemap submission, search analytics). Losing this loses Search Console access. |
| `img.holylandphotos.org. CNAME` | `d2upgx86s50j0k.cloudfront.net.` | Legacy image CDN from the old site. The new site does not use it (it uses its own `photos.holylandphotos.org` CDN — see below). Kept because external inbound links from books, blogs, and Google Image Search reference `img.holylandphotos.org/…` URLs. Drop it and those URLs 404. |
| `_5844cfa84ae6b823469967641c6bf44d.img.holylandphotos.org. CNAME` | `_21f11cf5a9155a645e55bfaba92d5527.zzxlnyslwt.acm-validations.aws.` | AWS Certificate Manager DNS validation for the `img.` SSL cert. Required ongoing for cert auto-renewal on CloudFront. Must keep if keeping the `img` CNAME above. |
| `photos.holylandphotos.org. CNAME` | `d38bzcfj2cy9zm.cloudfront.net.` | **New site's image CDN** (added 2026-05-20). CloudFront distribution `E1LUVR8CWQDM5E` fronting the private S3 bucket via OAC. The Next.js codebase points every photo URL at this hostname, so removing it breaks every page that renders an image. |
| `_dff33600efab8f56daf78b432ff19e0b.photos.holylandphotos.org. CNAME` | `_77df2da8081d044ac41f37491c90b373.jkddzztszm.acm-validations.aws.` | ACM cert DNS validation for `photos.holylandphotos.org`. Required ongoing for cert auto-renewal. |

### REPLACE (new records for EC2)

| Record | New value | Why |
|---|---|---|
| `holylandphotos.org. A` | `18.220.101.13` (EC2 elastic IP) | Replaces the current Azure A record |
| `www.holylandphotos.org. A` (or CNAME → `holylandphotos.org.`) | `18.220.101.13` | Standard www variant |

### DROP (Azure-specific or obsolete)

| Record | Why |
|---|---|
| `holylandphotos.org. A 20.40.202.31` | Old Azure App Service IP |
| `awverify.holylandphotos.org. CNAME awverify.holylandphotos.azurewebsites.net.` | Azure App Service ownership verification — Azure-specific |
| `*.holylandphotos.org. CNAME hlp-web.azurewebsites.net.` | Wildcard pointing to Azure. If left in place after Azure shutdown, every unknown subdomain request fails in a confusing way. Better to remove and let unknown subdomains NXDOMAIN cleanly. |
| `holylandphotos.org. TXT asuid=D20C9D9CA…` | Azure stamp ID |
| `holylandphotos.org. TXT hlp.azurewebsites.net.` | Azure verification |
| `test.holylandphotos.org. TXT hlptest.azurewebsites.net.` | Azure verification for the test subdomain |

### VERIFY / OPEN QUESTIONS

| Record | Question |
|---|---|
| `images.holylandphotos.org. CNAME holylandphotos.imgix.net.` | Was `images.holylandphotos.org` ever publicly used? If you don't know of any inbound links to it, drop it. If unsure, keep it — imgix is free at this traffic level. |

---

## Current state (2026-05-18)

- **Registrar:** Namecheap ✓ (transferred from AIT/DMT)
- **DNS authority:** still AIT — nameservers `ns0.nameservices.net` / `ns1.nameservices.net`. Namecheap's Advanced DNS panel is empty and prompts "Change DNS Type" to take over.
- **A record:** still `20.40.202.31` (old Azure). Live site at `holylandphotos.org` continues to work because the AIT nameservers are still authoritative and the old hosting is still up.
- **EC2:** running at `18.220.101.13`, currently reachable only as `hlp.everyphere.com`. **Not yet the production site.**

The migration is happening in two distinct phases:

1. **Phase 1 (now):** Move DNS authority from AIT to Namecheap. Site keeps serving from Azure.
2. **Phase 2 (later, on launch day):** Cut the A record over to EC2. Site moves from Azure to the Next.js rebuild.

This separation lets the DNS move happen calmly without coupling it to the launch.

## Phase 1 — DNS-only move to Namecheap (no launch yet)

Goal: site keeps working unchanged. Only the DNS authority changes.

In Namecheap → Advanced DNS, click **Change DNS Type** → BasicDNS, then add the records below with TTL 1800s (or "Automatic"). All values are exactly what's currently being served from AIT.

Confirmed against AIT cPanel on 2026-05-18 — these are exactly the records currently being served. There are also zero MX records (confirmed in the cPanel MX tab).

| Type | Host | Value |
|---|---|---|
| A | `@` | `20.40.202.31` |
| A | `www` | `20.40.202.31` |
| CNAME | `img` | `d2upgx86s50j0k.cloudfront.net.` |
| CNAME | `images` | `holylandphotos.imgix.net.` |
| CNAME | `_5844cfa84ae6b823469967641c6bf44d.img` | `_21f11cf5a9155a645e55bfaba92d5527.zzxlnyslwt.acm-validations.aws.` |
| CNAME | `awverify` | `awverify.holylandphotos.azurewebsites.net.` |
| CNAME | `*` (wildcard) | `hlp-web.azurewebsites.net.` |
| TXT | `asuid` | `D20C9D9CA7813620EB66656A7A4163EFF2D06F54ACE9DF4394E3DB1EF215BF16` |
| TXT | `google-site-verification` | `aqnxcNYOUYvx6PUTJqLnGNudbpIjAvUEeWwSxpzdQPU` |
| TXT | `@` | `hlp.azurewebsites.net.` |
| TXT | `test` | `hlptest.azurewebsites.net.` |

When re-entering in Namecheap, AIT's UI truncates long values visually. Click into each field in AIT first and copy the full value to confirm. High-risk-for-typos: the two long CNAME hash names, the `asuid=…` hex string, and the google-site-verification value.

After saving, verify in two ways:

```bash
dig NS holylandphotos.org +short          # should now show Namecheap nameservers
dig A holylandphotos.org +short           # should still return 20.40.202.31
curl -s -o /dev/null -w "%{http_code}\n" https://holylandphotos.org/   # should still be 200
```

Propagation typically completes within a few hours; can take up to 48h.

## Phase 2 — Launch the new site (cut A record to EC2)

When ready to cut over to the Next.js rebuild on EC2:

1. In Namecheap, lower the TTL on the `@` A record to 300s. Wait an hour for propagation.
2. Confirm nginx on EC2 has a valid SSL cert for `holylandphotos.org` (Let's Encrypt; can be obtained once DNS resolves to EC2, or pre-issued via DNS-01 challenge).
3. Change the `@` and `www` A records to `18.220.101.13`.
4. **Drop these records** at the same time (no longer needed once Azure is decommissioned):
   - `CNAME awverify` (Azure App Service ownership verification)
   - `CNAME *` (Azure wildcard — leaving it pointing to a dead Azure host would make every unknown subdomain fail in a confusing way)
   - `TXT @ asuid=…` (Azure stamp ID)
   - `TXT @ hlp.azurewebsites.net.` (Azure verification)
   - `TXT test hlptest.azurewebsites.net.` (Azure verification for test subdomain)
5. **Keep:**
   - Google site verification TXT (preserves Search Console ownership)
   - `img` CNAME → CloudFront (legacy inbound image URLs still work)
   - `_5844cfa84ae6b823469967641c6bf44d.img` CNAME (ACM cert validation for `img`)
   - `photos` CNAME → `d38bzcfj2cy9zm.cloudfront.net.` (new site's image CDN — every photo URL on the rebuilt site resolves through this)
   - `_dff33600efab8f56daf78b432ff19e0b.photos` CNAME (ACM cert validation for `photos`)
6. Wait for propagation, then `./scripts/qa-smoke.sh https://holylandphotos.org`.
7. Once stable for 24h, raise TTLs back to 1800s.

## Related files
- [`README.md`](../README.md) — current EC2 deployment details, IP `18.220.101.13`
- [`docs/TODO.md`](TODO.md) — the "Launch" item that triggers this
