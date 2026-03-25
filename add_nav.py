#!/usr/bin/env python3
"""
add_nav.py
Adds the site-wide top navigation bar and updated footer to all dark-theme
mockup pages.  Run once; idempotent-ish (checks for .site-nav before acting).
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

# ── Shared HTML snippets ──────────────────────────────────────────────────────

NAV_CSS = """
    /* ── Top navigation ────────────────────────────────────────── */
    .site-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      height: 52px;
      background: rgba(13,11,8,.97);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex; align-items: center;
      padding: 0 2rem;
      border-bottom: 1px solid rgba(237,232,225,.09);
    }
    .nav-home {
      font-family: system-ui, sans-serif;
      font-size: .8rem; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      color: #EDE8E1; text-decoration: none;
      margin-right: auto; white-space: nowrap;
      transition: color .2s;
    }
    .nav-home:hover { color: #B85C2C; }
    .nav-links {
      display: flex; align-items: center;
      list-style: none; gap: 0;
    }
    .nav-links li a {
      display: block;
      font-family: system-ui, sans-serif;
      font-size: .75rem; letter-spacing: .05em;
      color: rgba(237,232,225,.65);
      text-decoration: none;
      padding: 0 .95rem;
      border-right: 1px solid rgba(237,232,225,.1);
      white-space: nowrap;
      transition: color .2s;
    }
    .nav-links li:last-child a { border-right: none; }
    .nav-links li a:hover { color: #EDE8E1; }
    .nav-toggle {
      display: none;
      background: none; border: none; cursor: pointer;
      padding: .4rem; color: rgba(237,232,225,.75);
      line-height: 0; transition: color .2s;
    }
    .nav-toggle:hover { color: #EDE8E1; }
    #nav-drawer {
      display: none;
      position: fixed; top: 52px; left: 0; right: 0; z-index: 199;
      background: rgba(13,11,8,.98);
      border-bottom: 1px solid rgba(237,232,225,.1);
      padding: .75rem 2rem 1.25rem;
    }
    #nav-drawer.open { display: block; }
    #nav-drawer a {
      display: block;
      font-family: system-ui, sans-serif;
      font-size: .9rem; letter-spacing: .03em;
      color: rgba(237,232,225,.75);
      text-decoration: none;
      padding: .6rem 0;
      border-bottom: 1px solid rgba(237,232,225,.07);
      transition: color .2s;
    }
    #nav-drawer a:last-child { border-bottom: none; }
    #nav-drawer a:hover { color: #C47A4E; }
    @media (max-width: 680px) {
      .nav-links { display: none; }
      .nav-toggle { display: block; }
    }
    /* body offset for fixed nav */
    body { padding-top: 52px; }
    /* ── Footer ─────────────────────────────────────────────────── */
    .site-footer {
      border-top: 1px solid rgba(237,232,225,.08);
      padding: 2.5rem 2rem;
      text-align: center;
      font-family: system-ui, sans-serif;
    }
    .footer-copy {
      font-size: .75rem; letter-spacing: .04em;
      color: rgba(237,232,225,.3);
      margin-bottom: 1rem;
    }
    .footer-links {
      display: flex; flex-wrap: wrap;
      justify-content: center; gap: .25rem 0;
    }
    .footer-links a {
      font-size: .75rem; letter-spacing: .04em;
      color: rgba(237,232,225,.4);
      text-decoration: none;
      padding: 0 .85rem;
      border-right: 1px solid rgba(237,232,225,.12);
      transition: color .2s;
    }
    .footer-links a:last-child { border-right: none; }
    .footer-links a:hover { color: #C47A4E; }
"""

NAV_HTML = """\
  <nav class="site-nav" aria-label="Site navigation">
    <a href="index.html" class="nav-home">Holy Land Photos</a>
    <ul class="nav-links">
      <li><a href="countries-story.html">Country List</a></li>
      <li><a href="topical.html">Topic List</a></li>
      <li><a href="#">Recent Additions</a></li>
      <li><a href="#">Search</a></li>
    </ul>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav-drawer" aria-label="Open menu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="2" y1="5" x2="18" y2="5"/>
        <line x1="2" y1="10" x2="18" y2="10"/>
        <line x1="2" y1="15" x2="18" y2="15"/>
      </svg>
    </button>
  </nav>
  <div id="nav-drawer" aria-hidden="true">
    <a href="countries-story.html">Country List</a>
    <a href="topical.html">Topic List</a>
    <a href="#">Recent Additions</a>
    <a href="reading.html">Reading Recommendations</a>
    <a href="about.html">About</a>
    <a href="#">Search</a>
  </div>
"""

FOOTER_HTML = """\
  <!-- ── Footer ──────────────────────────────────────────────── -->
  <footer class="site-footer">
    <p class="footer-copy">© <span id="footer-year"></span>. All Images are the property of Dr. Carl Rasmussen unless otherwise noted.</p>
    <nav class="footer-links">
      <a href="countries-story.html">Country List</a>
      <a href="topical.html">Topic List</a>
      <a href="reading.html">Reading Recommendations</a>
      <a href="site-list.html">Complete Site List</a>
      <a href="permission-story.html">Permission to Use</a>
      <a href="about.html">About</a>
      <a href="https://holylandphotos.wordpress.com" target="_blank" rel="noopener">Dr. Rasmussen's Blog</a>
      <a href="mailto:holylandphotos@gmail.com?subject=Technical%20Feedback">Send Technical Feedback</a>
    </nav>
  </footer>
"""

NAV_JS = """\
    // ── Mobile nav ──────────────────────────────────────────────
    (function () {
      var toggle = document.querySelector('.nav-toggle');
      var drawer = document.getElementById('nav-drawer');
      if (toggle && drawer) {
        toggle.addEventListener('click', function () {
          var open = drawer.classList.toggle('open');
          toggle.setAttribute('aria-expanded', open);
          drawer.setAttribute('aria-hidden', String(!open));
        });
      }
      var fy = document.getElementById('footer-year');
      if (fy) fy.textContent = new Date().getFullYear();
    })();
"""

# ── Per-file transformations ──────────────────────────────────────────────────

def transform(html: str, filename: str) -> str:

    # 1. Skip if already processed
    if 'class="site-nav"' in html:
        print(f'  SKIP (already has site-nav)')
        return html

    # 2. Inject nav CSS + footer CSS + body padding-top before </style>
    #    Insert before the LAST </style> in the <head>
    html = html.replace('</style>', NAV_CSS + '  </style>', 1)

    # 3. Remove any old footer CSS that's now superseded
    #    (story-footer class used on static pages)
    html = re.sub(
        r'\s*\.story-footer\s*\{[^}]*\}\s*'
        r'(?:\.story-footer\s+a\s*\{[^}]*\}\s*)*'
        r'(?:\.story-footer\s+a:hover\s*\{[^}]*\}\s*)?',
        '\n    ', html
    )
    # Remove old site-footer CSS block if present (we're replacing with fresh one above)
    html = re.sub(
        r'\s*/\*\s*──\s*Footer[^*]*\*+/.*?(?=\n\s*/\*|\n\s*</style>)',
        '', html, flags=re.DOTALL
    )

    # 4. Fix sticky-bc top: 0 → top: 52px (handles multi-line and single-line)
    html = html.replace(
        'position: fixed; top: 0; left: 0; right: 0; z-index: 95;',
        'position: fixed; top: 52px; left: 0; right: 0; z-index: 95;'
    )
    # single-line variant in static pages
    html = re.sub(
        r'(#sticky-bc\s*\{[^}]*?)top:\s*0([^}]*\})',
        lambda m: m.group(1) + 'top: 52px' + m.group(2),
        html
    )

    # 5. Raise #progress z-index so it appears above nav bar (as thin line at very top)
    html = re.sub(
        r'(#progress\s*\{[^}]*?z-index:\s*)\d+',
        r'\g<1>300',
        html
    )

    # 6. Inject nav HTML right after <body> opening tag
    html = re.sub(
        r'(<body[^>]*>)\s*\n',
        r'\1\n\n' + NAV_HTML + '\n',
        html, count=1
    )

    # 7. Replace old footer(s) with new standard footer
    #    Handles: <footer class="story-footer">, <footer class="site-footer">
    old_footer_pattern = re.compile(
        r'\s*(?:<!--[^>]*[Ff]ooter[^>]*-->\s*)?\s*<footer\s[^>]*>.*?</footer>',
        re.DOTALL
    )
    if old_footer_pattern.search(html):
        html = old_footer_pattern.sub('\n' + FOOTER_HTML, html, count=1)
    else:
        # No existing footer — insert before </body>
        html = html.replace('</body>', FOOTER_HTML + '\n</body>', 1)

    # 8. Remove stale footer-year JS lines (will be replaced by NAV_JS)
    html = re.sub(
        r"\s*document\.getElementById\('footer-year'\)\.textContent\s*=\s*new Date\(\)\.getFullYear\(\);?\n?",
        '\n',
        html
    )

    # 9. Inject nav JS at the start of the first <script> block
    html = html.replace('<script>', '<script>\n' + NAV_JS, 1)

    return html


# ── Main ──────────────────────────────────────────────────────────────────────

for page in DARK_PAGES:
    path = MOCKUPS / page
    if not path.exists():
        print(f'MISSING: {page}')
        continue
    original = path.read_text(encoding='utf-8')
    updated = transform(original, page)
    if updated != original:
        path.write_text(updated, encoding='utf-8')
        print(f'  OK: {page}')
    else:
        print(f'  UNCHANGED: {page}')

print('\nDone.')
