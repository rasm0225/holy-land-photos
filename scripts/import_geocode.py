"""
Import the enriched geocode CSV into the sections table.

For each row, decide the best candidate coordinates and the initial review
status, then UPDATE the section. Idempotent — re-running with the same
input produces the same result.

Decision tree:
  1. Wikidata "high" confidence    → status=approved, source=wikidata.
                                      Auto-approved — sample held at 100%
                                      accuracy on this tier; user can still
                                      filter to "approved" and unapprove if
                                      anything looks off.
  2. LLM said not_a_single_point   → status=excluded, no coords,
                                      source=llm. User confirms.
  3. LLM "high" or "medium"        → use LLM coords, status=pending,
                                      source=llm. User reviews.
  4. Pass 1/2 had ANY coords       → use them, status=pending,
                                      source=wikidata|nominatim.
  5. Nothing usable                → status=needs_research, no coords.

Safety: this script only UPDATEs rows whose current geo_review_status
is 'pending'. Rows you have already approved/excluded/marked-for-research
in the admin will NOT be clobbered by a re-run.

Run:
  python3 scripts/import_geocode.py             # dry-run, prints summary
  python3 scripts/import_geocode.py --apply     # actually UPDATEs the DB
"""
from __future__ import annotations

import argparse
import csv
import sqlite3
import sys
from collections import Counter

INPUT_CSV = "docs/site-geocode-enriched.csv"
DB_PATH = "data/payload.db"


def decide(row: dict) -> dict:
    """Return {lat, lon, status, source, notes} for one CSV row."""
    conf = row.get("confidence", "").strip()
    src = row.get("source", "").strip()
    llm_conf = row.get("llm_confidence", "").strip()
    llm_excluded = row.get("llm_excluded", "").strip()

    # 1. Wikidata high — trust it. Auto-approve.
    if conf == "high" and row["lat"] and row["lon"]:
        return {
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "status": "approved",
            "source": src or "wikidata",
            "notes": row.get("notes", "")[:500],
        }

    # 2. LLM explicitly excluded
    if llm_excluded == "not_a_single_point":
        return {
            "lat": None,
            "lon": None,
            "status": "excluded",
            "source": "llm",
            "notes": row.get("llm_notes", "")[:500],
        }

    # 3a. LLM high — auto-approve. Sample accuracy was strong (the description
    # text usually anchors the location precisely). The occasional hallucination
    # like Garden Tomb's wrong latitude is the user-spot-check trade-off.
    if llm_conf == "high" and row.get("llm_lat") and row.get("llm_lon"):
        return {
            "lat": float(row["llm_lat"]),
            "lon": float(row["llm_lon"]),
            "status": "approved",
            "source": "llm",
            "notes": row.get("llm_notes", "")[:500],
        }

    # 3b. LLM medium — leave pending for manual review.
    if llm_conf == "medium" and row.get("llm_lat") and row.get("llm_lon"):
        return {
            "lat": float(row["llm_lat"]),
            "lon": float(row["llm_lon"]),
            "status": "pending",
            "source": "llm",
            "notes": row.get("llm_notes", "")[:500],
        }

    # 4. Fall back to whatever Pass 1/2 had
    if row["lat"] and row["lon"]:
        return {
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "status": "pending",
            "source": src or "wikidata",
            "notes": row.get("notes", "")[:500],
        }

    # 5. Nothing usable
    return {
        "lat": None,
        "lon": None,
        "status": "needs_research",
        "source": "",
        "notes": (row.get("llm_notes") or row.get("notes") or "no candidate")[:500],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Actually UPDATE the DB. Default is dry-run.")
    parser.add_argument("--db", default=DB_PATH)
    parser.add_argument("--input", default=INPUT_CSV)
    args = parser.parse_args()

    with open(args.input) as f:
        rows = list(csv.DictReader(f))
    print(f"Read {len(rows)} rows from {args.input}", file=sys.stderr)

    decisions = []
    by_status = Counter()
    by_source = Counter()
    for r in rows:
        d = decide(r)
        decisions.append((int(r["id"]), r["title"], d))
        by_status[d["status"]] += 1
        by_source[d["source"] or "(none)"] += 1

    print("\nDecision summary:", file=sys.stderr)
    print("  By status:", file=sys.stderr)
    for s, n in by_status.most_common():
        print(f"    {s:>16}: {n}", file=sys.stderr)
    print("  By source (for non-excluded):", file=sys.stderr)
    for s, n in by_source.most_common():
        print(f"    {s:>16}: {n}", file=sys.stderr)

    if not args.apply:
        print("\nDry-run; pass --apply to actually update the DB.", file=sys.stderr)
        # Print a few example rows so user can sanity check
        print("\nSample of 10 decisions:", file=sys.stderr)
        for sid, title, d in decisions[:10]:
            coord = f"{d['lat']:.4f},{d['lon']:.4f}" if d['lat'] is not None else "(no coords)"
            print(f"  [{sid}] {title[:40]:<40} {d['status']:>16} {d['source']:>10} {coord}", file=sys.stderr)
        return

    conn = sqlite3.connect(args.db)
    cur = conn.cursor()
    n = 0
    skipped = 0
    for sid, _title, d in decisions:
        # Only touch rows that haven't been manually reviewed yet. Re-running
        # this script after the reviewer has clicked through some sites
        # must not undo their work.
        cur.execute(
            """
            UPDATE sections
            SET latitude = ?, longitude = ?, geo_review_status = ?,
                geo_source = ?, geo_notes = ?
            WHERE id = ? AND geo_review_status = 'pending'
            """,
            (d["lat"], d["lon"], d["status"], d["source"], d["notes"], sid),
        )
        if cur.rowcount > 0:
            n += cur.rowcount
        else:
            skipped += 1
    conn.commit()
    conn.close()
    print(f"\nApplied {n} updates ({skipped} skipped — already reviewed).", file=sys.stderr)


if __name__ == "__main__":
    main()
