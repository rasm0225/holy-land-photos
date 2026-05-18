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
*Not captured. Verify in the AIT panel before transfer — see "Open questions" below.*

### MailChimp deliverability records (DKIM / SPF / DMARC)
*Not captured. Verify in the AIT panel before transfer — see "Open questions" below.*

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

### VERIFY / OPEN QUESTIONS (must resolve before AIT panel access is lost)

| Record | Question | Action |
|---|---|---|
| `images.holylandphotos.org. CNAME holylandphotos.imgix.net.` | Was `images.holylandphotos.org` ever publicly used? If you don't know of any inbound links to it, drop it. If unsure, keep it — imgix is free at this traffic level. | Decide. |
| **MX records** | Is `@holylandphotos.org` email used? If so, MX records must come over. Losing them silently breaks email. | Pull from AIT and add to "KEEP" list. |
| **MailChimp DKIM / SPF / DMARC** | If MailChimp sends from `@holylandphotos.org`, there are usually 2-4 records named like `k1._domainkey.`, `k2._domainkey.`, an SPF TXT, and `_dmarc.` These are not always publicly visible via `dig` because they're often on the apex SPF record or on selector subdomains MailChimp gave you. | Pull from AIT and add to "KEEP" list. Without them, newsletter deliverability tanks. |

---

## Cut-over order (when ready to launch)

1. Confirm Namecheap shows the domain (transfer complete).
2. Confirm all KEEP / REPLACE records above are entered in Namecheap **with their TTLs set short** (300s) for the cut-over.
3. Confirm nginx on EC2 has the SSL cert for `holylandphotos.org` ready (Let's Encrypt; can pre-issue once DNS resolves to EC2).
4. Flip the A record to `18.220.101.13`.
5. Smoke-test: `./scripts/qa-smoke.sh https://holylandphotos.org`
6. Once stable for 24h, raise TTLs back to a reasonable default (3600s).

## Related files
- [`README.md`](../README.md) — current EC2 deployment details, IP `18.220.101.13`
- [`docs/TODO.md`](TODO.md) — the "Launch" item that triggers this
