#!/usr/bin/env python3
"""Apply dark/light theme support to all hand-authored story pages."""
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

# Pages with .topnav structure (whats-new-story.html)
TOPNAV_PAGES = ["whats-new-story.html"]

CSS_VARS = """\
    /* ── Theme variables ─────────────────────────────────── */
    :root{
      --sp-bg:#0D0B08;--sp-text:#EDE8E1;--sp-head:#F5F0E8;
      --sp-accent:#C47A4E;--sp-accent-h:#E09060;--sp-red:#B85C2C;--sp-link:#C47A4E;
      --sp-nav:rgba(13,11,8,.97);--sp-nav-d:rgba(13,11,8,.98);--sp-nav3:rgba(13,11,8,.88);}
    [data-theme="light"]{
      --sp-bg:#F9F7F4;--sp-text:#2C2C2C;--sp-head:#1A1512;
      --sp-accent:#B85C2C;--sp-accent-h:#96481F;--sp-red:#96481F;--sp-link:#7A3B18;
      --sp-nav:rgba(44,36,22,.97);--sp-nav-d:rgba(44,36,22,.98);--sp-nav3:rgba(44,36,22,.88);}
    @media(prefers-color-scheme:light){
      html:not([data-theme="dark"]){
        --sp-bg:#F9F7F4;--sp-text:#2C2C2C;--sp-head:#1A1512;
        --sp-accent:#B85C2C;--sp-accent-h:#96481F;--sp-red:#96481F;--sp-link:#7A3B18;
        --sp-nav:rgba(44,36,22,.97);--sp-nav-d:rgba(44,36,22,.98);--sp-nav3:rgba(44,36,22,.88);}}
"""

TOGGLE_BTN_CSS = """\
    /* ── Theme toggle button ─────────────────────────────── */
    #theme-toggle{background:none;border:none;cursor:pointer;color:rgba(237,232,225,.65);
      padding:.4rem;line-height:0;transition:color .2s;flex-shrink:0;}
    #theme-toggle:hover{color:#EDE8E1;}
    #theme-toggle:focus-visible{outline:1px solid var(--sp-accent);outline-offset:2px;}
    #theme-toggle svg{width:17px;height:17px;display:block;}
    #theme-toggle .icon-sun{display:none;}
    #theme-toggle .icon-moon{display:block;}
    [data-theme="dark"] #theme-toggle .icon-sun{display:block;}
    [data-theme="dark"] #theme-toggle .icon-moon{display:none;}
    @media(prefers-color-scheme:dark){
      html:not([data-theme="light"]) #theme-toggle .icon-sun{display:block;}
      html:not([data-theme="light"]) #theme-toggle .icon-moon{display:none;}}
"""

LIGHT_OVERRIDES = """\
    /* ══ LIGHT THEME OVERRIDES ════════════════════════════ */
    [data-theme="light"] body,
    @media(prefers-color-scheme:light){html:not([data-theme="dark"]) body{background:var(--sp-bg);color:var(--sp-text);}}
"""

# All light-theme overrides (body is handled inline above but also here for completeness)
LIGHT_BLOCK = """\
    /* ══ LIGHT THEME CONTENT OVERRIDES ═══════════════════ */
    /* Body */
    [data-theme="light"] body{background:var(--sp-bg);color:var(--sp-text);}
    /* Links */
    [data-theme="light"] a{color:var(--sp-link);}
    [data-theme="light"] a:hover{color:var(--sp-accent);}
    /* Breadcrumbs */
    [data-theme="light"] .story-breadcrumb{border-bottom-color:rgba(44,44,44,.12);}
    [data-theme="light"] .story-breadcrumb .bc-root{color:var(--sp-accent);}
    [data-theme="light"] .story-breadcrumb .bc-mid{color:rgba(44,44,44,.45);}
    [data-theme="light"] .story-breadcrumb .bc-mid:hover{color:rgba(44,44,44,.8);}
    [data-theme="light"] .story-breadcrumb .bc-sep{color:rgba(44,44,44,.22);}
    [data-theme="light"] .story-breadcrumb .bc-current{color:rgba(44,44,44,.7);}
    /* Sticky breadcrumb */
    [data-theme="light"] #sticky-bc{background:rgba(249,247,244,.92);border-bottom-color:rgba(44,44,44,.1);}
    [data-theme="light"] #sticky-bc a{color:rgba(44,44,44,.5);}
    [data-theme="light"] #sticky-bc a:hover{color:var(--sp-text);}
    [data-theme="light"] #sticky-bc .sbc-sep{color:rgba(44,44,44,.22);}
    [data-theme="light"] #sticky-bc .sbc-current{color:rgba(44,44,44,.75);}
    /* Page header (about, reading etc) */
    [data-theme="light"] .page-header{border-bottom-color:rgba(44,44,44,.1);}
    [data-theme="light"] .page-kicker{color:var(--sp-accent);}
    [data-theme="light"] .page-title{color:var(--sp-head);}
    [data-theme="light"] .page-prose{color:rgba(44,44,44,.75);}
    [data-theme="light"] .page-prose h2{color:var(--sp-accent);}
    [data-theme="light"] .page-prose h3{color:var(--sp-head);}
    [data-theme="light"] .page-prose strong{color:var(--sp-head);}
    /* Story intro */
    [data-theme="light"] .story-kicker{color:var(--sp-accent);}
    [data-theme="light"] .story-main-title{color:var(--sp-head);}
    [data-theme="light"] .story-desc{color:rgba(44,44,44,.7);}
    [data-theme="light"] .story-meta{color:rgba(44,44,44,.45);}
    /* Chapters */
    [data-theme="light"] .ch-kicker{color:var(--sp-accent);}
    [data-theme="light"] .ch-title{color:var(--sp-head);}
    [data-theme="light"] .ch-desc{color:rgba(44,44,44,.68);}
    [data-theme="light"] .ch-meta{color:rgba(44,44,44,.45);}
    [data-theme="light"] .ch-body{color:rgba(44,44,44,.75);}
    [data-theme="light"] .ch-body a{color:var(--sp-link);}
    [data-theme="light"] .ch-body a:hover{color:var(--sp-accent);}
    [data-theme="light"] .ch-link{color:var(--sp-link);border-bottom-color:rgba(44,44,44,.2);}
    [data-theme="light"] .ch-link:hover{color:var(--sp-accent);border-bottom-color:var(--sp-accent);}
    /* Dividers */
    [data-theme="light"] .section-divider{background:linear-gradient(to right,transparent,rgba(44,44,44,.12) 20%,rgba(44,44,44,.12) 80%,transparent);}
    /* Section label (hero stats etc) */
    [data-theme="light"] .section-label{color:var(--sp-accent);}
    [data-theme="light"] .hero-title{color:var(--sp-head);}
    [data-theme="light"] .hero-tagline{color:rgba(44,44,44,.6);}
    [data-theme="light"] .hero-stats{color:rgba(44,44,44,.4);}
    [data-theme="light"] .hero-stats span{color:var(--sp-accent);}
    /* Search */
    [data-theme="light"] .search-input{color:var(--sp-text);background:rgba(44,44,44,.04);border-color:rgba(44,44,44,.15);}
    [data-theme="light"] .search-input::placeholder{color:rgba(44,44,44,.35);}
    [data-theme="light"] .search-input:focus{border-color:rgba(184,92,44,.5);background:#fff;}
    [data-theme="light"] .search-btn{color:rgba(44,44,44,.45);}
    [data-theme="light"] .search-hint{color:rgba(44,44,44,.4);}
    /* Cards */
    [data-theme="light"] .card{background:rgba(44,44,44,.025);border-color:rgba(44,44,44,.1);}
    [data-theme="light"] .card:hover{border-color:rgba(184,92,44,.3);background:rgba(44,44,44,.04);}
    [data-theme="light"] .card-title{color:var(--sp-head);}
    [data-theme="light"] .card-desc{color:rgba(44,44,44,.6);}
    [data-theme="light"] .card-cta{color:var(--sp-accent);}
    /* Recent list */
    [data-theme="light"] .recent-item{border-bottom-color:rgba(44,44,44,.1);}
    [data-theme="light"] .recent-title{color:var(--sp-head);}
    [data-theme="light"] .recent-meta{color:rgba(44,44,44,.45);}
    [data-theme="light"] .recent-more{color:var(--sp-accent);}
    [data-theme="light"] .recent-more:hover{color:var(--sp-accent-h);}
    /* Signup */
    [data-theme="light"] .signup-section{border-color:rgba(44,44,44,.12);background:rgba(44,44,44,.025);}
    [data-theme="light"] .signup-title{color:var(--sp-head);}
    [data-theme="light"] .signup-desc{color:rgba(44,44,44,.55);}
    [data-theme="light"] .signup-input{color:var(--sp-text);background:#fff;border-color:rgba(44,44,44,.2);}
    [data-theme="light"] .signup-input::placeholder{color:rgba(44,44,44,.3);}
    [data-theme="light"] .signup-input:focus{border-color:rgba(184,92,44,.5);}
    [data-theme="light"] .signup-btn{background:var(--sp-accent);}
    [data-theme="light"] .signup-btn:hover{background:var(--sp-accent-h);}
    [data-theme="light"] .signup-privacy{color:rgba(44,44,44,.35);}
    /* Donate */
    [data-theme="light"] .donate-text{color:rgba(44,44,44,.55);}
    [data-theme="light"] .donate-btn{color:var(--sp-accent);border-color:rgba(184,92,44,.35);}
    [data-theme="light"] .donate-btn:hover{background:rgba(184,92,44,.08);border-color:var(--sp-accent);}
    /* Tour alert */
    [data-theme="light"] .tour-alert{background:linear-gradient(135deg,rgba(184,92,44,.08),rgba(184,92,44,.04));border-bottom-color:rgba(184,92,44,.2);color:rgba(44,44,44,.75);}
    [data-theme="light"] .tour-alert strong{color:var(--sp-accent);}
    [data-theme="light"] .tour-alert a{color:var(--sp-accent);}
    [data-theme="light"] .tour-alert a:hover{color:var(--sp-accent-h);}
    /* Footer */
    [data-theme="light"] .site-footer{border-top-color:rgba(44,44,44,.12);}
    [data-theme="light"] .footer-copy{color:rgba(44,44,44,.4);}
    [data-theme="light"] .footer-links a{color:rgba(44,44,44,.5);}
    [data-theme="light"] .footer-links a:hover{color:var(--sp-accent);}
    [data-theme="light"] .footer-sep{color:rgba(44,44,44,.22);}
    /* Progress bar */
    [data-theme="light"] #progress{background:var(--sp-accent);}
    /* Prose pages (story-intro, etc) */
    [data-theme="light"] .story-intro-body{color:rgba(44,44,44,.7);}
    [data-theme="light"] .text-wrap{color:rgba(44,44,44,.75);}
    /* whats-new-story specific */
    [data-theme="light"] .hero-kicker{color:var(--sp-accent);}
    [data-theme="light"] .hero-sub{color:rgba(44,44,44,.6);}
    [data-theme="light"] .time-filter a{color:rgba(44,44,44,.55);border-color:rgba(44,44,44,.15);}
    [data-theme="light"] .time-filter a.active{background:var(--sp-accent);color:#fff;}
    [data-theme="light"] .time-filter a:hover{color:var(--sp-accent);border-color:var(--sp-accent);}
    [data-theme="light"] .entry-card{border-bottom-color:rgba(44,44,44,.1);}
    [data-theme="light"] .entry-title{color:var(--sp-head);}
    [data-theme="light"] .entry-meta{color:rgba(44,44,44,.45);}
    [data-theme="light"] .entry-keywords{color:rgba(44,44,44,.4);}
    /* Nav always stays dark — override variable-based text back to light */
    [data-theme="light"] .site-nav{background:var(--sp-nav);}
    [data-theme="light"] .nav-home{color:#EDE8E1;}
    [data-theme="light"] .nav-home:hover{color:var(--sp-accent);}
    [data-theme="light"] .nav-links li a{color:rgba(237,232,225,.65);border-right-color:rgba(237,232,225,.1);}
    [data-theme="light"] .nav-links li a:hover{color:#EDE8E1;}
    [data-theme="light"] .nav-toggle{color:rgba(237,232,225,.75);}
    [data-theme="light"] .nav-toggle:hover{color:#EDE8E1;}
    [data-theme="light"] #nav-drawer{background:var(--sp-nav-d);border-bottom-color:rgba(237,232,225,.1);}
    [data-theme="light"] #nav-drawer a{color:rgba(237,232,225,.75);border-bottom-color:rgba(237,232,225,.07);}
    [data-theme="light"] #nav-drawer a:hover{color:var(--sp-accent);}
    /* whats-new-story topnav */
    [data-theme="light"] .topnav{background:var(--sp-nav);}
    [data-theme="light"] .topnav-logo{color:#EDE8E1;}
    [data-theme="light"] .topnav-links a{color:rgba(237,232,225,.65);}
    [data-theme="light"] .topnav-links a:hover{color:#EDE8E1;}
    /* Same overrides for system light preference */
    @media(prefers-color-scheme:light){
      html:not([data-theme="dark"]) body{background:var(--sp-bg);color:var(--sp-text);}
      html:not([data-theme="dark"]) a{color:var(--sp-link);}
      html:not([data-theme="dark"]) a:hover{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .story-breadcrumb{border-bottom-color:rgba(44,44,44,.12);}
      html:not([data-theme="dark"]) .story-breadcrumb .bc-root{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .story-breadcrumb .bc-mid{color:rgba(44,44,44,.45);}
      html:not([data-theme="dark"]) .story-breadcrumb .bc-mid:hover{color:rgba(44,44,44,.8);}
      html:not([data-theme="dark"]) .story-breadcrumb .bc-sep{color:rgba(44,44,44,.22);}
      html:not([data-theme="dark"]) .story-breadcrumb .bc-current{color:rgba(44,44,44,.7);}
      html:not([data-theme="dark"]) #sticky-bc{background:rgba(249,247,244,.92);border-bottom-color:rgba(44,44,44,.1);}
      html:not([data-theme="dark"]) #sticky-bc a{color:rgba(44,44,44,.5);}
      html:not([data-theme="dark"]) #sticky-bc a:hover{color:var(--sp-text);}
      html:not([data-theme="dark"]) #sticky-bc .sbc-sep{color:rgba(44,44,44,.22);}
      html:not([data-theme="dark"]) #sticky-bc .sbc-current{color:rgba(44,44,44,.75);}
      html:not([data-theme="dark"]) .page-header{border-bottom-color:rgba(44,44,44,.1);}
      html:not([data-theme="dark"]) .page-kicker{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .page-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .page-prose{color:rgba(44,44,44,.75);}
      html:not([data-theme="dark"]) .page-prose h2{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .page-prose h3{color:var(--sp-head);}
      html:not([data-theme="dark"]) .page-prose strong{color:var(--sp-head);}
      html:not([data-theme="dark"]) .story-kicker{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .story-main-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .story-desc{color:rgba(44,44,44,.7);}
      html:not([data-theme="dark"]) .story-meta{color:rgba(44,44,44,.45);}
      html:not([data-theme="dark"]) .ch-kicker{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .ch-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .ch-desc{color:rgba(44,44,44,.68);}
      html:not([data-theme="dark"]) .ch-meta{color:rgba(44,44,44,.45);}
      html:not([data-theme="dark"]) .ch-body{color:rgba(44,44,44,.75);}
      html:not([data-theme="dark"]) .ch-body a{color:var(--sp-link);}
      html:not([data-theme="dark"]) .ch-body a:hover{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .ch-link{color:var(--sp-link);border-bottom-color:rgba(44,44,44,.2);}
      html:not([data-theme="dark"]) .ch-link:hover{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .section-divider{background:linear-gradient(to right,transparent,rgba(44,44,44,.12) 20%,rgba(44,44,44,.12) 80%,transparent);}
      html:not([data-theme="dark"]) .section-label{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .hero-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .hero-tagline{color:rgba(44,44,44,.6);}
      html:not([data-theme="dark"]) .hero-stats{color:rgba(44,44,44,.4);}
      html:not([data-theme="dark"]) .hero-stats span{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .search-input{color:var(--sp-text);background:rgba(44,44,44,.04);border-color:rgba(44,44,44,.15);}
      html:not([data-theme="dark"]) .search-input::placeholder{color:rgba(44,44,44,.35);}
      html:not([data-theme="dark"]) .search-input:focus{border-color:rgba(184,92,44,.5);background:#fff;}
      html:not([data-theme="dark"]) .search-btn{color:rgba(44,44,44,.45);}
      html:not([data-theme="dark"]) .search-hint{color:rgba(44,44,44,.4);}
      html:not([data-theme="dark"]) .card{background:rgba(44,44,44,.025);border-color:rgba(44,44,44,.1);}
      html:not([data-theme="dark"]) .card:hover{border-color:rgba(184,92,44,.3);}
      html:not([data-theme="dark"]) .card-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .card-desc{color:rgba(44,44,44,.6);}
      html:not([data-theme="dark"]) .card-cta{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .recent-item{border-bottom-color:rgba(44,44,44,.1);}
      html:not([data-theme="dark"]) .recent-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .recent-meta{color:rgba(44,44,44,.45);}
      html:not([data-theme="dark"]) .recent-more{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .signup-section{border-color:rgba(44,44,44,.12);background:rgba(44,44,44,.025);}
      html:not([data-theme="dark"]) .signup-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .signup-desc{color:rgba(44,44,44,.55);}
      html:not([data-theme="dark"]) .signup-input{color:var(--sp-text);background:#fff;border-color:rgba(44,44,44,.2);}
      html:not([data-theme="dark"]) .signup-input::placeholder{color:rgba(44,44,44,.3);}
      html:not([data-theme="dark"]) .signup-btn{background:var(--sp-accent);}
      html:not([data-theme="dark"]) .signup-btn:hover{background:var(--sp-accent-h);}
      html:not([data-theme="dark"]) .donate-text{color:rgba(44,44,44,.55);}
      html:not([data-theme="dark"]) .donate-btn{color:var(--sp-accent);border-color:rgba(184,92,44,.35);}
      html:not([data-theme="dark"]) .donate-btn:hover{background:rgba(184,92,44,.08);}
      html:not([data-theme="dark"]) .tour-alert{background:linear-gradient(135deg,rgba(184,92,44,.08),rgba(184,92,44,.04));border-bottom-color:rgba(184,92,44,.2);color:rgba(44,44,44,.75);}
      html:not([data-theme="dark"]) .tour-alert strong{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .tour-alert a{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .site-footer{border-top-color:rgba(44,44,44,.12);}
      html:not([data-theme="dark"]) .footer-copy{color:rgba(44,44,44,.4);}
      html:not([data-theme="dark"]) .footer-links a{color:rgba(44,44,44,.5);}
      html:not([data-theme="dark"]) .footer-links a:hover{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .footer-sep{color:rgba(44,44,44,.22);}
      html:not([data-theme="dark"]) #progress{background:var(--sp-accent);}
      html:not([data-theme="dark"]) .story-intro-body{color:rgba(44,44,44,.7);}
      html:not([data-theme="dark"]) .text-wrap{color:rgba(44,44,44,.75);}
      html:not([data-theme="dark"]) .hero-kicker{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .hero-sub{color:rgba(44,44,44,.6);}
      html:not([data-theme="dark"]) .time-filter a{color:rgba(44,44,44,.55);border-color:rgba(44,44,44,.15);}
      html:not([data-theme="dark"]) .time-filter a.active{background:var(--sp-accent);color:#fff;}
      html:not([data-theme="dark"]) .time-filter a:hover{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .entry-card{border-bottom-color:rgba(44,44,44,.1);}
      html:not([data-theme="dark"]) .entry-title{color:var(--sp-head);}
      html:not([data-theme="dark"]) .entry-meta{color:rgba(44,44,44,.45);}
      html:not([data-theme="dark"]) .entry-keywords{color:rgba(44,44,44,.4);}
      /* Nav stays dark */
      html:not([data-theme="dark"]) .site-nav{background:var(--sp-nav);}
      html:not([data-theme="dark"]) .nav-home{color:#EDE8E1;}
      html:not([data-theme="dark"]) .nav-home:hover{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .nav-links li a{color:rgba(237,232,225,.65);border-right-color:rgba(237,232,225,.1);}
      html:not([data-theme="dark"]) .nav-links li a:hover{color:#EDE8E1;}
      html:not([data-theme="dark"]) .nav-toggle{color:rgba(237,232,225,.75);}
      html:not([data-theme="dark"]) .nav-toggle:hover{color:#EDE8E1;}
      html:not([data-theme="dark"]) #nav-drawer{background:var(--sp-nav-d);border-bottom-color:rgba(237,232,225,.1);}
      html:not([data-theme="dark"]) #nav-drawer a{color:rgba(237,232,225,.75);border-bottom-color:rgba(237,232,225,.07);}
      html:not([data-theme="dark"]) #nav-drawer a:hover{color:var(--sp-accent);}
      html:not([data-theme="dark"]) .topnav{background:var(--sp-nav);}
      html:not([data-theme="dark"]) .topnav-logo{color:#EDE8E1;}
      html:not([data-theme="dark"]) .topnav-links a{color:rgba(237,232,225,.65);}
      html:not([data-theme="dark"]) .topnav-links a:hover{color:#EDE8E1;}}
"""

TOGGLE_BTN_HTML = '''\
    <button id="theme-toggle" aria-label="Toggle light/dark theme" title="Toggle light/dark theme">
      <svg class="icon-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>'''

def process_file(path, nav_type="site-nav"):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Skip if already processed
    if "theme-toggle" in content:
        print(f"  SKIP (already processed): {os.path.basename(path)}")
        return

    # 2. Add theme.js script before </head>
    content = content.replace("</head>", '  <script src="theme.js"></script>\n</head>', 1)

    # 3. Insert CSS variables right after <style> opening tag
    content = re.sub(r'(<style>)\s*\n', r'\1\n' + CSS_VARS + '\n', content, count=1)

    # 4. Replace body background/text with CSS variables
    content = content.replace("background: #0D0B08;", "background: var(--sp-bg);", 1)
    # Only replace color in body rule context (first occurrence near background)
    content = re.sub(
        r'(background:\s*var\(--sp-bg\);[^\n]*\n\s*)color:\s*#EDE8E1;',
        r'\1color: var(--sp-text);',
        content, count=1
    )

    # 5. Replace link colors (global a rule)
    content = re.sub(r'\ba\s*\{\s*color:\s*#C47A4E;\s*\}', 'a { color: var(--sp-link); }', content)
    content = re.sub(r'a:hover\s*\{\s*color:\s*#E09060;\s*\}', 'a:hover { color: var(--sp-accent-h); }', content)

    # 6. Replace nav backgrounds with CSS variables
    content = re.sub(r'background:\s*rgba\(13,11,8,\.97\)', 'background: var(--sp-nav)', content)
    content = re.sub(r'background:\s*rgba\(13,11,8,\.98\)', 'background: var(--sp-nav-d)', content)
    content = re.sub(r'background:\s*rgba\(13,11,8,\.88\)', 'background: var(--sp-nav3)', content)

    # 7. Add light theme override block + toggle button CSS before </style>
    content = content.replace("</style>", LIGHT_BLOCK + TOGGLE_BTN_CSS + "  </style>", 1)

    # 8. Add toggle button HTML to nav
    if nav_type == "site-nav":
        # Insert before </nav> that closes .site-nav (the first </nav> after site-nav)
        # The nav structure is: <nav class="site-nav"...> ... <button class="nav-toggle"...> ... </nav>
        # Insert the toggle button before the nav-toggle button
        content = re.sub(
            r'(<button class="nav-toggle")',
            TOGGLE_BTN_HTML + '\n    \\1',
            content, count=1
        )
    elif nav_type == "topnav":
        # Insert before </nav> of .topnav
        content = re.sub(
            r'(</ul>\s*</nav>)',
            '</ul>\n' + TOGGLE_BTN_HTML + '\n  </nav>',
            content, count=1
        )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  OK: {os.path.basename(path)}")

def main():
    print("Processing story pages...")
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
