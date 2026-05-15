#!/usr/bin/env python3
"""
Repair `photos.created_at` and `photos.updated_at` from the original
`image_DateAdded` / `image_LastModified` columns in the legacy ASP CSV.

The first migration silently fell back to "now" for every row because the
ASP date format (`M/D/YYYY H:MM:SS[AM|PM]`) didn't match what `parse_date`
expected. As a result every photo currently shows a 2026 created_at, even
though the real range is 2001-2026.

Usage:
    python3 scripts/repair_photo_dates.py --dry-run   # preview
    python3 scripts/repair_photo_dates.py             # apply
"""

import csv
import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT / ".env"
CSV_PATH = ROOT / "archive" / "dbo.holylandphotos_Images.csv"

# ASP exports use 12-hour time with no space before AM/PM (e.g. "8:20:00AM").
ASP_DATE_FORMAT = "%m/%d/%Y %I:%M:%S%p"


def load_env():
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, val = line.split("=", 1)
            os.environ.setdefault(key.strip(), val.strip())


def open_db():
    db_url = os.environ["DATABASE_URL"]
    if not db_url.startswith("file:"):
        raise SystemExit("This script only supports file: DATABASE_URL.")
    path = db_url[len("file:"):]
    if not path.startswith("/"):
        path = str(ROOT / path.lstrip("./"))
    return sqlite3.connect(path)


def parse_asp(date_str: str):
    if not date_str or not date_str.strip():
        return None
    try:
        return datetime.strptime(date_str.strip(), ASP_DATE_FORMAT)
    except ValueError:
        return None


def to_iso(dt: datetime) -> str:
    # Match Payload's existing format: 2026-03-31T03:07:42.913Z
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def main():
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("=== DRY RUN MODE — no changes will be made ===\n")

    load_env()
    if not CSV_PATH.exists():
        raise SystemExit(f"CSV not found: {CSV_PATH}")

    csv_dates = {}
    bad_dates = 0
    with CSV_PATH.open(encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            image_id = row["image_ID"].strip()
            if not image_id:
                continue
            created = parse_asp(row.get("image_DateAdded", ""))
            updated = parse_asp(row.get("image_LastModified", ""))
            if created is None and row.get("image_DateAdded", "").strip():
                bad_dates += 1
            csv_dates[image_id] = (created, updated)

    print(f"CSV: {len(csv_dates)} rows, {bad_dates} unparseable DateAdded values")

    db = open_db()
    db_rows = db.execute("SELECT image_id, created_at FROM photos").fetchall()
    print(f"DB:  {len(db_rows)} photos")

    matched = 0
    missing = 0
    will_update = 0
    will_skip_unchanged = 0
    samples = []

    for image_id, current_created in db_rows:
        if image_id not in csv_dates:
            missing += 1
            continue
        matched += 1
        created, updated = csv_dates[image_id]
        if created is None:
            continue
        new_created = to_iso(created)
        if new_created == current_created:
            will_skip_unchanged += 1
            continue
        will_update += 1
        if len(samples) < 5:
            samples.append((image_id, current_created, new_created))
        if not dry_run:
            new_updated = to_iso(updated) if updated else new_created
            db.execute(
                "UPDATE photos SET created_at = ?, updated_at = ? WHERE image_id = ?",
                (new_created, new_updated, image_id),
            )

    if not dry_run:
        db.commit()

    print()
    print(f"Matched (CSV ↔ DB): {matched}")
    print(f"In DB but not CSV:  {missing}")
    print(f"Already correct:    {will_skip_unchanged}")
    print(f"{'Would update' if dry_run else 'Updated'}:       {will_update}")

    if samples:
        print("\nSample changes:")
        for image_id, before, after in samples:
            print(f"  {image_id}: {before} → {after}")


if __name__ == "__main__":
    main()
