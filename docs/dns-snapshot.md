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
| `img.holylandphotos.org. CNAME` | `d2upgx86s50j0k.cloudfront.net.` | Legacy image CDN. The new site doesn't use it (it serves images directly from S3), but external inbound links from books, blogs, and Google Image Search reference `img.holylandphotos.org/…` URLs. Drop it and those URLs 404. |
| `_5844cfa84ae6b823469967641c6bf44d.img.holylandphotos.org. CNAME` | `_21f11cf5a9155a645e55bfaba92d5527.zzxlnyslwt.acm-validations.aws.` | AWS Certificate Manager DNS validation for the `img.` SSL cert. Required ongoing for cert auto-renewal on CloudFront. Must keep if keeping the `img` CNAME above. |

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
- **EC2:** running at `18.220.101.13`, currently reachable only as `hlp.everyphere.com`.

## Cut-over to EC2

Two viable paths. Pick based on whether you still have AIT cPanel access.

### Path A — Cut over web hosting first, switch DNS later (lowest risk)

If you still have AIT cPanel access:

1. In AIT cPanel, lower the TTL on the A record to 300s. Wait at least 1 hour.
2. In AIT cPanel, change the A record from `20.40.202.31` → `18.220.101.13`.
3. Wait for propagation (`dig A holylandphotos.org +short`), then `./scripts/qa-smoke.sh https://holylandphotos.org`.
4. Once stable, do the DNS-authority move (Path B below) at your leisure — by then EC2 is already serving the site, so you just need to keep the records identical when switching.

### Path B — Switch DNS to Namecheap and cut over EC2 in one step

If you've lost AIT cPanel access, or just want to consolidate:

1. In Namecheap → Advanced DNS, click **Change DNS Type** → BasicDNS.
2. Add all KEEP and REPLACE records below in one batch, with TTL 300s:
   - `A holylandphotos.org → 18.220.101.13`
   - `A www holylandphotos.org → 18.220.101.13` (or CNAME → `holylandphotos.org.`)
   - `TXT holylandphotos.org → google-site-verification=aqnxcNYOUYvx6PUTJqLnGNudbpIjAvUEeWwSxpzdQPU`
   - `CNAME img → d2upgx86s50j0k.cloudfront.net.`
   - `CNAME _5844cfa84ae6b823469967641c6bf44d.img → _21f11cf5a9155a645e55bfaba92d5527.zzxlnyslwt.acm-validations.aws.`
3. Confirm nginx on EC2 has a valid SSL cert for `holylandphotos.org` (Let's Encrypt; can be obtained once DNS resolves to EC2).
4. Wait for propagation, then `./scripts/qa-smoke.sh https://holylandphotos.org`.
5. Once stable for 24h, raise TTLs to 3600s.

During the propagation window in Path B, some resolvers still see AIT's nameservers (and the old Azure A record), others see Namecheap (and EC2). Both should serve a working version of the site, so no user-visible outage.

## Related files
- [`README.md`](../README.md) — current EC2 deployment details, IP `18.220.101.13`
- [`docs/TODO.md`](TODO.md) — the "Launch" item that triggers this
