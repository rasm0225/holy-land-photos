#!/usr/bin/env python3
"""
Backfill sections.legacy_old_id from archive/dbo.holylandphotos_Sections.csv.

The old ASP site exposed two ID systems in its URLs:
  - section_ID  (the modern primary key, preserved during migration as
    sections.id)
  - section_Old_ID  (an earlier ID, used by /browse.asp?SiteID= and
    /browse.asp?SubRegionID= URLs)

Only section_ID was carried over. This script reads the archive CSV and
populates legacy_old_id on each section whose new id matches section_ID.

Idempotent. Skips rows whose section_Old_ID is blank or 0.

Usage:
    python3 scripts/backfill_legacy_old_id.py --dry-run
    python3 scripts/backfill_legacy_old_id.py
"""

import csv
import os
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT / ".env"
CSV_PATH = ROOT / "archive" / "dbo.holylandphotos_Sections.csv"


def load_env():
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, val = line.split("=", 1)
            os.environ.setdefault(key.strip(), val.strip())


def open_db():
    load_env()
    db_url = os.environ["DATABASE_URL"]
    if db_url.startswith("file:"):
        path = db_url[len("file:"):]
        if not path.startswith("/"):
            path = str(ROOT / path.lstrip("./"))
        return sqlite3.connect(path)

    import libsql_experimental as libsql
    db = libsql.connect(
        "hlp-backfill",
        sync_url=db_url,
        auth_token=os.environ["DATABASE_AUTH_TOKEN"],
    )
    db.sync()
    return db


def read_mapping():
    mapping = []
    with CSV_PATH.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                section_id = int(row["section_ID"])
            except (KeyError, ValueError):
                continue
            old_raw = (row.get("section_Old_ID") or "").strip()
            if not old_raw:
                continue
            try:
                old_id = int(old_raw)
            except ValueError:
                continue
            if old_id == 0:
                continue
            mapping.append((section_id, old_id))
    return mapping


def main():
    dry_run = "--dry-run" in sys.argv

    db = open_db()
    mapping = read_mapping()
    print(f"Read {len(mapping)} (section_ID, section_Old_ID) pairs from CSV")

    existing_ids = {row[0] for row in db.execute("SELECT id FROM sections").fetchall()}
    print(f"Found {len(existing_ids)} sections in DB")

    updates = []
    skipped_missing = 0
    for section_id, old_id in mapping:
        if section_id not in existing_ids:
            skipped_missing += 1
            continue
        updates.append((old_id, section_id))

    print(f"Will set legacy_old_id on {len(updates)} sections")
    print(f"Skipped {skipped_missing} CSV rows whose section_ID is not in the DB")

    if dry_run:
        print("(dry-run; no changes made)")
        return

    for old_id, section_id in updates:
        db.execute(
            "UPDATE sections SET legacy_old_id = ? WHERE id = ?",
            (old_id, section_id),
        )
    db.commit()
    print(f"Updated {len(updates)} rows.")


if __name__ == "__main__":
    main()
