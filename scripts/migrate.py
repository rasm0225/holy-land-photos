#!/usr/bin/env python3
"""
Migration script: Import CSV data from the existing holylandphotos.org database into Turso.

Usage:
    python3 scripts/migrate.py /Users/peter/Downloads/Archive

This script:
1. Wipes existing data from the Turso database
2. Imports Sections (with hierarchy)
3. Imports Photos (metadata only, no files)
4. Links Photos to Sections
5. Imports Pages, News, Site of the Week
"""

import csv
import sys
import subprocess
import json
import os
from datetime import datetime

# Turso DB name
TURSO_DB = "holy-land-photos"

# Section type mapping (from SectionTypes CSV)
SECTION_TYPES = {
    "1": "top-level",
    "2": "country",
    "3": "region",
    "4": "site",
    "5": "artifact",
}


def turso_exec(sql):
    """Execute SQL against Turso database."""
    result = subprocess.run(
        ["turso", "db", "shell", TURSO_DB],
        input=sql,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  SQL Error: {result.stderr[:200]}")
    return result


def turso_exec_batch(statements):
    """Execute multiple SQL statements as a batch."""
    sql = "PRAGMA foreign_keys=OFF;\n" + "\n".join(statements) + "\nPRAGMA foreign_keys=ON;"
    return turso_exec(sql)


def escape_sql(val):
    """Escape a string for SQL insertion."""
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"


def parse_date(date_str):
    """Convert ASP date format to ISO 8601."""
    if not date_str or not date_str.strip():
        return None
    try:
        # Format: "4/19/2011 8:20:00AM" or "9/21/2003 11:30:33PM"
        for fmt in [
            "%m/%d/%Y %I:%M:%S%p",
            "%m/%d/%Y %I:%M:%S %p",
            "%m/%d/%Y",
        ]:
            try:
                dt = datetime.strptime(date_str.strip(), fmt)
                return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            except ValueError:
                continue
    except Exception:
        pass
    return None


def read_csv(filepath):
    """Read a CSV file and return list of dicts."""
    with open(filepath, "r", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/migrate.py /path/to/Archive")
        sys.exit(1)

    archive_dir = sys.argv[1]

    print("Loading CSV files...")
    sections_csv = read_csv(os.path.join(archive_dir, "dbo.holylandphotos_Sections.csv"))
    images_csv = read_csv(os.path.join(archive_dir, "dbo.holylandphotos_Images.csv"))
    is_csv = read_csv(os.path.join(archive_dir, "dbo.holylandphotos_IS.csv"))
    pages_csv = read_csv(os.path.join(archive_dir, "dbo.holylandphotos_Pages.csv"))
    news_csv = read_csv(os.path.join(archive_dir, "dbo.holylandphotos_News.csv"))
    stw_csv = read_csv(os.path.join(archive_dir, "dbo.holylandphotos_STW.csv"))

    print(f"  Sections: {len(sections_csv)}")
    print(f"  Images: {len(images_csv)}")
    print(f"  Image-Section links: {len(is_csv)}")
    print(f"  Pages: {len(pages_csv)}")
    print(f"  News: {len(news_csv)}")
    print(f"  Site of the Week: {len(stw_csv)}")

    # =========================================================================
    # Step 1: Clear existing data
    # =========================================================================
    print("\nClearing existing data...")
    turso_exec("""
        PRAGMA foreign_keys=OFF;
        DELETE FROM sections_photos;
        DELETE FROM sections_keywords;
        DELETE FROM sections_breadcrumbs;
        DELETE FROM sections;
        DELETE FROM photos_keywords;
        DELETE FROM photos;
        DELETE FROM section_photos;
        DELETE FROM pages;
        DELETE FROM news_image_gallery;
        DELETE FROM news;
        DELETE FROM site_of_the_week;
        DELETE FROM payload_locked_documents_rels;
        DELETE FROM payload_locked_documents;
        DELETE FROM payload_preferences_rels;
        DELETE FROM payload_preferences;
        DELETE FROM payload_migrations;
        PRAGMA foreign_keys=ON;
    """)
    print("  Done.")

    # =========================================================================
    # Step 2: Import Sections
    # =========================================================================
    print("\nImporting sections...")

    # Build slug from title
    import re

    def slugify(title):
        s = title.strip().lower()
        s = re.sub(r"[^\w\s-]", "", s)
        s = re.sub(r"[\s_]+", "-", s)
        s = re.sub(r"-+", "-", s)
        s = s.strip("-")
        return s

    # Track slugs to avoid duplicates
    seen_slugs = set()

    def unique_slug(title, section_id):
        slug = slugify(title)
        if not slug:
            slug = f"section-{section_id}"
        if slug in seen_slugs:
            slug = f"{slug}-{section_id}"
        seen_slugs.add(slug)
        return slug

    batch = []
    count = 0
    for row in sections_csv:
        sid = row["section_ID"].strip()
        if not sid:
            continue

        parent_id = row["section_Parent_ID"].strip()
        if parent_id == "0" or parent_id == "":
            parent_id = "NULL"

        title = row["section_Title"].strip()
        slug = unique_slug(title, sid)
        section_type = SECTION_TYPES.get(row["section_Type_ID"].strip(), "")
        keywords = row.get("section_Keywords", "").strip()
        notes = row.get("section_Notes", "").strip()
        html_body = row.get("section_Text", "").strip()
        section_image = row.get("section_Image", "").strip()
        created = parse_date(row.get("section_DateAdded", ""))
        updated = parse_date(row.get("section_LastModified", ""))

        sql = f"""INSERT INTO sections (id, title, slug, section_type, keywords, notes, html_body, section_image, parent_id, created_at, updated_at) VALUES (
            {sid},
            {escape_sql(title)},
            {escape_sql(slug)},
            {escape_sql(section_type) if section_type else 'NULL'},
            {escape_sql(keywords) if keywords else 'NULL'},
            {escape_sql(notes) if notes else 'NULL'},
            {escape_sql(html_body) if html_body else 'NULL'},
            {escape_sql(section_image) if section_image else 'NULL'},
            {parent_id},
            {escape_sql(created) if created else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"},
            {escape_sql(updated) if updated else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"}
        );"""
        batch.append(sql)
        count += 1

        if len(batch) >= 50:
            turso_exec_batch(batch)
            batch = []
            print(f"  {count}/{len(sections_csv)} sections...", end="\r")

    if batch:
        turso_exec_batch(batch)
    print(f"  {count} sections imported.        ")

    # =========================================================================
    # Step 3: Import Photos (metadata only)
    # =========================================================================
    print("\nImporting photos...")

    batch = []
    count = 0
    # We need auto-incrementing IDs for photos, starting from 1
    # But we also need to map image_ID (string) to numeric ID for relationships
    image_id_to_db_id = {}

    for i, row in enumerate(images_csv, start=1):
        image_id = row["image_ID"].strip()
        if not image_id:
            continue

        image_id_to_db_id[image_id] = i

        title = row.get("image_Title", "").strip() or image_id
        keywords = row.get("image_Keywords", "").strip()
        html_description = row.get("image_Text", "").strip()
        notes = row.get("image_Notes", "").strip()
        slug = row.get("image_Slug", "").strip()
        created = parse_date(row.get("image_DateAdded", ""))
        updated = parse_date(row.get("image_LastModified", ""))

        sql = f"""INSERT INTO photos (id, image_id, title, keywords, html_description, notes, created_at, updated_at) VALUES (
            {i},
            {escape_sql(image_id)},
            {escape_sql(title)},
            {escape_sql(keywords) if keywords else 'NULL'},
            {escape_sql(html_description) if html_description else 'NULL'},
            {escape_sql(notes) if notes else 'NULL'},
            {escape_sql(created) if created else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"},
            {escape_sql(updated) if updated else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"}
        );"""
        batch.append(sql)
        count += 1

        if len(batch) >= 50:
            turso_exec_batch(batch)
            batch = []
            print(f"  {count}/{len(images_csv)} photos...", end="\r")

    if batch:
        turso_exec_batch(batch)
    print(f"  {count} photos imported.          ")

    # =========================================================================
    # Step 4: Link Photos to Sections (sections_photos array)
    # =========================================================================
    print("\nLinking photos to sections...")

    # Group by section and sort by image sort order
    from collections import defaultdict

    section_images = defaultdict(list)
    for row in is_csv:
        section_id = row["is_Section_ID"].strip()
        image_id = row["is_Image_ID"].strip()
        if section_id and image_id and image_id in image_id_to_db_id:
            section_images[section_id].append(image_id)

    batch = []
    count = 0
    link_id = 0

    for section_id, image_ids in section_images.items():
        for order, image_id in enumerate(image_ids, start=1):
            db_photo_id = image_id_to_db_id.get(image_id)
            if not db_photo_id:
                continue

            link_id += 1
            # Generate a unique text ID for the array item
            array_id = f"img_{link_id}"

            sql = f"""INSERT INTO sections_photos (_order, _parent_id, id, photo_id) VALUES (
                {order},
                {section_id},
                {escape_sql(array_id)},
                {db_photo_id}
            );"""
            batch.append(sql)
            count += 1

            if len(batch) >= 100:
                turso_exec_batch(batch)
                batch = []
                print(f"  {count}/{len(is_csv)} links...", end="\r")

    if batch:
        turso_exec_batch(batch)
    print(f"  {count} photo-section links imported.    ")

    # =========================================================================
    # Step 5: Import Pages
    # =========================================================================
    print("\nImporting pages...")

    batch = []
    count = 0
    seen_page_slugs = set()

    for row in pages_csv:
        pid = row["page_ID"].strip()
        if not pid:
            continue

        title = row.get("page_Title", "").strip() or f"Page {pid}"
        html_body = row.get("page_Text", "").strip()
        sort_order = row.get("page_SortOrder", "0").strip() or "0"
        display = row.get("page_Display", "True").strip()
        display_val = 1 if display.lower() in ("true", "1", "yes") else 0
        redirect_url = row.get("page_RedirURL", "").strip()
        updated = parse_date(row.get("page_LastModified", ""))

        slug = slugify(title)
        if not slug:
            slug = f"page-{pid}"
        if slug in seen_page_slugs:
            slug = f"{slug}-{pid}"
        seen_page_slugs.add(slug)

        sql = f"""INSERT INTO pages (id, title, slug, html_body, sort_order, display, redirect_url, updated_at, created_at) VALUES (
            {pid},
            {escape_sql(title)},
            {escape_sql(slug)},
            {escape_sql(html_body) if html_body else 'NULL'},
            {sort_order},
            {display_val},
            {escape_sql(redirect_url) if redirect_url else 'NULL'},
            {escape_sql(updated) if updated else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"},
            {escape_sql(updated) if updated else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"}
        );"""
        batch.append(sql)
        count += 1

    turso_exec_batch(batch)
    print(f"  {count} pages imported.")

    # =========================================================================
    # Step 6: Import News
    # =========================================================================
    print("\nImporting news...")

    batch = []
    count = 0

    for row in news_csv:
        nid = row["news_ID"].strip()
        if not nid:
            continue

        title = row.get("news_Title", "").strip() or f"News {nid}"
        html_body = row.get("news_Text", "").strip()
        active = row.get("news_Active", "True").strip()
        active_val = 1 if active.lower() in ("true", "1", "yes") else 0
        youtube_id = row.get("news_YouTubeId", "").strip()
        created = parse_date(row.get("news_DateAdded", ""))

        sql = f"""INSERT INTO news (id, title, html_body, active, youtube_video_id, created_at, updated_at) VALUES (
            {nid},
            {escape_sql(title)},
            {escape_sql(html_body) if html_body else 'NULL'},
            {active_val},
            {escape_sql(youtube_id) if youtube_id else 'NULL'},
            {escape_sql(created) if created else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"},
            {escape_sql(created) if created else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"}
        );"""
        batch.append(sql)
        count += 1

    turso_exec_batch(batch)
    print(f"  {count} news items imported.")

    # =========================================================================
    # Step 7: Import Site of the Week
    # =========================================================================
    print("\nImporting site of the week...")

    batch = []
    count = 0

    for row in stw_csv:
        sid = row["stw_ID"].strip()
        if not sid:
            continue

        section_id = row.get("stw_Section_ID", "").strip()
        image_id = row.get("stw_Image_ID", "").strip()
        html_body = row.get("stw_Text", "").strip()
        is_current = row.get("stw_isCurrent", "False").strip()
        is_current_val = 1 if is_current.lower() in ("true", "1", "yes") else 0
        created = parse_date(row.get("stw_DateAdded", ""))

        sql = f"""INSERT INTO site_of_the_week (id, section_id, image_id, html_body, is_current, created_at, updated_at) VALUES (
            {sid},
            {section_id if section_id else 'NULL'},
            {escape_sql(image_id)},
            {escape_sql(html_body) if html_body else 'NULL'},
            {is_current_val},
            {escape_sql(created) if created else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"},
            {escape_sql(created) if created else "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"}
        );"""
        batch.append(sql)
        count += 1

    turso_exec_batch(batch)
    print(f"  {count} site of the week entries imported.")

    # =========================================================================
    # Summary
    # =========================================================================
    print("\n✓ Migration complete!")
    print("\nNote: HTML body content is stored in html_body / html_description columns.")
    print("The richText (Lexical) body fields are empty — conversion is a separate step.")


if __name__ == "__main__":
    main()
