#!/usr/bin/env python3
"""Fix chapter-figure black background showing through in light mode."""
import pathlib, re

MOCKUPS = pathlib.Path('/Users/peter/Developer/holy-land-photos/mockups')

PAGES = [
    'countries-story.html', 'turkey-story.html', 'western-turkey-story.html',
    'central-turkey-story.html', 'eastern-turkey-story.html',
    'aegean-story.html', 'story.html', 'whats-new-story.html',
]

LIGHT_RULE = '    [data-theme="light"] .chapter-figure{background:#F0EDE8;}\n'
MEDIA_RULE = '      html:not([data-theme="dark"]) .chapter-figure{background:#F0EDE8;}\n'

for page in PAGES:
    path = MOCKUPS / page
    if not path.exists():
        print(f'MISSING: {page}')
        continue
    html = path.read_text('utf-8')

    changed = False

    # 1. Add [data-theme="light"] override if missing
    if '[data-theme="light"] .chapter-figure' not in html:
        # Insert right before the /* ══ LIGHT THEME CONTENT OVERRIDES */ block's footer section
        # or right after the last [data-theme="light"] rule before </style>
        # Safest: insert before the @media(prefers-color-scheme:light) block
        html = html.replace(
            '    /* Same overrides for system light preference */',
            LIGHT_RULE + '    /* Same overrides for system light preference */'
        )
        changed = True

    # 2. Add prefers-color-scheme rule if missing
    if 'html:not([data-theme="dark"]) .chapter-figure' not in html:
        # Insert before the closing of the @media block — find the nav section
        # Insert before "/* Nav stays dark */" inside the media block
        html = html.replace(
            '      /* Nav stays dark */',
            MEDIA_RULE + '      /* Nav stays dark */'
        )
        changed = True

    if changed:
        path.write_text(html, 'utf-8')
        print(f'  OK: {page}')
    else:
        print(f'  SKIP: {page}')

print('Done.')
