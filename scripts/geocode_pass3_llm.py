"""
Pass 3 — LLM-assisted geocoding for sites with low / no confidence after
Wikidata + Nominatim. Uses the site's stored description text (html_body),
which usually contains explicit geographic anchors like
  "located west of the Old City of Jerusalem, just east (below) the King David Hotel"
to nail the location precisely. Results are validated against a country
bounding box.

Reads:  docs/site-geocode.csv
Writes: docs/site-geocode-enriched.csv (adds llm_lat, llm_lon,
        llm_confidence, llm_notes, llm_excluded)

Only sites with existing confidence in {medium, low, none} get sent
through. High-confidence Wikidata matches are skipped (already trusted
at 100% on the sample).
"""
from __future__ import annotations

import csv
import json
import os
import re
import sqlite3
import sys
import time

import anthropic

MODEL = "claude-haiku-4-5"
INPUT_CSV = "docs/site-geocode.csv"
OUTPUT_CSV = "docs/site-geocode-enriched.csv"
DB_PATH = "data/payload.db"

# Conservative bounding boxes (south, west, north, east) for the 12 countries.
COUNTRY_BBOX = {
    "Israel":   (29.5, 34.2, 33.4, 35.95),
    "Turkey":   (35.8, 25.6, 42.1, 44.85),
    "Greece":   (34.8, 19.3, 41.75, 29.75),
    "Jordan":   (29.18, 34.9, 33.4, 39.35),
    "Lebanon":  (33.0, 35.0, 34.75, 36.7),
    "Italy":    (35.4, 6.6, 47.1, 18.6),
    "Cyprus":   (34.55, 32.25, 35.75, 34.6),
    "Egypt":    (21.7, 24.6, 31.75, 37.0),
    "Syria":    (32.3, 35.6, 37.35, 42.4),
    "Albania":  (39.6, 19.25, 42.7, 21.1),
    "Malta":    (35.7, 14.1, 36.1, 14.6),
    "France":   (41.3, -5.2, 51.15, 9.65),
}

SYSTEM_PROMPT = """You are helping geocode archaeological, biblical, and historic sites for a photography website (HolyLandPhotos.org). For each site, you are given its title, parent ancestry, country, an existing geocoder candidate (if any), and a description.

Your job: return precise WGS84 latitude/longitude for the location the description and title refer to.

Rules:
- The coordinates MUST fall within the country specified.
- Prefer specific textual clues in the description over your prior knowledge of the title alone — descriptions often contain explicit anchors like "located west of the Old City" or grid references.
- If the description refers to a general region rather than a single point (e.g. "Views of the Sea of Galilee", a panorama, a multi-site overview), set not_a_single_point=true and skip coordinates.
- If you genuinely cannot determine a location, set confidence="unknown" and skip coordinates. Do not guess.
- High confidence = description gives unambiguous anchor, OR the title is a famous singular site you are certain about.
- Medium confidence = the location is reasonably clear but might be off by a few hundred meters.
- Low confidence = guessing within the right region but the specific site isn't confirmed.

Return ONLY a JSON object with this schema, no other text:
{
  "lat": number | null,
  "lon": number | null,
  "confidence": "high" | "medium" | "low" | "unknown",
  "not_a_single_point": boolean,
  "reasoning": "one short sentence"
}"""


def strip_html(s: str | None) -> str:
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&[a-z]+;", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def load_descriptions(db_path: str, ids: list[int]) -> dict[int, str]:
    if not ids:
        return {}
    conn = sqlite3.connect(db_path)
    placeholders = ",".join("?" * len(ids))
    rows = conn.execute(
        f"SELECT id, html_body FROM sections WHERE id IN ({placeholders})",
        ids,
    ).fetchall()
    conn.close()
    return {r[0]: strip_html(r[1]) for r in rows}


def in_bbox(country: str, lat: float, lon: float) -> bool:
    bbox = COUNTRY_BBOX.get(country)
    if not bbox:
        return True  # unknown country — skip validation
    south, west, north, east = bbox
    return south <= lat <= north and west <= lon <= east


def ask_llm(client: anthropic.Anthropic, row: dict, description: str) -> dict:
    existing = ""
    if row["lat"] and row["lon"]:
        existing = f"Existing candidate: {row['lat']}, {row['lon']} (source={row['source']}, confidence={row['confidence']}) — {row['notes']}"
    else:
        existing = "Existing candidate: none — no previous match."

    user_msg = f"""Title: {row['title']}
Country: {row['country']}
Ancestry: {row['ancestry']}
{existing}

Description: {description if description else '(no description text on file)'}"""

    resp = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_msg}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text").strip()
    # Strip code fences if model wrapped the JSON
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"lat": None, "lon": None, "confidence": "unknown",
                "not_a_single_point": False,
                "reasoning": f"parse error: {text[:120]}"}


def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    with open(INPUT_CSV) as f:
        rows = list(csv.DictReader(f))
    print(f"Loaded {len(rows)} rows from {INPUT_CSV}", file=sys.stderr)

    targets = [r for r in rows if r["confidence"] in {"medium", "low", "none"}]
    print(f"Targeting {len(targets)} medium/low/none rows for Pass 3", file=sys.stderr)

    descriptions = load_descriptions(DB_PATH, [int(r["id"]) for r in targets])
    with_desc = sum(1 for r in targets if descriptions.get(int(r["id"])))
    print(f"  {with_desc}/{len(targets)} have description text", file=sys.stderr)

    client = anthropic.Anthropic()

    new_cols = ["llm_lat", "llm_lon", "llm_confidence", "llm_notes", "llm_excluded"]
    for r in rows:
        for c in new_cols:
            r.setdefault(c, "")

    by_target = {int(r["id"]): r for r in targets}
    for i, (sid, r) in enumerate(by_target.items(), 1):
        desc = descriptions.get(sid, "")
        try:
            out = ask_llm(client, r, desc)
        except Exception as e:
            print(f"[{i}/{len(by_target)}] {r['title']} — error: {e}", file=sys.stderr)
            r["llm_notes"] = f"error: {e}"
            continue

        # Truncate "not a single point" first
        if out.get("not_a_single_point"):
            r["llm_excluded"] = "not_a_single_point"
            r["llm_confidence"] = "excluded"
            r["llm_notes"] = out.get("reasoning", "")[:200]
            print(f"[{i}/{len(by_target)}] {r['title']} — EXCLUDED ({out.get('reasoning', '')[:80]})", file=sys.stderr)
            continue

        if out.get("confidence") == "unknown" or out.get("lat") is None:
            r["llm_confidence"] = "unknown"
            r["llm_notes"] = out.get("reasoning", "")[:200]
            print(f"[{i}/{len(by_target)}] {r['title']} — UNKNOWN", file=sys.stderr)
            continue

        try:
            lat = float(out["lat"])
            lon = float(out["lon"])
        except (TypeError, ValueError):
            r["llm_confidence"] = "unknown"
            r["llm_notes"] = "non-numeric coords from llm"
            continue

        if not in_bbox(r["country"], lat, lon):
            r["llm_confidence"] = "bbox_fail"
            r["llm_notes"] = f"coords {lat:.4f},{lon:.4f} outside {r['country']} bbox; reasoning: {out.get('reasoning', '')[:120]}"
            print(f"[{i}/{len(by_target)}] {r['title']} — BBOX FAIL ({lat:.4f},{lon:.4f})", file=sys.stderr)
            continue

        r["llm_lat"] = f"{lat:.6f}"
        r["llm_lon"] = f"{lon:.6f}"
        r["llm_confidence"] = out.get("confidence", "low")
        r["llm_notes"] = out.get("reasoning", "")[:200]
        if i % 10 == 0 or i <= 5:
            print(f"[{i}/{len(by_target)}] {r['title']} → {lat:.4f},{lon:.4f} ({r['llm_confidence']})", file=sys.stderr)

    fieldnames = list(rows[0].keys())
    with open(OUTPUT_CSV, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    from collections import Counter
    cnt = Counter(r["llm_confidence"] for r in targets)
    print(f"\nWrote {OUTPUT_CSV}", file=sys.stderr)
    print("LLM pass results:", file=sys.stderr)
    for k, v in cnt.most_common():
        print(f"  {k or '(blank)':>12}: {v}", file=sys.stderr)


if __name__ == "__main__":
    main()
