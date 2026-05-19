"""
Batch Lighthouse audit via Google's PageSpeed Insights API.

Hits each representative URL twice (mobile + desktop), pulls the four
category scores plus the key Core Web Vitals, and writes a CSV summary.

API key handling:
  PSI's anonymous tier rate-limits aggressively (one 429 and you're
  done for a while). Get a free key at
    https://developers.google.com/speed/docs/insights/v5/get-started
  Then either pass --api-key or export PAGESPEED_API_KEY.

Output columns:
  route, strategy, performance, accessibility, best_practices, seo,
  lcp_ms, cls, inp_ms, tbt_ms, fcp_ms, speed_index_ms

Run:
  python3 scripts/lighthouse_audit.py
  python3 scripts/lighthouse_audit.py --api-key <KEY>
  python3 scripts/lighthouse_audit.py --base https://hlp.everyphere.com
"""
from __future__ import annotations

import argparse
import csv
import os
import sys
import time
from datetime import datetime, timezone

import requests

DEFAULT_BASE = "https://hlp.everyphere.com"

# One route per template, mirroring the SEO audit's coverage so that
# any regression on a template shows up here once it lands.
ROUTES = [
    "/",
    "/browse/israel",
    "/browse/capernaum",
    "/photos/TWCSSM20",
    "/search?q=jerusalem",
    "/news",
    "/news/230",
    "/pages/about-this-site",
    "/keywords/Roman",
    "/ai-search",
]

PSI_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
STRATEGIES = ("mobile", "desktop")
CATEGORIES = ("performance", "accessibility", "best-practices", "seo")


def fetch(url: str, strategy: str, api_key: str | None, retries: int = 2) -> dict | None:
    params = [("url", url), ("strategy", strategy)] + [("category", c) for c in CATEGORIES]
    if api_key:
        params.append(("key", api_key))
    for attempt in range(retries + 1):
        try:
            r = requests.get(PSI_URL, params=params, timeout=120)
            if r.status_code == 200:
                return r.json()
            print(f"  PSI {r.status_code} for {url} ({strategy}), attempt {attempt + 1}", file=sys.stderr)
            # 429 (rate limit) needs a longer backoff than transient 5xx.
            time.sleep(30 if r.status_code == 429 else 5)
            continue
        except requests.RequestException as e:
            print(f"  request error for {url} ({strategy}): {e}", file=sys.stderr)
        time.sleep(5)
    return None


def score(data: dict, key: str) -> int | None:
    s = data.get("lighthouseResult", {}).get("categories", {}).get(key, {}).get("score")
    if s is None:
        return None
    return round(s * 100)


def audit_value(data: dict, audit_id: str) -> float | None:
    v = data.get("lighthouseResult", {}).get("audits", {}).get(audit_id, {}).get("numericValue")
    return v


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default=DEFAULT_BASE)
    parser.add_argument("--out", default=f"docs/lighthouse-{datetime.now(timezone.utc):%Y%m%d}.csv")
    parser.add_argument("--routes", help="comma-separated route paths; overrides defaults")
    parser.add_argument("--api-key", default=os.environ.get("PAGESPEED_API_KEY"),
                        help="PSI API key (or set PAGESPEED_API_KEY env var). Anonymous calls rate-limit at <1/sec.")
    parser.add_argument("--delay", type=float, default=2.0,
                        help="Seconds between calls (default 2; raise on rate-limit errors)")
    args = parser.parse_args()

    routes = args.routes.split(",") if args.routes else ROUTES
    total = len(routes) * len(STRATEGIES)
    print(f"Auditing {len(routes)} routes × {len(STRATEGIES)} strategies = {total} runs against {args.base}", file=sys.stderr)
    if not args.api_key:
        print("⚠  No API key — PSI's anonymous tier may rate-limit. Get one at", file=sys.stderr)
        print("   https://developers.google.com/speed/docs/insights/v5/get-started\n", file=sys.stderr)
    print("Each call can take 30-60s while PSI runs Lighthouse server-side.\n", file=sys.stderr)

    rows = []
    i = 0
    for route in routes:
        for strategy in STRATEGIES:
            i += 1
            full_url = args.base.rstrip("/") + route
            print(f"[{i}/{total}] {strategy:>7}  {route}", file=sys.stderr)
            data = fetch(full_url, strategy, args.api_key)
            time.sleep(args.delay)
            if not data:
                rows.append({
                    "route": route, "strategy": strategy,
                    "performance": "", "accessibility": "", "best_practices": "", "seo": "",
                    "lcp_ms": "", "cls": "", "inp_ms": "", "tbt_ms": "", "fcp_ms": "", "speed_index_ms": "",
                    "error": "fetch failed",
                })
                continue
            row = {
                "route": route,
                "strategy": strategy,
                "performance": score(data, "performance"),
                "accessibility": score(data, "accessibility"),
                "best_practices": score(data, "best-practices"),
                "seo": score(data, "seo"),
                "lcp_ms": round(audit_value(data, "largest-contentful-paint") or 0),
                "cls": round(audit_value(data, "cumulative-layout-shift") or 0, 3),
                "inp_ms": round(audit_value(data, "interaction-to-next-paint") or 0),
                "tbt_ms": round(audit_value(data, "total-blocking-time") or 0),
                "fcp_ms": round(audit_value(data, "first-contentful-paint") or 0),
                "speed_index_ms": round(audit_value(data, "speed-index") or 0),
                "error": "",
            }
            rows.append(row)
            print(f"           perf={row['performance']:>3}  a11y={row['accessibility']:>3}  best={row['best_practices']:>3}  seo={row['seo']:>3}  lcp={row['lcp_ms']}ms  cls={row['cls']}", file=sys.stderr)

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\nWrote {args.out}", file=sys.stderr)

    # Pretty summary table
    print("\nSummary:\n", file=sys.stderr)
    print(f"{'route':<32} {'strategy':<7}  perf  a11y  best  seo   lcp(s)  cls", file=sys.stderr)
    print("-" * 88, file=sys.stderr)
    for r in rows:
        lcp_s = f"{r['lcp_ms'] / 1000:.1f}" if r['lcp_ms'] else "  - "
        print(
            f"{r['route'][:32]:<32} {r['strategy']:<7}  "
            f"{str(r['performance']):>4}  {str(r['accessibility']):>4}  "
            f"{str(r['best_practices']):>4}  {str(r['seo']):>4}   "
            f"{lcp_s:>5}   {r['cls']}",
            file=sys.stderr,
        )


if __name__ == "__main__":
    main()
