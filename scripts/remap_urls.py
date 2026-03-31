#!/usr/bin/env python3
"""
Remap old ASP URLs in database HTML content to new Next.js routes.

Usage:
    python3 scripts/remap_urls.py --dry-run   # preview changes
    python3 scripts/remap_urls.py             # apply changes
"""

import re
import sys
import os
from urllib.parse import parse_qs
import libsql_experimental as libsql

# Load env
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent / ".env"
for line in env_path.read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        key, val = line.split("=", 1)
        os.environ.setdefault(key.strip(), val.strip())

DB_URL = os.environ["DATABASE_URL"]
DB_TOKEN = os.environ["DATABASE_AUTH_TOKEN"]


def get_db():
    return libsql.connect("hlp-remap", sync_url=DB_URL, auth_token=DB_TOKEN)


def build_lookups(db):
    print("Building lookup tables...")

    section_map = {}
    for row in db.execute("SELECT id, slug FROM sections").fetchall():
        section_map[row[0]] = row[1]
    print(f"  {len(section_map)} sections")

    page_map = {}
    for row in db.execute("SELECT id, slug FROM pages").fetchall():
        page_map[row[0]] = row[1]
    print(f"  {len(page_map)} pages")

    return section_map, page_map


def remap_url(href, section_map, page_map, unmapped):
    """Convert a single old URL to the new format. Returns new URL or None."""
    normalized = href
    for prefix in [
        "http://holylandphotos.org/",
        "https://holylandphotos.org/",
        "http://www.holylandphotos.org/",
        "https://www.holylandphotos.org/",
    ]:
        if normalized.lower().startswith(prefix):
            normalized = "/" + normalized[len(prefix):]
            break

    path = normalized.lstrip("/")

    # --- go.asp ---
    if path.lower().startswith("go.asp"):
        qs = path.split("?", 1)[1] if "?" in path else ""
        params = parse_qs(qs)

        if "img" in params:
            return f"/photos/{params['img'][0]}"

        if "s" in params:
            try:
                site_id = int(params["s"][0])
                slug = section_map.get(site_id)
                if slug:
                    return f"/browse/{slug}"
                else:
                    unmapped.append(f"go.asp?s={site_id} — section not found")
            except ValueError:
                unmapped.append(f"go.asp?s={params['s'][0]} — not a number")
        return None

    # --- browse.asp ---
    if path.lower().startswith("browse.asp"):
        qs = path.split("?", 1)[1] if "?" in path else ""
        params = parse_qs(qs)

        if "img" in params:
            return f"/photos/{params['img'][0]}"

        if "ImageID" in params:
            return f"/photos/{params['ImageID'][0]}"

        if "s" in params:
            s_val = params["s"][0]
            ids = [x.strip() for x in s_val.split(",")]
            try:
                last_id = int(ids[-1])
                slug = section_map.get(last_id)
                if slug:
                    return f"/browse/{slug}"
                else:
                    unmapped.append(f"browse.asp?s=...{last_id} — section not found")
            except ValueError:
                unmapped.append(f"browse.asp?s={s_val} — last value not a number")
            return None

        if "SiteID" in params:
            try:
                site_id = int(params["SiteID"][0])
                slug = section_map.get(site_id)
                if slug:
                    return f"/browse/{slug}"
                else:
                    unmapped.append(f"browse.asp?SiteID={site_id} — not found")
            except ValueError:
                pass
            return None

        if "SubRegionID" in params:
            try:
                region_id = int(params["SubRegionID"][0])
                slug = section_map.get(region_id)
                if slug:
                    return f"/browse/{slug}"
                else:
                    unmapped.append(f"browse.asp?SubRegionID={region_id} — not found")
            except ValueError:
                pass
            return None

        unmapped.append(f"browse.asp — unrecognized params: {qs}")
        return None

    # --- page.asp ---
    if path.lower().startswith("page.asp"):
        qs = path.split("?", 1)[1] if "?" in path else ""
        params = parse_qs(qs)

        if "page_ID" in params:
            try:
                page_id = int(params["page_ID"][0])
                slug = page_map.get(page_id)
                if slug:
                    return f"/{slug}"
                else:
                    unmapped.append(f"page.asp?page_ID={page_id} — not found")
            except ValueError:
                pass
        return None

    return None


def process_html(html, section_map, page_map, unmapped):
    if not html:
        return html, 0

    changes = 0

    def replace_href(match):
        nonlocal changes
        prefix = match.group(1)
        old_url = match.group(2)
        suffix = match.group(3)

        new_url = remap_url(old_url, section_map, page_map, unmapped)
        if new_url:
            changes += 1
            return f'{prefix}{new_url}{suffix}'
        return match.group(0)

    pattern = r'''(href=["'])((?:[^"']*?(?:go\.asp|browse\.asp|page\.asp)[^"']*?))(["'])'''
    new_html = re.sub(pattern, replace_href, html, flags=re.IGNORECASE)
    return new_html, changes


def process_table(db, table, column, section_map, page_map, dry_run):
    print(f"\nProcessing {table}.{column}...")

    rows = db.execute(
        f"SELECT id, {column} FROM {table} WHERE "
        f"{column} LIKE '%go.asp%' OR {column} LIKE '%browse.asp%' OR {column} LIKE '%page.asp%'"
    ).fetchall()

    if not rows:
        print(f"  No rows to update")
        return 0, []

    print(f"  {len(rows)} rows to process")

    total_changes = 0
    all_unmapped = []
    update_count = 0

    for row_id, html in rows:
        unmapped = []
        new_html, changes = process_html(html, section_map, page_map, unmapped)
        all_unmapped.extend(unmapped)

        if changes > 0:
            total_changes += changes
            if dry_run:
                print(f"  Row {row_id}: {changes} link(s) would be updated")
            else:
                db.execute(
                    f"UPDATE {table} SET {column} = ? WHERE id = ?",
                    (new_html, row_id),
                )
                update_count += 1

    if not dry_run:
        db.commit()
        print(f"  Updated {update_count} rows ({total_changes} links remapped)")
    else:
        print(f"  Would update {update_count} rows ({total_changes} links)")

    return total_changes, all_unmapped


def main():
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("=== DRY RUN MODE — no changes will be made ===\n")
    else:
        print("=== APPLYING CHANGES ===\n")

    db = get_db()
    db.sync()
    section_map, page_map = build_lookups(db)

    tables = [
        ("sections", "html_body"),
        ("photos", "html_description"),
        ("pages", "html_body"),
        ("news", "html_body"),
        ("site_of_the_week", "html_body"),
    ]

    total = 0
    all_unmapped = []

    for table, column in tables:
        changes, unmapped = process_table(db, table, column, section_map, page_map, dry_run)
        total += changes
        all_unmapped.extend(unmapped)

    print(f"\n{'=' * 50}")
    print(f"Total links remapped: {total}")

    if all_unmapped:
        unique = sorted(set(all_unmapped))
        print(f"\nUnmapped URLs ({len(unique)}):")
        for u in unique:
            print(f"  - {u}")


if __name__ == "__main__":
    main()
