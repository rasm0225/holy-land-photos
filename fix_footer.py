#!/usr/bin/env python3
"""
fix_footer.py
1. Injects missing footer CSS on all dark-theme pages.
2. Replaces footer HTML with new design: pipe separators, extra bottom padding,
   centered links, two visual rows.
"""

import re, pathlib

MOCKUPS = pathlib.Path('/Users/peter/Developer/holy-land-photos/mockups')

DARK_PAGES = [
    'countries-story.html',
    'turkey-story.html',
    'western-turkey-story.html',
    'central-turkey-story.html',
    'eastern-turkey-story.html',
    'aegean-story.html',
    'story.html',
    'about.html',
    'permission-story.html',
    'reading.html',
    'how-to-use.html',
    'site-list.html',
    'topical.html',
    'tour.html',
]

FOOTER_CSS = """
    /* ── Footer ────────────────────────────────────────────────── */
    .site-footer {
      border-top: 1px solid rgba(237,232,225,.08);
      padding: 2.5rem 2rem 5rem;
      text-align: center;
      font-family: system-ui, sans-serif;
    }
    .footer-copy {
      font-size: .75rem; letter-spacing: .04em;
      color: rgba(237,232,225,.28);
      margin-bottom: 1.5rem;
    }
    .footer-links {
      display: flex; flex-wrap: wrap;
      justify-content: center; align-items: center;
      gap: .35rem .6rem;
      line-height: 2;
    }
    .footer-links a {
      font-size: .75rem; letter-spacing: .04em;
      color: rgba(237,232,225,.38);
      text-decoration: none;
      transition: color .2s;
    }
    .footer-links a:hover { color: #C47A4E; }
    .footer-sep {
      color: rgba(237,232,225,.18);
      font-size: .75rem;
      user-select: none;
    }
"""

FOOTER_HTML = """\
  <!-- ── Footer ──────────────────────────────────────────────── -->
  <footer class="site-footer">
    <p class="footer-copy">© <span id="footer-year"></span>. All Images are the property of Dr. Carl Rasmussen unless otherwise noted.</p>
    <nav class="footer-links">
      <a href="countries-story.html">Country List</a>
      <span class="footer-sep">|</span>
      <a href="topical.html">Topic List</a>
      <span class="footer-sep">|</span>
      <a href="reading.html">Reading Recommendations</a>
      <span class="footer-sep">|</span>
      <a href="site-list.html">Complete Site List</a>
      <span class="footer-sep">|</span>
      <a href="permission-story.html">Permission to Use</a>
      <span class="footer-sep">|</span>
      <a href="about.html">About</a>
      <span class="footer-sep">|</span>
      <a href="https://holylandphotos.wordpress.com" target="_blank" rel="noopener">Dr. Rasmussen's Blog</a>
      <span class="footer-sep">|</span>
      <a href="mailto:holylandphotos@gmail.com?subject=Technical%20Feedback">Send Technical Feedback</a>
    </nav>
  </footer>
"""

def transform(html: str) -> str:

    # 1. Remove any existing footer CSS blocks (both old and newly injected)
    #    so we can replace with clean version
    html = re.sub(
        r'\n\s*/\* ── Footer[^\n]*\*/.*?(?=\n\s*/\*|\n\s*</style>)',
        '',
        html, flags=re.DOTALL
    )
    # Also remove standalone footer class rules that may have been added
    html = re.sub(
        r'\n\s*\.(?:site-footer|footer-copy|footer-links|footer-sep)\s*\{[^}]*\}[^\n]*',
        '',
        html
    )

    # 2. Inject fresh footer CSS right before </style>
    html = html.replace('</style>', FOOTER_CSS + '  </style>', 1)

    # 3. Replace the footer HTML (any existing <footer ...>...</footer>)
    old_footer = re.compile(
        r'\s*(?:<!--[^\n]*[Ff]ooter[^\n]*-->\s*)?\s*<footer\b[^>]*>.*?</footer>',
        re.DOTALL
    )
    if old_footer.search(html):
        html = old_footer.sub('\n' + FOOTER_HTML, html, count=1)
    else:
        html = html.replace('</body>', FOOTER_HTML + '\n</body>', 1)

    return html


for page in DARK_PAGES:
    path = MOCKUPS / page
    if not path.exists():
        print(f'MISSING: {page}')
        continue
    original = path.read_text(encoding='utf-8')
    updated = transform(original)
    if updated != original:
        path.write_text(updated, encoding='utf-8')
        print(f'  OK: {page}')
    else:
        print(f'  UNCHANGED: {page}')

print('\nDone.')
