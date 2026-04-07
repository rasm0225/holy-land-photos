#!/usr/bin/env python3
"""
Fix photo ordering in sections to match the original site's order.

The original migration didn't preserve the is_ID ordering from the CSV.
This script reads the original CSV, determines the correct order, and
updates the _order column in sections_photos in Turso.

Usage:
    python3 scripts/fix_photo_order.py /Users/peter/Downloads/Archive
    python3 scripts/fix_photo_order.py /Users/peter/Downloads/Archive --dry-run
"""

import csv
import sys
import subprocess
import os
from collections import defaultdict


TURSO_DB = "holy-land-photos"


def turso_exec(sql):
    result = subprocess.run(
        ["turso", "db", "shell", TURSO_DB],
        input=sql,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  SQL Error: {result.stderr[:300]}")
    return result


def escape_sql(val):
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/fix_photo_order.py /path/to/Archive [--dry-run]")
        sys.exit(1)

    archive_dir = sys.argv[1]
    dry_run = "--dry-run" in sys.argv

    # Read the IS (Image-Section) CSV
    is_path = os.path.join(archive_dir, "dbo.holylandphotos_IS.csv")
    print(f"Loading {is_path}...")
    with open(is_path, "r", encoding="utf-8-sig") as f:
        is_rows = list(csv.DictReader(f))
    print(f"  {len(is_rows)} image-section links in CSV")

    # Build correct order per section: sort by is_ID within each section
    section_order = defaultdict(list)
    for row in is_rows:
        is_id = int(row["is_ID"].strip())
        image_id = row["is_Image_ID"].strip()
        section_id = row["is_Section_ID"].strip()
        if image_id and section_id:
            section_order[section_id].append((is_id, image_id))

    # Sort each section's photos by is_ID
    for section_id in section_order:
        section_order[section_id].sort(key=lambda x: x[0])

    print(f"  {len(section_order)} sections with photos")

    # Get the current sections_photos data from Turso to find row IDs
    # We need: image_id -> photo db id mapping
    print("Loading photo ID mapping from Turso...")
    result = turso_exec("SELECT id, image_id FROM photos;")
    image_to_dbid = {}
    for line in result.stdout.strip().split("\n")[1:]:
        parts = line.strip().split()
        if len(parts) >= 2:
            dbid = parts[0].strip()
            img_id = parts[1].strip()
            image_to_dbid[img_id] = dbid

    print(f"  {len(image_to_dbid)} photos in database")

    # Now rebuild sections_photos with correct ordering
    # Strategy: delete all rows and re-insert with correct _order
    print("Loading current sections_photos...")
    result = turso_exec("SELECT id, _parent_id, photo_id FROM sections_photos;")
    current_rows = []
    for line in result.stdout.strip().split("\n")[1:]:
        parts = line.strip().split()
        if len(parts) >= 3:
            current_rows.append({
                "id": parts[0].strip(),
                "parent_id": parts[1].strip(),
                "photo_id": parts[2].strip(),
            })
    print(f"  {len(current_rows)} current photo-section links")

    # Build a map: (parent_id, photo_id) -> row id
    row_map = {}
    for r in current_rows:
        key = (r["parent_id"], r["photo_id"])
        row_map[key] = r["id"]

    # Generate UPDATE statements
    updates = []
    sections_fixed = 0

    for section_id, photos in section_order.items():
        for new_order, (is_id, image_id) in enumerate(photos, start=1):
            db_photo_id = image_to_dbid.get(image_id)
            if not db_photo_id:
                continue
            key = (section_id, db_photo_id)
            row_id = row_map.get(key)
            if not row_id:
                continue
            updates.append(
                f"UPDATE sections_photos SET _order = {new_order} WHERE id = {escape_sql(row_id)};"
            )
        sections_fixed += 1

    print(f"\n{len(updates)} UPDATE statements for {sections_fixed} sections")

    if dry_run:
        print("\n--- DRY RUN (first 20) ---")
        for s in updates[:20]:
            print(s)
        if len(updates) > 20:
            print(f"  ... and {len(updates) - 20} more")
        return

    # Execute in batches
    batch_size = 100
    executed = 0
    for i in range(0, len(updates), batch_size):
        batch = updates[i : i + batch_size]
        sql = "\n".join(batch)
        turso_exec(sql)
        executed += len(batch)
        if executed % 500 == 0 or executed == len(updates):
            print(f"  Executed {executed}/{len(updates)}...")

    print(f"\nDone. {executed} photo orders fixed across {sections_fixed} sections.")


if __name__ == "__main__":
    main()
