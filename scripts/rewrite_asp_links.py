#!/usr/bin/env python3
"""
Rewrite legacy `.asp` URLs in content fields to modern routes.

Targets the same fields the public site renders:
  sections.body / .html_body
  photos.description / .html_description
  pages.body / .html_body
  news.body / .html_body

Body fields are Lexical JSON; html_* fields are raw HTML. In both cases
the script does string-level regex on URL values so JSON formatting and
HTML whitespace are preserved as-is.

Usage:
  ./rewrite_asp_links.py --db PATH [--apply]

Without --apply the script only reports what it would change.
With --apply the script writes changes inside a single transaction.

The same `.asp` paths that middleware.ts already 301-redirects (go,
browse, page, search, whats_new) are rewritten in source so the content
no longer relies on the redirect hop. Additionally handles:
  - `register.asp`              → /newsletter
  - `/control/go.asp?…`         → strip /control/, process as go.asp
  - `http://go.asp?…`           → treat go.asp as filename, not host
  - `thumbs.asp?SiteID=…`       → /browse/SLUG (no middleware coverage)
  - common typos (g.asp, img-X, imgX with no =, imt=X)
External `.asp` URLs and `browse_collection.asp` are left untouched.
"""
from __future__ import annotations
import argparse
import re
import sqlite3
import sys
from pathlib import Path
from urllib.parse import urlencode

# ─────────────────────────────────────────────────────────────────────
# Load redirect maps from the same DB
# ─────────────────────────────────────────────────────────────────────

def load_maps(db: sqlite3.Connection):
    section_slugs: dict[int, str] = {}
    legacy_site_slugs: dict[int, str] = {}
    legacy_subregion_slugs: dict[int, str] = {}
    for sid, slug, stype, legacy in db.execute(
        "SELECT id, slug, section_type, legacy_old_id FROM sections "
        "WHERE slug IS NOT NULL AND (published IS NULL OR published != 0)"
    ):
        section_slugs[int(sid)] = slug
        if legacy is None:
            continue
        if stype == "site":
            legacy_site_slugs[int(legacy)] = slug
        elif stype == "region":
            legacy_subregion_slugs[int(legacy)] = slug
    page_slugs: dict[int, str] = {}
    for pid, slug in db.execute("SELECT id, slug FROM pages WHERE slug IS NOT NULL"):
        page_slugs[int(pid)] = slug
    return section_slugs, legacy_site_slugs, legacy_subregion_slugs, page_slugs


# ─────────────────────────────────────────────────────────────────────
# URL rewriter
# ─────────────────────────────────────────────────────────────────────

IMAGE_ID_RE = re.compile(r"^[A-Za-z0-9_-]+$")

class Rewriter:
    def __init__(self, sections, sites, subregions, pages):
        self.sections = sections
        self.sites = sites
        self.subregions = subregions
        self.pages = pages
        self.unresolved: list[str] = []

    def rewrite(self, url: str) -> str | None:
        """Return new URL, or None if the URL should be left alone."""
        original = url
        u = url.strip()
        if not u or ".asp" not in u.lower():
            return None

        # External — only rewrite if host is holylandphotos.org (or
        # the bogus "go.asp" pseudo-host).
        host_match = re.match(r"^https?://([^/?#]+)(.*)$", u, re.IGNORECASE)
        if host_match:
            host = host_match.group(1).lower()
            rest = host_match.group(2) or "/"
            if host in ("holylandphotos.org", "www.holylandphotos.org"):
                u = rest if rest.startswith("/") else "/" + rest
            elif host == "go.asp":
                # http://go.asp?img=X — the legacy author meant /go.asp
                u = "/go.asp" + rest
            else:
                # Third-party .asp URL — leave it.
                return None

        # Strip protocol-relative leading slashes (//go.asp?…)
        if u.startswith("//"):
            u = "/" + u.lstrip("/")

        # Strip /control/ admin prefix
        if u.lower().startswith("/control/"):
            u = "/" + u[len("/control/"):]

        # Normalise leading slash for relative legacy paths.
        if not u.startswith("/"):
            u = "/" + u

        # register.asp → /newsletter
        if u.lower().startswith("/register.asp"):
            return "/newsletter"

        # Split path and query
        if "?" in u:
            path, _, query = u.partition("?")
        else:
            path, query = u, ""
        path_lower = path.lower()

        params = self._parse_query(query)

        # g.asp typo → treat as go.asp
        if path_lower.endswith("/g.asp"):
            path_lower = "/go.asp"

        if path_lower.endswith("/go.asp"):
            return self._handle_go(query, params, original)
        if path_lower.endswith("/browse.asp"):
            return self._handle_browse(params, original)
        if path_lower.endswith("/thumbs.asp"):
            return self._handle_thumbs(params, original)
        if path_lower.endswith("/page.asp"):
            return self._handle_page(params, original)
        if path_lower.endswith("/search.asp"):
            return self._handle_search(params)
        if path_lower.endswith("/whats_new.asp"):
            return "/news"

        # browse_collection.asp — no automatic mapping; leave alone.
        if "browse_collection.asp" in path_lower:
            return None

        self.unresolved.append(original)
        return None

    # ── helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _parse_query(q: str) -> dict[str, str]:
        out: dict[str, str] = {}
        if not q:
            return out
        for piece in q.split("&"):
            if not piece:
                continue
            if "=" in piece:
                k, _, v = piece.partition("=")
                out[k] = v
            else:
                # Handle typos like `imgINSGPP10` (no = sign) or
                # `img-JOSOPEQB05` (dash instead of =). Split the known
                # prefix and any separator off, treat the rest as the
                # image ID.
                matched = False
                for prefix in ("ImageID", "img", "imt"):
                    if piece.startswith(prefix) and len(piece) > len(prefix):
                        rest = piece[len(prefix):].lstrip("-_=")
                        if rest and IMAGE_ID_RE.match(rest):
                            out["img"] = rest
                            matched = True
                            break
                if not matched:
                    out[piece] = ""
        return out

    def _photo_or_none(self, img: str | None) -> str | None:
        if not img:
            return None
        img = img.strip()
        if IMAGE_ID_RE.match(img):
            return f"/photos/{img}"
        return None

    def _section_from(self, params: dict[str, str]) -> str | None:
        s = params.get("s")
        if s:
            last = s.split(",")[-1].strip()
            if last.isdigit():
                n = int(last)
                if n in self.sections:
                    return self.sections[n]
                # Content authors sometimes used the legacy site/region ID
                # in `?s=` URLs by mistake (the old site's URL scheme used
                # several different ID columns). Fall back to those —
                # middleware doesn't, but we can be smarter at rewrite time.
                if n in self.sites:
                    return self.sites[n]
                if n in self.subregions:
                    return self.subregions[n]
        sid = params.get("SiteID")
        if sid and sid.isdigit() and int(sid) in self.sites:
            return self.sites[int(sid)]
        sub = params.get("SubRegionID")
        if sub and sub.isdigit() and int(sub) in self.subregions:
            return self.subregions[int(sub)]
        return None

    def _handle_go(self, query: str, params: dict[str, str], original: str) -> str | None:
        # ?img=X or typo variants. _parse_query already normalised img-/imt/imgX.
        img = params.get("img")
        if not img:
            # Also try imt as a direct typo
            img = params.get("imt")
        # Handle img-X (dash instead of =) — picked up as bare key
        for key in list(params.keys()):
            if key.startswith("img-"):
                cand = key[len("img-"):]
                if IMAGE_ID_RE.match(cand):
                    img = cand
                    break
        photo = self._photo_or_none(img)
        if photo:
            return photo
        section = self._section_from(params)
        if section:
            return f"/browse/{section}"
        # Last-ditch: someone wrote ?s=IMAGEID by mistake (a typo where
        # they pasted an image ID into the section-id slot).
        s = params.get("s", "")
        if s and not s.isdigit() and IMAGE_ID_RE.match(s):
            return f"/photos/{s}"
        self.unresolved.append(original)
        return None

    def _handle_browse(self, params: dict[str, str], original: str) -> str | None:
        img = params.get("img") or params.get("ImageID")
        section = self._section_from(params)
        photo = self._photo_or_none(img)
        if photo and section:
            return f"{photo}?s={section}"
        if photo:
            return photo
        if section:
            return f"/browse/{section}"
        self.unresolved.append(original)
        return None

    def _handle_thumbs(self, params: dict[str, str], original: str) -> str | None:
        section = self._section_from(params)
        if section:
            return f"/browse/{section}"
        self.unresolved.append(original)
        return None

    def _handle_page(self, params: dict[str, str], original: str) -> str | None:
        pid = params.get("page_ID")
        if pid and pid.isdigit() and int(pid) in self.pages:
            return f"/pages/{self.pages[int(pid)]}"
        self.unresolved.append(original)
        return None

    def _handle_search(self, params: dict[str, str]) -> str:
        q = params.get("searchText")
        if q:
            return "/search?" + urlencode({"q": q.replace("+", " ")})
        return "/search"


# ─────────────────────────────────────────────────────────────────────
# Field-level rewriting
# ─────────────────────────────────────────────────────────────────────

# Lexical JSON stores URLs as `"url":"…"`; HTML uses href="…" / href='…'.
JSON_URL_RE = re.compile(r'("url"\s*:\s*")([^"]*?\.asp[^"]*?)(")', re.IGNORECASE)
HTML_HREF_RE = re.compile(r'''(href\s*=\s*['"])([^'"]*?\.asp[^'"]*?)(['"])''', re.IGNORECASE)

def rewrite_field(content: str, rewriter: Rewriter, is_html: bool) -> tuple[str, int]:
    if not content:
        return content, 0
    pattern = HTML_HREF_RE if is_html else JSON_URL_RE
    changed = 0
    def repl(m: re.Match) -> str:
        nonlocal changed
        prefix, url, suffix = m.group(1), m.group(2), m.group(3)
        new = rewriter.rewrite(url)
        if new is None or new == url:
            return m.group(0)
        changed += 1
        return f"{prefix}{new}{suffix}"
    return pattern.sub(repl, content), changed


# ─────────────────────────────────────────────────────────────────────
# Driver
# ─────────────────────────────────────────────────────────────────────

TARGETS = [
    # (table, key_col, [(field, is_html)])
    ("sections", "slug", [("body", False), ("html_body", True)]),
    ("photos",   "image_id", [("description", False), ("html_description", True)]),
    ("pages",    "slug", [("body", False), ("html_body", True)]),
    ("news",     "title", [("body", False), ("html_body", True)]),
]

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True, type=Path)
    ap.add_argument("--apply", action="store_true",
                    help="Commit changes. Without this flag, only reports.")
    ap.add_argument("--sample", type=int, default=5,
                    help="Show this many before/after samples per table.")
    args = ap.parse_args()

    if not args.db.exists():
        print(f"DB not found: {args.db}", file=sys.stderr)
        return 1

    db = sqlite3.connect(args.db)
    db.execute("PRAGMA foreign_keys = ON")
    sections, sites, subregions, pages = load_maps(db)
    rw = Rewriter(sections, sites, subregions, pages)

    total_changes = 0
    by_table: dict[str, int] = {}
    samples: list[str] = []

    for table, key_col, fields in TARGETS:
        for field, is_html in fields:
            rows = db.execute(
                f"SELECT id, {key_col}, {field} FROM {table} "
                f"WHERE {field} LIKE '%.asp%'"
            ).fetchall()
            for row_id, key, content in rows:
                new_content, n = rewrite_field(content, rw, is_html)
                if n == 0:
                    continue
                total_changes += n
                by_table[table] = by_table.get(table, 0) + n
                if len(samples) < args.sample * len(TARGETS):
                    samples.append(f"  {table}.{field} id={row_id} ({key}): {n} URL(s) rewritten")
                if args.apply:
                    db.execute(
                        f"UPDATE {table} SET {field} = ? WHERE id = ?",
                        (new_content, row_id),
                    )

    print(f"\nRewrite plan ({'APPLY' if args.apply else 'DRY RUN'}):")
    for s in samples:
        print(s)
    print(f"\nTotal URLs rewritten: {total_changes}")
    for t, n in sorted(by_table.items()):
        print(f"  {t}: {n}")

    if rw.unresolved:
        unique = sorted(set(rw.unresolved))
        print(f"\nUnresolved (left alone, {len(unique)} unique):")
        for u in unique[:25]:
            print(f"  {u}")
        if len(unique) > 25:
            print(f"  … and {len(unique) - 25} more")

    if args.apply:
        db.commit()
        print("\nCommitted.")
    else:
        print("\nNothing written. Re-run with --apply to commit.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
