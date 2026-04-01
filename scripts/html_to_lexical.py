#!/usr/bin/env python3
"""
Convert htmlBody/htmlDescription fields to Lexical rich text JSON.

Skips records with inline images (<img> tags).
Converts: paragraphs, links, bold, italic, underline, strikethrough,
           line breaks, headings, blockquotes, lists, horizontal rules.
Strips: Word junk (mso-*, st1:*), <font>, <style>, <div>, inline styles
         (except font-style:italic, font-weight:bold, text-decoration:underline).

Usage:
    python3 scripts/html_to_lexical.py pages --dry-run
    python3 scripts/html_to_lexical.py pages
    python3 scripts/html_to_lexical.py sections
    python3 scripts/html_to_lexical.py photos
    python3 scripts/html_to_lexical.py news
    python3 scripts/html_to_lexical.py site_of_the_week
"""

import sys
import os
import re
import json
import html as html_module
from html.parser import HTMLParser
from pathlib import Path

import libsql_experimental as libsql

# Load env
env_path = Path(__file__).resolve().parent.parent / ".env"
for line in env_path.read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        key, val = line.split("=", 1)
        os.environ.setdefault(key.strip(), val.strip())

DB_URL = os.environ["DATABASE_URL"]
DB_TOKEN = os.environ["DATABASE_AUTH_TOKEN"]


# --- Lexical node builders ---

def make_text(text, format_flags=0):
    """Create a Lexical text node. format_flags: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript."""
    return {
        "detail": 0,
        "format": format_flags,
        "mode": "normal",
        "style": "",
        "text": text,
        "type": "text",
        "version": 1,
    }


def make_linebreak():
    return {"type": "linebreak", "version": 1}


def make_paragraph(children, format_str=""):
    return {
        "children": children,
        "direction": None,
        "format": format_str,
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textFormat": 0,
        "textStyle": "",
    }


def make_heading(children, tag="h1"):
    return {
        "children": children,
        "direction": None,
        "format": "",
        "indent": 0,
        "type": "heading",
        "version": 1,
        "tag": tag,
    }


def make_link(children, url):
    return {
        "children": children,
        "direction": None,
        "format": "",
        "indent": 0,
        "type": "link",
        "version": 3,
        "fields": {
            "url": url,
            "linkType": "custom",
        },
    }


def make_list(children, list_type="bullet"):
    tag = "ul" if list_type == "bullet" else "ol"
    return {
        "children": children,
        "direction": None,
        "format": "",
        "indent": 0,
        "type": "list",
        "version": 1,
        "listType": list_type,
        "start": 1,
        "tag": tag,
    }


def make_listitem(children):
    return {
        "children": children,
        "direction": None,
        "format": "",
        "indent": 0,
        "type": "listitem",
        "version": 1,
        "value": 1,
    }


def make_quote(children):
    return {
        "children": children,
        "direction": None,
        "format": "",
        "indent": 0,
        "type": "quote",
        "version": 1,
    }


def make_horizontalrule():
    return {"type": "horizontalrule", "version": 1}


def make_root(children):
    return {
        "root": {
            "children": children,
            "direction": None,
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1,
        }
    }


# --- HTML Parser ---

class LexicalHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root_children = []  # top-level block nodes
        self.stack = []  # stack of (tag, attrs, children)
        self.format_stack = []  # current text format flags
        self.current_format = 0
        self.in_style = False
        self.skip_content = False

    def _push(self, tag, attrs):
        self.stack.append((tag, dict(attrs), []))

    def _pop(self):
        if self.stack:
            return self.stack.pop()
        return None

    def _current_children(self):
        if self.stack:
            return self.stack[-1][2]
        return self.root_children

    def _add_to_current(self, node):
        self._current_children().append(node)

    def _get_format_from_style(self, style_str):
        """Extract format flags from inline style."""
        fmt = 0
        if not style_str:
            return fmt
        s = style_str.lower()
        if "font-style" in s and "italic" in s:
            fmt |= 2
        if "font-weight" in s and "bold" in s:
            fmt |= 1
        if "text-decoration" in s and "underline" in s:
            fmt |= 8
        return fmt

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        attrs_dict = dict(attrs)

        # Skip embedded style blocks
        if tag == "style":
            self.in_style = True
            return

        # Skip Word junk tags
        if tag.startswith("st1:") or tag in ("place", "city", "country-region"):
            return

        # Strip font tags — just pass through content
        if tag == "font":
            return

        # Block elements
        if tag in ("p", "div"):
            self._push(tag, attrs)
            # Check for style-based formatting
            style = attrs_dict.get("style", "")
            fmt = self._get_format_from_style(style)
            if fmt:
                self.format_stack.append(self.current_format)
                self.current_format |= fmt
            return

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._push(tag, attrs)
            return

        if tag == "blockquote":
            self._push(tag, attrs)
            return

        if tag in ("ul", "ol"):
            self._push(tag, attrs)
            return

        if tag == "li":
            self._push(tag, attrs)
            return

        # Inline formatting
        if tag in ("em", "i"):
            self.format_stack.append(self.current_format)
            self.current_format |= 2  # italic
            return

        if tag in ("strong", "b"):
            self.format_stack.append(self.current_format)
            self.current_format |= 1  # bold
            return

        if tag == "u":
            self.format_stack.append(self.current_format)
            self.current_format |= 8  # underline
            return

        if tag in ("strike", "s", "del"):
            self.format_stack.append(self.current_format)
            self.current_format |= 4  # strikethrough
            return

        if tag == "sup":
            self.format_stack.append(self.current_format)
            self.current_format |= 64  # superscript
            return

        if tag == "sub":
            self.format_stack.append(self.current_format)
            self.current_format |= 32  # subscript
            return

        # Span — check for meaningful styles
        if tag == "span":
            style = attrs_dict.get("style", "")
            fmt = self._get_format_from_style(style)
            self.format_stack.append(self.current_format)
            if fmt:
                self.current_format |= fmt
            return

        # Links
        if tag == "a":
            href = attrs_dict.get("href", "")
            self._push("a", [("href", href)])
            return

        # Line break
        if tag == "br":
            self._add_to_current(make_linebreak())
            return

        # Horizontal rule
        if tag == "hr":
            self.root_children.append(make_horizontalrule())
            return

        # Tables — skip for now (these records should have been filtered)
        if tag in ("table", "tbody", "tr", "td", "th", "thead"):
            self._push(tag, attrs)
            return

        # big tag — ignore, keep text
        if tag == "big":
            return

    def handle_endtag(self, tag):
        tag = tag.lower()

        if tag == "style":
            self.in_style = False
            return

        if tag.startswith("st1:") or tag in ("place", "city", "country-region"):
            return

        if tag == "font" or tag == "big":
            return

        if tag in ("em", "i", "strong", "b", "u", "strike", "s", "del", "sup", "sub"):
            if self.format_stack:
                self.current_format = self.format_stack.pop()
            return

        if tag == "span":
            if self.format_stack:
                self.current_format = self.format_stack.pop()
            return

        if tag == "br":
            return

        if tag == "hr":
            return

        # Block elements
        if tag in ("p", "div"):
            result = self._pop()
            if result:
                _, attrs, children = result
                # Restore format
                style = attrs.get("style", "")
                if self._get_format_from_style(style):
                    if self.format_stack:
                        self.current_format = self.format_stack.pop()
                # Filter empty paragraphs (only whitespace/nbsp)
                text_content = "".join(
                    c.get("text", "") for c in children if isinstance(c, dict) and c.get("type") == "text"
                ).strip()
                if children or text_content:
                    self.root_children.append(make_paragraph(children if children else []))
            return

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            result = self._pop()
            if result:
                _, _, children = result
                self.root_children.append(make_heading(children, tag))
            return

        if tag == "blockquote":
            result = self._pop()
            if result:
                _, _, children = result
                # Blockquote children should be inline nodes
                # If they contain block nodes (paragraphs), flatten
                inline_children = []
                for child in children:
                    if isinstance(child, dict) and child.get("type") == "paragraph":
                        inline_children.extend(child.get("children", []))
                    else:
                        inline_children.append(child)
                self.root_children.append(make_quote(inline_children if inline_children else children))
            return

        if tag in ("ul", "ol"):
            result = self._pop()
            if result:
                _, _, children = result
                list_type = "bullet" if tag == "ul" else "number"
                self.root_children.append(make_list(children, list_type))
            return

        if tag == "li":
            result = self._pop()
            if result:
                _, _, children = result
                self._add_to_current(make_listitem(children))
            return

        if tag == "a":
            result = self._pop()
            if result:
                _, attrs, children = result
                href = attrs.get("href", "")
                if href and children:
                    self._add_to_current(make_link(children, href))
                elif children:
                    # No href, just add text
                    for c in children:
                        self._add_to_current(c)
            return

        # Table elements — collect as-is for now
        if tag in ("table", "tbody", "tr", "td", "th", "thead"):
            self._pop()
            return

    def handle_data(self, data):
        if self.in_style:
            return

        # Decode entities and normalize whitespace
        text = data
        if not text:
            return

        # Replace &nbsp; patterns (already decoded by parser)
        text = text.replace("\xa0", " ")

        # Don't add pure whitespace between block elements
        if not text.strip() and not self.stack:
            return

        node = make_text(text, self.current_format)
        self._add_to_current(node)

    def handle_entityref(self, name):
        char = html_module.unescape(f"&{name};")
        if char:
            self._add_to_current(make_text(char, self.current_format))

    def handle_charref(self, name):
        char = html_module.unescape(f"&#{name};")
        if char:
            self._add_to_current(make_text(char, self.current_format))

    def get_lexical(self):
        # If there are no root children, return empty
        if not self.root_children:
            return None

        # Ensure all root children are block nodes
        # Any stray inline nodes get wrapped in a paragraph
        cleaned = []
        inline_buffer = []
        block_types = {"paragraph", "heading", "list", "quote", "horizontalrule"}

        for child in self.root_children:
            if isinstance(child, dict) and child.get("type") in block_types:
                if inline_buffer:
                    cleaned.append(make_paragraph(inline_buffer))
                    inline_buffer = []
                cleaned.append(child)
            else:
                inline_buffer.append(child)

        if inline_buffer:
            cleaned.append(make_paragraph(inline_buffer))

        return make_root(cleaned)


def convert_html_to_lexical(html_str):
    """Convert an HTML string to Lexical JSON. Returns dict or None."""
    if not html_str or not html_str.strip():
        return None

    parser = LexicalHTMLParser()
    parser.feed(html_str)
    return parser.get_lexical()


# --- Main ---

TABLE_CONFIG = {
    "pages": ("pages", "html_body", "body"),
    "sections": ("sections", "html_body", "body"),
    "photos": ("photos", "html_description", "description"),
    "news": ("news", "html_body", "body"),
    "site_of_the_week": ("site_of_the_week", "html_body", "body"),
}


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/html_to_lexical.py <collection> [--dry-run]")
        print(f"Collections: {', '.join(TABLE_CONFIG.keys())}")
        sys.exit(1)

    collection = sys.argv[1]
    dry_run = "--dry-run" in sys.argv

    if collection not in TABLE_CONFIG:
        print(f"Unknown collection: {collection}")
        sys.exit(1)

    table, html_col, body_col = TABLE_CONFIG[collection]

    if dry_run:
        print(f"=== DRY RUN: {collection} ===\n")
    else:
        print(f"=== CONVERTING: {collection} ===\n")

    db = libsql.connect(f"hlp-convert-{collection}", sync_url=DB_URL, auth_token=DB_TOKEN)
    db.sync()

    # Get title column
    title_col = "title" if table != "site_of_the_week" else "image_id"

    # Fetch records with HTML content but no Lexical body yet
    # Skip records with inline images
    rows = db.execute(
        f"SELECT id, {title_col}, {html_col} FROM {table} "
        f"WHERE {html_col} IS NOT NULL AND {html_col} != '' "
        f"AND ({body_col} IS NULL OR {body_col} = '') "
        f"AND {html_col} NOT LIKE '%<img%'"
    ).fetchall()

    print(f"  {len(rows)} records to convert (skipping those with <img> or existing body)\n")

    converted = 0
    errors = 0

    for row_id, title, html_content in rows:
        try:
            lexical = convert_html_to_lexical(html_content)
            if lexical:
                lexical_json = json.dumps(lexical)
                if dry_run:
                    # Validate it's reasonable
                    root_children = lexical["root"]["children"]
                    print(f"  [{row_id}] {title}: {len(root_children)} blocks")
                else:
                    db.execute(
                        f"UPDATE {table} SET {body_col} = ? WHERE id = ?",
                        (lexical_json, row_id),
                    )
                converted += 1
        except Exception as e:
            print(f"  ERROR [{row_id}] {title}: {e}")
            errors += 1

    if not dry_run:
        db.commit()

    print(f"\n  Converted: {converted}")
    print(f"  Errors: {errors}")
    print(f"  Skipped (inline images): counted above")


if __name__ == "__main__":
    main()
