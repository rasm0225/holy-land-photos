#!/usr/bin/env python3
"""
apply_themes.py — Add light/dark theme support to hand-authored story pages.

This script is idempotent: safe to re-run on already-processed pages.

What it does to each page:
  1. Adds <link rel="stylesheet" href="theme.css"> before </head>
  2. Adds <script src="theme.js"></script> before </head>
  3. Replaces hardcoded dark-theme colors with --hlp-* CSS variables
  4. Inserts the theme toggle button into the nav bar

All light-mode overrides live in the shared theme.css file.
"""

import os, re

MOCKUPS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mockups")

# Pages with .site-nav structure
SITE_NAV_PAGES = [
    "about.html", "aegean-story.html", "central-turkey-story.html",
    "countries-story.html", "eastern-turkey-story.html", "how-to-use.html",
    "index.html", "permission-story.html", "reading.html", "site-list.html",
    "story.html", "topical.html", "tour.html", "turkey-story.html",
    "western-turkey-story.html",
]

# Pages with .topnav structure
TOPNAV_PAGES = ["whats-new-story.html"]

TOGGLE_BTN_HTML = '''\
    <button id="theme-toggle" aria-label="Toggle light/dark theme" title="Toggle light/dark theme">
      <svg class="icon-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>'''


def process_file(path, nav_type="site-nav"):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False

    # 1. Add theme.css link if missing
    if 'theme.css' not in content:
        content = content.replace(
            '</head>',
            '  <link rel="stylesheet" href="theme.css">\n</head>', 1
        )
        changed = True

    # 2. Add theme.js script if missing
    if 'theme.js' not in content:
        content = content.replace(
            '</head>',
            '  <script src="theme.js"></script>\n</head>', 1
        )
        changed = True

    # 3. Replace hardcoded dark-theme colors with CSS variables
    replacements = [
        ('background: #0D0B08;', 'background: var(--hlp-bg);'),
        ('color: #EDE8E1;', 'color: var(--hlp-text);'),
        ('a { color: #C47A4E; }', 'a { color: var(--hlp-link); }'),
        ('a:hover { color: #E09060; }', 'a:hover { color: var(--hlp-accent-hover); }'),
    ]
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new, 1)
            changed = True

    # Replace nav background colors
    nav_replacements = [
        (r'background:\s*rgba\(13,11,8,\.97\)', 'background: var(--hlp-nav-bg)'),
        (r'background:\s*rgba\(13,11,8,\.98\)', 'background: var(--hlp-nav-drawer)'),
        (r'background:\s*rgba\(13,11,8,\.88\)', 'background: var(--hlp-nav-blur)'),
    ]
    for pattern, replacement in nav_replacements:
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            content = new_content
            changed = True

    # 4. Add toggle button if missing
    if 'theme-toggle' not in content:
        if nav_type == "site-nav":
            content = re.sub(
                r'(<button class="nav-toggle")',
                TOGGLE_BTN_HTML + '\n    \\1',
                content, count=1
            )
        elif nav_type == "topnav":
            content = re.sub(
                r'(</ul>\s*</nav>)',
                '</ul>\n' + TOGGLE_BTN_HTML + '\n  </nav>',
                content, count=1
            )
        changed = True

    if changed:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  OK: {os.path.basename(path)}")
    else:
        print(f"  SKIP (already up to date): {os.path.basename(path)}")


def main():
    print("Applying theme support...")
    for name in SITE_NAV_PAGES:
        path = os.path.join(MOCKUPS, name)
        if os.path.exists(path):
            process_file(path, nav_type="site-nav")
        else:
            print(f"  NOT FOUND: {name}")

    for name in TOPNAV_PAGES:
        path = os.path.join(MOCKUPS, name)
        if os.path.exists(path):
            process_file(path, nav_type="topnav")
        else:
            print(f"  NOT FOUND: {name}")

    print("Done.")

if __name__ == "__main__":
    main()
