#!/usr/bin/env python3
"""
Migrate news image gallery data from Jesse's CSV export into Turso.

The original migration script imported news titles, body text, and YouTube IDs,
but skipped the news_Gallery field. This script fills in the news_image_gallery table.

Gallery format in CSV: "IMAGEID|Caption\nIMAGEID|Caption\n..."

Usage:
    python3 scripts/migrate_news_gallery.py /Users/peter/Downloads/Archive

Dry run (show SQL without executing):
    python3 scripts/migrate_news_gallery.py /Users/peter/Downloads/Archive --dry-run
"""

import csv
import sys
import subprocess
import os
import uuid


TURSO_DB = "holy-land-photos"


def turso_exec(sql):
    """Execute SQL against Turso database."""
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
    """Escape a string for SQL insertion."""
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"


def parse_gallery(gallery_str):
    """Parse gallery string into list of (image_id, caption) tuples."""
    if not gallery_str or not gallery_str.strip():
        return []

    items = []
    for line in gallery_str.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        if "|" in line:
            parts = line.split("|", 1)
            image_id = parts[0].strip()
            caption = parts[1].strip() if len(parts) > 1 else ""
        else:
            # Just an image ID with no caption
            image_id = line.strip()
            caption = ""

        if image_id:
            items.append((image_id, caption))

    return items


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/migrate_news_gallery.py /path/to/Archive [--dry-run]")
        sys.exit(1)

    archive_dir = sys.argv[1]
    dry_run = "--dry-run" in sys.argv

    csv_path = os.path.join(archive_dir, "dbo.holylandphotos_News.csv")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found")
        sys.exit(1)

    print("Loading news CSV...")
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        news_rows = list(csv.DictReader(f))

    print(f"  {len(news_rows)} news items in CSV")

    # Parse gallery data
    gallery_inserts = []
    news_with_gallery = 0
    total_images = 0

    for row in news_rows:
        nid = row["news_ID"].strip()
        gallery_str = row.get("news_Gallery", "").strip()

        if not gallery_str:
            continue

        items = parse_gallery(gallery_str)
        if not items:
            continue

        news_with_gallery += 1
        for order, (image_id, caption) in enumerate(items, start=1):
            row_id = uuid.uuid4().hex[:24]
            sql = (
                f"INSERT INTO news_image_gallery (_order, _parent_id, id, image_id, caption) "
                f"VALUES ({order}, {nid}, {escape_sql(row_id)}, {escape_sql(image_id)}, {escape_sql(caption)});"
            )
            gallery_inserts.append(sql)
            total_images += 1

    print(f"  {news_with_gallery} news items have gallery data")
    print(f"  {total_images} total gallery images to insert")

    if dry_run:
        print("\n--- DRY RUN (first 20 statements) ---")
        for s in gallery_inserts[:20]:
            print(s)
        if len(gallery_inserts) > 20:
            print(f"  ... and {len(gallery_inserts) - 20} more")
        return

    # Clear existing gallery data (in case of re-run)
    print("\nClearing existing gallery data...")
    turso_exec("DELETE FROM news_image_gallery;")

    # Insert in batches of 50
    batch_size = 50
    inserted = 0
    for i in range(0, len(gallery_inserts), batch_size):
        batch = gallery_inserts[i : i + batch_size]
        sql = "PRAGMA foreign_keys=OFF;\n" + "\n".join(batch) + "\nPRAGMA foreign_keys=ON;"
        result = turso_exec(sql)
        inserted += len(batch)
        if result.returncode != 0:
            print(f"  Error at batch starting at row {i}")
            break
        print(f"  Inserted {inserted}/{total_images}...")

    print(f"\nDone. {inserted} gallery image rows inserted across {news_with_gallery} news items.")


if __name__ == "__main__":
    main()
