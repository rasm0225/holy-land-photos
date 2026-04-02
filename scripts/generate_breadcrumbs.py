#!/usr/bin/env python3
"""
Generate breadcrumbs for all sections in Turso.

The nested-docs plugin normally generates breadcrumbs via Payload hooks,
but the migration script inserted directly into SQLite, bypassing hooks.
This script builds the breadcrumb rows from the parent hierarchy.

Usage:
    python3 scripts/generate_breadcrumbs.py
    python3 scripts/generate_breadcrumbs.py --dry-run
"""

import subprocess
import sys
import uuid


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
    dry_run = "--dry-run" in sys.argv

    # Load all sections using pipe separator for reliable parsing
    print("Loading sections...")
    result = turso_exec("SELECT id || '|||' || title || '|||' || slug || '|||' || COALESCE(CAST(parent_id AS TEXT), '') FROM sections ORDER BY id;")
    sections = {}
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if not line or line.startswith("ID") or "|||" not in line:
            continue
        parts = line.split("|||")
        if len(parts) < 4:
            continue
        try:
            sid = int(parts[0].strip())
        except ValueError:
            continue
        parent_str = parts[3].strip()
        sections[sid] = {
            "id": sid,
            "title": parts[1].strip(),
            "slug": parts[2].strip(),
            "parent_id": int(parent_str) if parent_str else None,
        }

    print(f"  {len(sections)} sections loaded")

    # Build ancestry chain for each section
    def get_ancestry(section_id):
        """Return list of sections from root to this section (inclusive)."""
        chain = []
        current = section_id
        seen = set()
        while current and current in sections:
            if current in seen:
                break  # cycle protection
            seen.add(current)
            chain.append(sections[current])
            current = sections[current]["parent_id"]
        chain.reverse()
        return chain

    # Generate breadcrumb inserts
    inserts = []
    for sid, section in sections.items():
        chain = get_ancestry(sid)
        url_parts = []
        for order, ancestor in enumerate(chain, start=1):
            url_parts.append(ancestor["slug"])
            url = "/" + "/".join(url_parts)
            row_id = uuid.uuid4().hex[:24]
            sql = (
                f"INSERT INTO sections_breadcrumbs (_order, _parent_id, id, doc_id, url, label) "
                f"VALUES ({order}, {sid}, {escape_sql(row_id)}, {ancestor['id']}, "
                f"{escape_sql(url)}, {escape_sql(ancestor['title'])});"
            )
            inserts.append(sql)

    print(f"  {len(inserts)} breadcrumb rows to insert for {len(sections)} sections")

    if dry_run:
        print("\n--- DRY RUN (first 20) ---")
        for s in inserts[:20]:
            print(s)
        if len(inserts) > 20:
            print(f"  ... and {len(inserts) - 20} more")
        return

    # Clear existing breadcrumbs
    print("\nClearing existing breadcrumbs...")
    turso_exec("DELETE FROM sections_breadcrumbs;")

    # Insert in batches
    batch_size = 100
    inserted = 0
    for i in range(0, len(inserts), batch_size):
        batch = inserts[i : i + batch_size]
        sql = "PRAGMA foreign_keys=OFF;\n" + "\n".join(batch) + "\nPRAGMA foreign_keys=ON;"
        result = turso_exec(sql)
        inserted += len(batch)
        if result.returncode != 0:
            print(f"  Error at batch starting at row {i}")
            break
        if inserted % 500 == 0 or inserted == len(inserts):
            print(f"  Inserted {inserted}/{len(inserts)}...")

    print(f"\nDone. {inserted} breadcrumb rows inserted for {len(sections)} sections.")


if __name__ == "__main__":
    main()
