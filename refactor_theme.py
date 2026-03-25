#!/usr/bin/env python3
"""
refactor_theme.py — Strip inline theme CSS from all pages,
replace with <link> to shared theme.css.

What gets removed from each page's <style>:
  1. :root { --sp-* } block
  2. [data-theme="light"] { --sp-* } block
  3. @media(prefers-color-scheme:light) { html:not(...) { --sp-* }} block
  4. All [data-theme="light"] ... rules
  5. The entire @media(prefers-color-scheme:light) { ... } duplicated block
  6. #theme-toggle CSS rules
  7. .icon-sun / .icon-moon CSS rules

What gets added:
  - <link rel="stylesheet" href="theme.css"> before </head>
  - (theme.js <script> is kept if already present)

Variable names are also migrated: --sp-* → --hlp-*
"""

import re, pathlib

MOCKUPS = pathlib.Path('/Users/peter/Developer/holy-land-photos/mockups')

ALL_PAGES = [
    'about.html', 'aegean-story.html', 'central-turkey-story.html',
    'countries-story.html', 'eastern-turkey-story.html', 'how-to-use.html',
    'index.html', 'permission-story.html', 'reading.html', 'site-list.html',
    'story.html', 'topical.html', 'tour.html', 'turkey-story.html',
    'western-turkey-story.html', 'whats-new-story.html',
]

# Variable rename map
VAR_RENAMES = {
    '--sp-bg': '--hlp-bg',
    '--sp-text': '--hlp-text',
    '--sp-head': '--hlp-head',
    '--sp-accent-h': '--hlp-accent-hover',  # must come before --sp-accent
    '--sp-accent': '--hlp-accent',
    '--sp-red': '--hlp-red',
    '--sp-link': '--hlp-link',
    '--sp-nav3': '--hlp-nav-blur',
    '--sp-nav-d': '--hlp-nav-drawer',
    '--sp-nav': '--hlp-nav-bg',  # must come after --sp-nav-d and --sp-nav3
}

def strip_theme_css(html: str) -> str:
    # 1. Remove the :root{--sp-*} block
    html = re.sub(
        r'\s*:root\s*\{[^}]*--sp-[^}]*\}',
        '', html
    )

    # 2. Remove [data-theme="light"]{--sp-*} variable block
    html = re.sub(
        r'\s*\[data-theme="light"\]\s*\{[^}]*--sp-[^}]*\}',
        '', html
    )

    # 3. Remove @media(prefers-color-scheme:light){ html:not(...){--sp-*}} block
    html = re.sub(
        r'\s*@media\s*\(prefers-color-scheme\s*:\s*light\)\s*\{\s*html:not\(\[data-theme="dark"\]\)\s*\{[^}]*--sp-[^}]*\}\s*\}',
        '', html
    )

    # 4. Remove all [data-theme="light"] single-line rules
    html = re.sub(
        r'\n\s*/\*[^*]*\*/\s*\n(?=\s*\[data-theme="light"\])',
        '\n', html
    )  # remove comment lines that precede light rules
    html = re.sub(
        r'\n\s*\[data-theme="light"\][^\n]*',
        '', html
    )

    # 5. Remove the entire @media(prefers-color-scheme:light) duplicated block
    html = re.sub(
        r'\n\s*/\* Same overrides for system light preference \*/\s*\n\s*@media\s*\(prefers-color-scheme\s*:\s*light\)\s*\{.*?\}\s*\}',
        '', html, flags=re.DOTALL
    )

    # 6. Remove #theme-toggle CSS rules
    html = re.sub(
        r'\n\s*/\* ── Theme toggle button[^\n]*\*/[^}]*\}(?:\s*#theme-toggle[^\{]*\{[^}]*\})*',
        '', html
    )
    # Clean up any remaining #theme-toggle rules
    html = re.sub(r'\n\s*#theme-toggle[^\n]*\{[^}]*\}', '', html)

    # 7. Remove .icon-sun / .icon-moon rules (including inside @media)
    html = re.sub(r'\n\s*#theme-toggle\s+\.icon-(?:sun|moon)\s*\{[^}]*\}', '', html)
    html = re.sub(
        r'\n\s*@media\s*\(prefers-color-scheme\s*:\s*dark\)\s*\{\s*html:not[^}]*icon-(?:sun|moon)[^}]*\}[^}]*\}',
        '', html
    )

    # 8. Remove /* ── Theme variables */ comment line
    html = re.sub(r'\n\s*/\* ── Theme variables[^\n]*\*/', '', html)

    # 9. Remove /* ══ LIGHT THEME ... */ section headers
    html = re.sub(r'\n\s*/\* ══ LIGHT THEME[^\n]*\*/', '', html)

    # 10. Remove leftover /* Body */ etc. comments that preceded light rules
    html = re.sub(r'\n\s*/\* (?:Body|Links|Breadcrumbs|Sticky breadcrumb|Page header|Story intro|Chapters|Dividers|Section label|Search|Cards|Recent list|Signup|Donate|Tour alert|Footer|Progress bar|Prose pages|whats-new-story|Nav always stays dark|Same overrides|whats-new-story topnav) \*/\s*(?=\n\s*\n)', '', html)

    # 11. Rename remaining --sp-* variable references to --hlp-*
    # Order matters: longer names first to avoid partial replacement
    for old, new in VAR_RENAMES.items():
        html = html.replace(old, new)

    # 12. Collapse excessive blank lines
    html = re.sub(r'\n{4,}', '\n\n\n', html)

    return html


def add_theme_link(html: str) -> str:
    """Add <link rel="stylesheet" href="theme.css"> before </head> if not present."""
    if 'theme.css' in html:
        return html
    html = html.replace(
        '<script src="theme.js"></script>',
        '<link rel="stylesheet" href="theme.css">\n  <script src="theme.js"></script>'
    )
    return html


for page in ALL_PAGES:
    path = MOCKUPS / page
    if not path.exists():
        print(f'MISSING: {page}')
        continue

    original = path.read_text('utf-8')
    updated = strip_theme_css(original)
    updated = add_theme_link(updated)

    if updated != original:
        path.write_text(updated, 'utf-8')
        old_lines = original.count('\n')
        new_lines = updated.count('\n')
        print(f'  OK: {page}  ({old_lines} → {new_lines} lines, -{old_lines - new_lines})')
    else:
        print(f'  UNCHANGED: {page}')

print('\nDone.')
