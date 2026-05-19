#!/usr/bin/env python3
"""
Repair body links that were remapped to the wrong section because the old
remap script keyed ?SiteID=N and ?SubRegionID=N off the modern section_ID
instead of the legacy section_Old_ID.

For each affected row, replace `/browse/{wrong-slug}` with `/browse/{correct-slug}`
in BOTH the html field (html_body / html_description) and the Lexical body
field (body / description) — Lexical stores URLs as plain strings in JSON,
so a substring replace is safe and surgical.

Bounded to rows whose archive CSV original contained a ?SiteID= or
?SubRegionID= URL where the wrong and correct slugs actually differ.

Idempotent. Run twice = same result as running once.

Usage:
    python3 scripts/repair_misremapped_site_links.py --dry-run
    python3 scripts/repair_misremapped_site_links.py
"""

import csv
import os
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT / ".env"
ARCHIVE = ROOT / "archive"


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
        "hlp-repair",
        sync_url=db_url,
        auth_token=os.environ["DATABASE_AUTH_TOKEN"],
    )
    db.sync()
    return db


SITE_RE = re.compile(r"[?&]SiteID=(\d+)", re.IGNORECASE)
SUBREGION_RE = re.compile(r"[?&]SubRegionID=(\d+)", re.IGNORECASE)


def find_legacy_ids(text):
    """Return (set of SiteID ints, set of SubRegionID ints) found in `text`."""
    if not text:
        return set(), set()
    sites = {int(m) for m in SITE_RE.findall(text)}
    regions = {int(m) for m in SUBREGION_RE.findall(text)}
    return sites, regions


def build_section_indexes(db):
    """section_map keyed by sections.id; legacy_site_map and legacy_subregion_map
    keyed by sections.legacy_old_id (restricted by section_type)."""
    section_map = {}
    legacy_site_map = {}
    legacy_subregion_map = {}
    for sid, slug, stype, legacy in db.execute(
        "SELECT id, slug, section_type, legacy_old_id FROM sections"
    ).fetchall():
        section_map[int(sid)] = slug
        if legacy is None:
            continue
        if stype == "site":
            legacy_site_map[int(legacy)] = slug
        elif stype == "region":
            legacy_subregion_map[int(legacy)] = slug
    return section_map, legacy_site_map, legacy_subregion_map


def collect_swaps(legacy_ids, kind, section_map, legacy_site_map, legacy_subregion_map):
    """For a row containing legacy_ids (set of int), return list of
    (wrong_slug, correct_slug) pairs where they differ."""
    pairs = []
    legacy_map = legacy_site_map if kind == "site" else legacy_subregion_map
    for legacy_id in legacy_ids:
        wrong = section_map.get(legacy_id)
        correct = legacy_map.get(legacy_id)
        if wrong and correct and wrong != correct:
            pairs.append((wrong, correct))
    return pairs


def apply_swaps(s, swaps):
    """Replace /browse/{wrong} → /browse/{correct} in string s. Only matches
    when followed by a path/URL boundary (end-of-string, /, quote, ?, #, <,
    backslash, or whitespace) to avoid clobbering slugs that share a prefix."""
    if not s or not swaps:
        return s, 0
    total = 0
    for wrong, correct in swaps:
        pattern = re.compile(re.escape(f"/browse/{wrong}") + r"(?=[/?#\"'<\\\s]|$)")
        s, n = pattern.subn(f"/browse/{correct}", s)
        total += n
    return s, total


# (csv_file, csv_id_col, text_col, db_table, db_id_match_col, html_col, body_col)
SOURCES = [
    (
        "dbo.holylandphotos_Images.csv",
        "image_ID",
        "image_Text",
        "photos",
        "image_id",
        "html_description",
        "description",
    ),
    (
        "dbo.holylandphotos_Sections.csv",
        "section_ID",
        "section_Text",
        "sections",
        "id",
        "html_body",
        "body",
    ),
    (
        "dbo.holylandphotos_Pages.csv",
        "page_ID",
        "page_Text",
        "pages",
        "id",
        "html_body",
        "body",
    ),
    (
        "dbo.holylandphotos_News.csv",
        "news_ID",
        "news_Text",
        "news",
        "id",
        "html_body",
        "body",
    ),
    (
        "dbo.holylandphotos_STW.csv",
        "stw_ID",
        "stw_Text",
        "site_of_the_week",
        "id",
        "html_body",
        "body",
    ),
]


def process_source(db, src, section_map, legacy_site_map, legacy_subregion_map, dry_run):
    (
        csv_name,
        csv_id_col,
        text_col,
        db_table,
        db_match_col,
        html_col,
        body_col,
    ) = src

    csv_path = ARCHIVE / csv_name
    if not csv_path.exists():
        print(f"  skip {csv_name} — not present")
        return 0, 0

    print(f"\n{db_table} (source {csv_name}):")
    affected_rows = 0
    total_replacements = 0

    with csv_path.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_id = (row.get(csv_id_col) or "").strip()
            text = row.get(text_col) or ""
            if not raw_id or not text:
                continue

            sites, regions = find_legacy_ids(text)
            swaps = []
            swaps += collect_swaps(sites, "site", section_map, legacy_site_map, legacy_subregion_map)
            swaps += collect_swaps(regions, "region", section_map, legacy_site_map, legacy_subregion_map)
            if not swaps:
                continue

            if db_match_col == "id":
                db_id_val = int(raw_id)
            else:
                db_id_val = raw_id

            cur_row = db.execute(
                f"SELECT id, {html_col}, {body_col} FROM {db_table} WHERE {db_match_col} = ?",
                (db_id_val,),
            ).fetchone()
            if not cur_row:
                continue

            db_pk, cur_html, cur_body = cur_row

            new_html, n_html = apply_swaps(cur_html, swaps)
            new_body, n_body = apply_swaps(cur_body, swaps)
            replacements = n_html + n_body
            if replacements == 0:
                continue

            affected_rows += 1
            total_replacements += replacements

            if dry_run:
                pairs = ", ".join(f"{w}→{c}" for w, c in swaps)
                print(f"  [{db_pk}] {raw_id}: {replacements} replacement(s) ({pairs})")
            else:
                db.execute(
                    f"UPDATE {db_table} SET {html_col} = ?, {body_col} = ? WHERE id = ?",
                    (new_html, new_body, db_pk),
                )

    if not dry_run:
        db.commit()
    print(f"  → {affected_rows} rows touched, {total_replacements} replacements")
    return affected_rows, total_replacements


def main():
    dry_run = "--dry-run" in sys.argv
    print("=== DRY RUN ===" if dry_run else "=== APPLYING ===")

    db = open_db()
    section_map, legacy_site_map, legacy_subregion_map = build_section_indexes(db)
    print(
        f"Indexes: {len(section_map)} sections, "
        f"{len(legacy_site_map)} legacy sites, "
        f"{len(legacy_subregion_map)} legacy subregions"
    )

    total_rows = 0
    total_repl = 0
    for src in SOURCES:
        r, n = process_source(
            db, src, section_map, legacy_site_map, legacy_subregion_map, dry_run
        )
        total_rows += r
        total_repl += n

    print(f"\nTotal: {total_rows} rows touched, {total_repl} replacements")


if __name__ == "__main__":
    main()
