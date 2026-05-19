"""
Geocode archaeological sites from the sections collection.

Pass 1: Wikidata wbsearchentities + wbgetentities
  - For each generated name variant, search Wikidata for candidate items.
  - Filter candidates by country (P17 == expected country Q-number).
  - Prefer candidates that are archaeological sites / settlements / places.
  - Pick the highest-scoring candidate; record its coords.

Pass 2: Nominatim (OpenStreetMap)
  - For sites Wikidata didn't resolve, query Nominatim with "<title>, <country>".
  - Rate-limited to 1 req/sec per Nominatim usage policy.

Output: CSV with columns
  id, slug, title, country, ancestry, lat, lon, source, confidence, wikidata_id, notes

Run:
  python3 scripts/geocode_sites.py --sample sample_ids.txt --out docs/site-geocode-sample.csv
  python3 scripts/geocode_sites.py --all                     --out docs/site-geocode.csv
"""
from __future__ import annotations

import argparse
import csv
import os
import re
import sqlite3
import sys
import time
from dataclasses import dataclass
from typing import Iterable

import requests

WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "holylandphotos-geocoder/1.0 (contact: holylandphotos@gmail.com)"

COUNTRY_QIDS = {
    "Israel": "Q801",
    "Turkey": "Q43",
    "Greece": "Q41",
    "Jordan": "Q810",
    "Lebanon": "Q822",
    "Italy": "Q38",
    "Cyprus": "Q229",
    "Egypt (3 folders)": "Q79",
    "Syria": "Q858",
    "Albania": "Q222",
    "Malta": "Q233",
    "France": "Q142",
}

# ISO 3166-1 alpha-2 codes for the Nominatim countrycodes filter
COUNTRY_ISO = {
    "Israel": "il",
    "Turkey": "tr",
    "Greece": "gr",
    "Jordan": "jo",
    "Lebanon": "lb",
    "Italy": "it",
    "Cyprus": "cy",
    "Egypt (3 folders)": "eg",
    "Syria": "sy",
    "Albania": "al",
    "Malta": "mt",
    "France": "fr",
}

# Wikidata Q-numbers of the country entities themselves. Match these and we
# matched the country rather than a specific place inside it — reject.
COUNTRY_ENTITY_QIDS = {qid for qid in COUNTRY_QIDS.values()}

# Wikidata classes that indicate the entity *is* a country/region rather than
# a place inside one. Reject candidates whose only place-class is one of these.
GENERIC_REGION_CLASSES = {
    "Q6256",      # country
    "Q3624078",   # sovereign state
    "Q5107",      # continent
    "Q82794",     # geographic region
    "Q1620908",   # historical region
    "Q3257686",   # administrative territorial entity
}
COUNTRY_NORMALIZED = {
    "Israel": "Israel",
    "Turkey": "Turkey",
    "Greece": "Greece",
    "Jordan": "Jordan",
    "Lebanon": "Lebanon",
    "Italy": "Italy",
    "Cyprus": "Cyprus",
    "Egypt (3 folders)": "Egypt",
    "Syria": "Syria",
    "Albania": "Albania",
    "Malta": "Malta",
    "France": "France",
}

# Wikidata "instance of" classes that look like real-world places we'd accept.
# Tier 1 (high confidence): archaeological / historic places.
PLACE_CLASSES_HIGH = {
    "Q839954",   # archaeological site
    "Q570116",   # tourist attraction (often used for ruins)
    "Q12876",    # tell (archaeological mound)
    "Q35112127", # ancient city
    "Q2065736",  # cultural property
    "Q1081138",  # archaeological park
    "Q19953632", # former settlement
    "Q15661340", # ancient settlement
}
# Tier 2 (acceptable): general settlements and physical places.
PLACE_CLASSES_OK = {
    "Q486972",   # human settlement
    "Q515",      # city
    "Q3957",     # town
    "Q532",      # village
    "Q44613",    # monastery
    "Q16970",    # church building
    "Q33506",    # museum
    "Q23413",    # castle
    "Q161680",   # mountain pass
    "Q22698",    # park
    "Q4022",     # river
    "Q23397",    # lake
    "Q35509",    # cave
    "Q39614",    # cemetery
    "Q179700",   # statue
    "Q5341295",  # educational organization
    "Q24398318", # religious building
    "Q839954",   # archaeological site (also in HIGH)
}


@dataclass
class SiteRow:
    id: int
    slug: str
    title: str
    country: str
    ancestry: str


def load_sites(db_path: str, ids: list[int] | None) -> list[SiteRow]:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    # Find each leaf site's country via ancestry walk
    rows = conn.execute(
        """
        WITH RECURSIVE ancestry AS (
          SELECT id, parent_id, title, slug, id AS site_id, title AS site_title, slug AS site_slug
          FROM sections WHERE section_type='site' AND published != 0
          UNION ALL
          SELECT s.id, s.parent_id, s.title, s.slug, a.site_id, a.site_title, a.site_slug
          FROM sections s JOIN ancestry a ON s.id = a.parent_id
        ),
        country_lookup AS (
          SELECT site_id, title AS country FROM ancestry
          WHERE id IN (2,3,4,197,211,269,419,499,503,3612,3653,3705)
        ),
        path AS (
          SELECT site_id, GROUP_CONCAT(title, ' / ') AS p FROM (
            SELECT site_id, title FROM ancestry WHERE id != site_id ORDER BY site_id, id DESC
          ) GROUP BY site_id
        )
        SELECT s.id, s.slug, s.title, cl.country, p.p AS ancestry
        FROM sections s
        JOIN country_lookup cl ON cl.site_id = s.id
        LEFT JOIN path p ON p.site_id = s.id
        WHERE s.section_type='site' AND s.published != 0
        """
    ).fetchall()
    conn.close()
    sites = [SiteRow(r["id"], r["slug"], r["title"], r["country"], r["ancestry"] or "") for r in rows]
    if ids:
        idset = set(ids)
        sites = [s for s in sites if s.id in idset]
        # preserve original input order
        order = {i: idx for idx, i in enumerate(ids)}
        sites.sort(key=lambda s: order.get(s.id, 1e9))
    return sites


def name_variants(title: str) -> list[str]:
    """Produce reasonable lookup variants for a site title.

    Examples:
      "Masada: Bath, Storerooms, and Headquarters" -> ["Masada"]
      "Avdat (Oboda)"                              -> ["Avdat", "Oboda"]
      "Attalia/Antalya"                            -> ["Attalia", "Antalya"]
      "Andriace (Andriake)"                        -> ["Andriace", "Andriake"]
      "Megiddo (Israelite)"                        -> ["Megiddo"]
      "Tomb of Cicero — Formia"                    -> ["Tomb of Cicero", "Formia"]
      "Ephesus Upper City"                         -> ["Ephesus Upper City", "Ephesus"]
    """
    out: list[str] = []
    t = title.strip()

    # Strip everything after a colon (often a sub-area description)
    if ":" in t:
        head = t.split(":", 1)[0].strip()
        out.append(head)

    # Em-dash separated parts: "Tomb of Cicero — Formia"
    if "—" in t:
        for part in t.split("—"):
            out.append(part.strip())

    # Parenthetical alternates: "Avdat (Oboda)"
    m = re.match(r"^(.+?)\s*\(([^)]+)\)\s*$", t)
    if m:
        out.append(m.group(1).strip())
        # only add the parenthetical alt if it looks like a place-name alternate
        inner = m.group(2).strip()
        if len(inner) <= 30 and re.search(r"[A-Za-z]", inner):
            out.append(inner)

    # Slash-separated alternates: "Attalia/Antalya"
    if "/" in t:
        for part in t.split("/"):
            out.append(part.strip())

    # Try first word too if multi-word ("Ephesus Upper City" -> "Ephesus")
    parts = re.split(r"\s+", re.sub(r"[(),:/—]", " ", t))
    if len(parts) >= 2 and len(parts[0]) >= 3:
        out.append(parts[0])

    # Always include the full title
    out.append(t)

    # De-dup, preserve order, drop blanks
    seen = set()
    uniq = []
    for v in out:
        v = re.sub(r"\s+", " ", v).strip()
        if v and v.lower() not in seen:
            seen.add(v.lower())
            uniq.append(v)
    return uniq


def wikidata_search(session: requests.Session, query: str, limit: int = 8) -> list[str]:
    r = session.get(
        WIKIDATA_API,
        params={
            "action": "wbsearchentities",
            "search": query,
            "language": "en",
            "format": "json",
            "type": "item",
            "limit": limit,
        },
        timeout=15,
    )
    r.raise_for_status()
    data = r.json()
    return [item["id"] for item in data.get("search", [])]


def wikidata_get_entities(session: requests.Session, qids: list[str]) -> dict:
    if not qids:
        return {}
    r = session.get(
        WIKIDATA_API,
        params={
            "action": "wbgetentities",
            "ids": "|".join(qids),
            "props": "claims|labels|descriptions",
            "languages": "en",
            "format": "json",
        },
        timeout=15,
    )
    r.raise_for_status()
    return r.json().get("entities", {})


def extract_claims(entity: dict, prop: str) -> list:
    return entity.get("claims", {}).get(prop, [])


def first_qid(claim_list: list) -> str | None:
    for c in claim_list:
        try:
            return c["mainsnak"]["datavalue"]["value"]["id"]
        except (KeyError, TypeError):
            continue
    return None


def all_qids(claim_list: list) -> list[str]:
    out = []
    for c in claim_list:
        try:
            out.append(c["mainsnak"]["datavalue"]["value"]["id"])
        except (KeyError, TypeError):
            continue
    return out


def coords_from_entity(entity: dict) -> tuple[float, float] | None:
    for c in extract_claims(entity, "P625"):
        try:
            v = c["mainsnak"]["datavalue"]["value"]
            return float(v["latitude"]), float(v["longitude"])
        except (KeyError, TypeError, ValueError):
            continue
    return None


def score_candidate(entity: dict, expected_country_qid: str, entity_qid: str) -> tuple[int, str]:
    """Return (score, reason). Higher score = better match."""
    countries = all_qids(extract_claims(entity, "P17"))
    classes = set(all_qids(extract_claims(entity, "P31")))
    has_coord = bool(coords_from_entity(entity))

    if not has_coord:
        return -1, "no coordinates"
    if expected_country_qid not in countries and countries:
        return -2, f"country mismatch ({countries[0]} vs {expected_country_qid})"
    # Reject matching the country/region itself as a "place" — too generic.
    if entity_qid in COUNTRY_ENTITY_QIDS:
        return -3, "matched the country entity itself"
    if classes and classes.issubset(GENERIC_REGION_CLASSES):
        return -3, "matched a generic region (country/continent)"

    score = 0
    if classes & PLACE_CLASSES_HIGH:
        score += 10
    elif classes & PLACE_CLASSES_OK:
        score += 5
    else:
        score += 1

    if expected_country_qid in countries:
        score += 3

    reasons = []
    if classes & PLACE_CLASSES_HIGH:
        reasons.append("archaeological/historic class")
    elif classes & PLACE_CLASSES_OK:
        reasons.append("place class")
    if expected_country_qid in countries:
        reasons.append("country match")
    return score, "; ".join(reasons) or "no reason"


def try_wikidata(session: requests.Session, site: SiteRow) -> dict | None:
    expected_country_qid = COUNTRY_QIDS.get(site.country)
    if not expected_country_qid:
        return None

    seen_qids: set[str] = set()
    candidates: list[str] = []
    for variant in name_variants(site.title):
        try:
            ids = wikidata_search(session, variant, limit=6)
        except Exception as e:
            print(f"  wikidata search error for '{variant}': {e}", file=sys.stderr)
            continue
        for q in ids:
            if q not in seen_qids:
                seen_qids.add(q)
                candidates.append(q)
        time.sleep(0.2)
        if len(candidates) >= 15:
            break

    if not candidates:
        return None

    try:
        entities = wikidata_get_entities(session, candidates[:25])
    except Exception as e:
        print(f"  wikidata get error: {e}", file=sys.stderr)
        return None

    best: tuple[int, str, dict, str] | None = None
    for qid, entity in entities.items():
        score, reason = score_candidate(entity, expected_country_qid, qid)
        if best is None or score > best[0]:
            best = (score, qid, entity, reason)

    if best is None or best[0] <= 0:
        return None

    coords = coords_from_entity(best[2])
    if not coords:
        return None

    label = best[2].get("labels", {}).get("en", {}).get("value", best[1])
    desc = best[2].get("descriptions", {}).get("en", {}).get("value", "")

    confidence = "high" if best[0] >= 13 else ("medium" if best[0] >= 8 else "low")
    return {
        "lat": coords[0],
        "lon": coords[1],
        "source": "wikidata",
        "confidence": confidence,
        "wikidata_id": best[1],
        "notes": f"matched '{label}' ({desc}) — {best[3]}",
    }


def try_nominatim(session: requests.Session, site: SiteRow) -> dict | None:
    country = COUNTRY_NORMALIZED.get(site.country, site.country)
    iso = COUNTRY_ISO.get(site.country)
    queries = [f"{v}, {country}" for v in name_variants(site.title)[:3]]
    for q in queries:
        params = {"q": q, "format": "json", "limit": 1, "addressdetails": 1}
        if iso:
            params["countrycodes"] = iso
        try:
            r = session.get(
                NOMINATIM,
                params=params,
                headers={"User-Agent": USER_AGENT},
                timeout=15,
            )
            r.raise_for_status()
            results = r.json()
        except Exception as e:
            print(f"  nominatim error for '{q}': {e}", file=sys.stderr)
            time.sleep(1.1)
            continue
        time.sleep(1.1)  # respect 1 req/sec policy
        if results:
            res = results[0]
            return {
                "lat": float(res["lat"]),
                "lon": float(res["lon"]),
                "source": "nominatim",
                "confidence": "low",
                "wikidata_id": "",
                "notes": f"matched '{res.get('display_name', '')[:120]}'",
            }
    return None


def geocode_site(session: requests.Session, site: SiteRow) -> dict:
    res = try_wikidata(session, site)
    if res:
        return res
    res = try_nominatim(session, site)
    if res:
        return res
    return {
        "lat": "",
        "lon": "",
        "source": "",
        "confidence": "none",
        "wikidata_id": "",
        "notes": "no match",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default="data/payload.db")
    parser.add_argument("--sample", help="Path to file with one site id per line")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    if not args.sample and not args.all:
        parser.error("Need --sample <file> or --all")

    ids = None
    if args.sample:
        with open(args.sample) as f:
            ids = [int(x.strip()) for x in f if x.strip() and not x.strip().startswith("#")]

    sites = load_sites(args.db, ids)
    print(f"Geocoding {len(sites)} sites…", file=sys.stderr)

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    rows = []
    for i, s in enumerate(sites, 1):
        print(f"[{i}/{len(sites)}] {s.title} ({s.country})", file=sys.stderr)
        result = geocode_site(session, s)
        rows.append({
            "id": s.id,
            "slug": s.slug,
            "title": s.title,
            "country": COUNTRY_NORMALIZED.get(s.country, s.country),
            "ancestry": s.ancestry,
            "lat": result["lat"],
            "lon": result["lon"],
            "source": result["source"],
            "confidence": result["confidence"],
            "wikidata_id": result["wikidata_id"],
            "notes": result["notes"],
        })

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    # Summary
    by_source: dict[str, int] = {}
    for r in rows:
        by_source[r["source"] or "unresolved"] = by_source.get(r["source"] or "unresolved", 0) + 1
    print(f"\nWrote {args.out}", file=sys.stderr)
    print("By source: " + ", ".join(f"{k}={v}" for k, v in sorted(by_source.items())), file=sys.stderr)


if __name__ == "__main__":
    main()
