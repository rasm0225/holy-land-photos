#!/usr/bin/env python3
"""Generate all Smyrna/Izmir mockup pages. Run: python3 generate_mockups.py"""
import os, html as _h, re as _re

def _desc_from_comments(html_str):
    """Extract plain-text description from first <p> of comments (max 160 chars)."""
    m = _re.search(r'<p>(.*?)</p>', html_str, _re.S)
    if not m:
        return ""
    text = _re.sub(r'<[^>]+>', '', m.group(1)).replace('\n', ' ').strip()
    text = _h.unescape(text)
    if len(text) > 157:
        text = text[:157].rsplit(' ', 1)[0] + '...'
    return text

ROOT     = os.path.dirname(os.path.abspath(__file__))
MOCKUPS  = os.path.join(ROOT, "mockups")
PHOTOS_D = os.path.join(MOCKUPS, "photos")
os.makedirs(PHOTOS_D, exist_ok=True)

PHOTOS = [
    (1,  "TWCSSM20", "Agora Panorama",          "October 12, 2015"),
    (2,  "TWCSSM21", "Agora",                   "October 21, 2015"),
    (3,  "TWCSSM10", "Citadel",                 "April 28, 2015"),
    (4,  "TWCSSM02", "The City",                "October 11, 2011"),
    (5,  "TWCSSM03", "Agora From Above",        "March 26, 2025"),
    (6,  "TWCSSM04", "Agora Portico",           "March 26, 2025"),
    (7,  "TWCSSM30", "Cryptoporticus",          "March 26, 2025"),
    (8,  "TWCSSM07", "Underground Agora 1",     "July 13, 2008"),
    (9,  "TWCSSM08", "Underground Agora 2",     "July 13, 2008"),
    (10, "TWCSSM05", "Underground Agora 3",     "October 12, 2011"),
    (11, "TWCSSM12", "Cryptoporticus Nymphaeum","October 12, 2011"),
    (12, "TWCSSM13", "Spring",                  "October 12, 2011"),
    (13, "TWCSSM01", "Citadel Cisterns",        "October 12, 2011"),
    (14, "TWCSSM09", "Avenue & Water",          "July 13, 2008"),
]
_by_num = {p[0]: p for p in PHOTOS}
_by_id  = {p[1]: p for p in PHOTOS}

def prev_next(img_id):
    n = _by_id[img_id][0]
    return _by_num.get(n-1), _by_num.get(n+1)

COMMENTS = {
    "TWCSSM20": (
        "<p>View looking north at the \u201copen space\u201d of the agora of ancient Smyrna. "
        "On the left (west) notice the columns where the western portico and the "
        "<a href=\"TWCSSM05.html\">western Cryptoporticus</a> is located. "
        "On the far (north) side of the agora is a \u201cbasilica\u201d\u2014it is covered "
        "by a protective covering because of the "
        "<a href=\"TWCSSM07.html\">valuable wall graffiti in the lower Cryptoporticus</a>.</p>"
        "<p>Tip: to view the wonderful details of this panorama, please download at "
        "\u201cMax Size Available\u201d (see button above).</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM21": (
        "<p>View looking north at the \u201copen space\u201d of the agora of ancient Smyrna. "
        "On the left (west) notice the columns where the western portico and the "
        "<a href=\"TWCSSM05.html\">western Cryptoporticus</a> is located. "
        "On the far (north) side of the agora is a \u201cbasilica\u201d\u2014it is covered "
        "by a protective covering because of the "
        "<a href=\"TWCSSM07.html\">valuable wall graffiti in the lower Cryptoporticus</a>.</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM10": (
        "<p>View from within the agora looking southeast towards the ancient citadel. "
        "The modern name for the citadel is \u201cKadifekale\u201d \u201cthe velvet castle,\u201d "
        "while the ancient name was Mt. Pagus. Major development of the citadel began during "
        "the days of Alexander the Great (d. 323 B.C.). Note the architectural fragments "
        "that have been assembled in the agora.</p>"
        "<p>For an overview of the city and the agora "
        "<a href=\"TWCSSM03.html\">click here</a>.</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM02": (
        "<p>View looking down from the Kadifekale (= \u201cthe velvet castle\u201d; actually the "
        "citadel of Smyrna) to north northwest at modern Izmir. Just above, and to the left of, "
        "the skyscraper (what else than the Hilton Hotel!), an outline of the bay of Izmir is "
        "visible. Izmir is the third largest city of Turkey with about 2,700,000 people.</p>"
        "<p>For a more detailed view of the city and the agora "
        "<a href=\"TWCSSM03.html\">click here</a>.</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM03": (
        "<p>View looking down from the Kadifekale to the north northeast at modern Izmir and "
        "the area of the ancient agora. Above and to the right of the center of the image is "
        "a seven-level parking garage. The open space just below the garage is the area of the "
        "ancient agora \u2014 one of the few conveniently available ancient remains of ancient Smyrna.</p>"
        "<p>For details of the agora, <a href=\"TWCSSM04.html\">click here</a>.</p>"
        "<p>For a more general view of the city, <a href=\"TWCSSM02.html\">click here</a>.</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM04": (
        "<p>View looking north at the remains of the large western portico of the agora. "
        "On the left side of the image, note the arches of the underground (lower portion) of "
        "the agora. For a view of the area underneath these arches (the Cryptoporticus) "
        "<a href=\"TWCSSM07.html\">click here</a>.</p>"
        "<p>The re\u2013erected columns with the Corinthian capitals outline the upper agora.</p>"
        "<p>For an overview of the city and the agora, <a href=\"TWCSSM03.html\">click here</a>. "
        "For the lower agora, <a href=\"TWCSSM07.html\">click here</a>. "
        "For a map and a brief description of Smyrna/Izmir, "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM30": (
        "<p>View looking north across the tops of the three rows of arches under which were "
        "the three vaulted storage areas that composed the Cryptoporticus. These arches in turn "
        "supported a long covered portico that was located on the east side of the agora.</p>"
        "<p>The green grass on the left is the area of the Agora.</p>"
    ),
    "TWCSSM07": (
        "<p>View of a portion of the lower portion of the agora (the Cryptoporticus). "
        "A similar two-story agora has also been found in the excavations at Thessaloniki (Greece).</p>"
        "<p>Note the covered frescos on the left side of the passageway (eventually, these will "
        "be open to the public). Above this was the main shopping area of the agora.</p>"
        "<p>For an overview of the city and the agora <a href=\"TWCSSM03.html\">click here</a>. "
        "For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM08": (
        "<p>View of a portion of the lower portion of the agora (the Cryptoporticus). "
        "Note the remnant of frescos on the wall to the right!</p>"
        "<p>In January 2003 the Turks had begun large-scale excavations of the agora and were "
        "opening large portions of the northeastern Cryptoporticus. These major excavations "
        "and reconstructions are ongoing.</p>"
        "<p>A similar two-story agora has also been found in the excavations at Thessaloniki (Greece).</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM05": (
        "<p>View of one of the canals that leads from one of the springs located in the western "
        "portion of the lower agora (the Cryptoporticus). The water in the canal flows toward "
        "the viewer. A similar two-story agora has also been found in the excavations at "
        "Thessaloniki (Greece).</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM12": (
        "<p>View looking south at a water basin and the south end of the lower portion of the "
        "agora (the Cryptoporticus). The arches in the image supported the ground level portion "
        "of the western portico.</p>"
        "<p>For an overview of the city and the agora <a href=\"TWCSSM03.html\">click here</a>. "
        "For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM13": (
        "<p>View of one of the springs that are still flowing in the underground portion of the "
        "agora\u2014the Cryptoporticus.</p>"
        "<p>For an overview of the city and the agora <a href=\"TWCSSM03.html\">click here</a>. "
        "For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM01": (
        "<p>View of remains located on the top of the citadel of ancient Smyrna, Kadifekale "
        "(the \u201cvelvet castle\u201d) or the ancient Pagus. A Turkish wall that is built upon "
        "Hellenistic foundations surrounds this area. At various spots ancient remains, such as "
        "these cisterns, are visible on the surface.</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
    "TWCSSM09": (
        "<p>View of one of the avenues of Izmir that has a decorative water channel alongside "
        "of it. The blue building in the back of the image is a mosque with a white base of a "
        "minaret to the right of it.</p>"
        "<p>For a map and a brief description of Smyrna/Izmir "
        "<a href=\"../smyrna.html\">click here</a>.</p>"
    ),
}

CSS = """\
:root{--bg:#F9F7F4;--bg-sidebar:#F2EDE8;--accent:#B85C2C;--accent-hover:#96481F;
--text:#2C2C2C;--text-muted:#6B6156;--text-light:#9C8E84;--border:#DDD5CB;
--link:#7A3B18;--nav-bg:#2C2416;--sidebar-w:264px;--radius:4px;
--shadow:0 2px 10px rgba(0,0,0,.10)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:17px}
body{font-family:Georgia,'Times New Roman',serif;background:var(--bg);color:var(--text);line-height:1.7}
a{color:var(--link)}a:hover{color:var(--accent)}
img{max-width:100%;height:auto;display:block}
.topnav{background:var(--nav-bg)}
.topnav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;
justify-content:space-between;padding:0 1.5rem;height:46px}
.site-logo{color:#F9F7F4;text-decoration:none;font-family:system-ui,sans-serif;
font-size:.88rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.site-logo span{color:var(--accent)}
.topnav-links{display:flex;list-style:none;font-family:system-ui,sans-serif;font-size:.78rem}
.topnav-links li+li{border-left:1px solid #443A2E}
.topnav-links a{color:#C4B8AE;text-decoration:none;padding:0 .7rem;line-height:46px;
display:block;transition:color .15s}
.topnav-links a:hover{color:#fff}
.site-header{background:#fff;border-bottom:1px solid var(--border);padding:.9rem 1.5rem}
.site-header-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:1.5rem}
.site-wordmark a{text-decoration:none}
.site-wordmark h1{font-size:1.35rem;font-weight:normal;color:var(--accent);line-height:1.2}
.tagline{font-family:system-ui,sans-serif;font-size:.68rem;color:var(--text-muted);
letter-spacing:.09em;text-transform:uppercase}
.site-search{flex:1;max-width:380px;display:flex}
.site-search input{flex:1;padding:.42rem .75rem;border:1px solid var(--border);
border-right:none;border-radius:var(--radius) 0 0 var(--radius);font-size:.88rem;
background:var(--bg);color:var(--text);font-family:inherit}
.site-search input:focus{outline:none;border-color:var(--accent)}
.site-search button{padding:.42rem .9rem;background:var(--accent);color:#fff;border:none;
border-radius:0 var(--radius) var(--radius) 0;font-size:.82rem;
font-family:system-ui,sans-serif;cursor:pointer;transition:background .15s}
.site-search button:hover{background:var(--accent-hover)}
.page-layout{max-width:1200px;margin:0 auto;display:grid;
grid-template-columns:var(--sidebar-w) 1fr}
.sidebar{background:var(--bg-sidebar);border-right:1px solid var(--border);
padding:1.5rem 1rem;font-family:system-ui,sans-serif;font-size:.82rem}
.breadcrumb{color:var(--text-muted);margin-bottom:1.25rem;line-height:1.6}
.breadcrumb a{color:var(--link);text-decoration:none;font-size:.78rem}
.breadcrumb a:hover{text-decoration:underline}
.breadcrumb .sep{margin:0 .2rem;color:var(--text-light)}
.breadcrumb .current{color:var(--accent);font-weight:600}
.view-toggle{display:flex;margin-bottom:1rem}
.view-toggle a{flex:1;text-align:center;padding:.28rem .5rem;font-size:.76rem;
text-decoration:none;border:1px solid var(--border);color:var(--text-muted);
background:#fff;transition:all .15s}
.view-toggle a:first-child{border-radius:var(--radius) 0 0 var(--radius)}
.view-toggle a:last-child{border-radius:0 var(--radius) var(--radius) 0;border-left:none}
.view-toggle a.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.sidebar-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
color:var(--text-light);margin-bottom:.5rem;padding-bottom:.35rem;
border-bottom:1px solid var(--border)}
.nav-list{list-style:none}
.nav-list li a{display:block;padding:.28rem .5rem;border-radius:var(--radius);
text-decoration:none;color:var(--link);font-size:.8rem;transition:background .1s}
.nav-list li a:hover{background:var(--border);color:var(--accent)}
.nav-list li.active a{background:var(--accent);color:#fff;font-weight:600}
.main-content{padding:1.75rem 2.25rem 3rem}
.page-title{font-size:1.65rem;font-weight:normal;color:var(--accent);
margin-bottom:1.25rem;line-height:1.3}
.section-intro{display:flex;gap:2rem;align-items:flex-start;margin-bottom:1.5rem}
.section-image{flex-shrink:0;border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
.section-image img{display:block;width:100%;max-height:420px;object-fit:contain}
.section-desc{flex:1;min-width:0;max-width:65ch}
.section-desc p{margin-bottom:.85rem;font-size:1rem;line-height:1.78}
.section-desc p:last-child{margin-bottom:0}
.photo-title{font-size:1.65rem;font-weight:normal;color:var(--accent);
margin-bottom:.3rem;line-height:1.3}
.photo-location{font-family:system-ui,sans-serif;font-size:.83rem;
color:var(--text-muted);margin-bottom:1.25rem}
.photo-location a{color:var(--text-muted);text-decoration:none}
.photo-location a:hover{color:var(--link);text-decoration:underline}
.photo-frame{background:#1A1512;border-radius:var(--radius);overflow:hidden;
cursor:zoom-in;position:relative;margin-bottom:.85rem;
box-shadow:var(--shadow);max-width:760px}
.photo-frame img{width:100%;transition:opacity .2s}
.photo-frame:hover img{opacity:.93}
.zoom-hint{position:absolute;bottom:.65rem;right:.75rem;background:rgba(0,0,0,.52);
color:#fff;font-family:system-ui,sans-serif;font-size:.7rem;
padding:.18rem .45rem;border-radius:3px;pointer-events:none}
.photo-controls{display:flex;align-items:center;justify-content:space-between;
gap:1rem;margin-bottom:1.75rem;flex-wrap:wrap;max-width:760px}
.pagination{display:flex;align-items:center;gap:.4rem;font-family:system-ui,sans-serif}
.pagination a,.pagination .pg-info,.pagination .pg-disabled{display:inline-flex;
align-items:center;padding:.3rem .65rem;border:1px solid var(--border);
border-radius:var(--radius);text-decoration:none;color:var(--link);
background:#fff;font-size:.8rem;transition:all .15s}
.pagination .pg-info{color:var(--text-muted);cursor:default}
.pagination .pg-disabled{color:var(--text-light);cursor:default}
.pagination a:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.toolbar{display:flex;gap:.45rem;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:.3rem;padding:.32rem .72rem;
border-radius:var(--radius);font-family:system-ui,sans-serif;font-size:.78rem;
font-weight:500;cursor:pointer;text-decoration:none;
border:1px solid transparent;transition:all .15s}
.btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.btn-primary:hover{background:var(--accent-hover);border-color:var(--accent-hover);color:#fff}
.btn-secondary{background:#fff;color:var(--text);border-color:var(--border)}
.btn-secondary:hover{border-color:var(--accent);color:var(--accent);background:var(--bg)}
.photo-comments{max-width:65ch;margin-bottom:2rem}
.comments-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;
text-transform:uppercase;color:var(--text-light);margin-bottom:.75rem;
padding-bottom:.4rem;border-bottom:1px solid var(--border);
font-family:system-ui,sans-serif}
.photo-comments p{margin-bottom:.85rem;font-size:1rem;line-height:1.78}
.photo-comments p:last-child{margin-bottom:0}
.photo-meta{font-family:system-ui,sans-serif;font-size:.75rem;color:var(--text-light);
padding-top:1rem;border-top:1px solid var(--border);max-width:65ch}
.photo-meta a{color:var(--text-light)}
.photo-meta a:hover{color:var(--accent)}
.thumb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1rem}
.thumb-card{text-decoration:none;color:var(--link);display:block;border-radius:var(--radius);
overflow:hidden;border:1px solid var(--border);background:#fff;transition:box-shadow .15s}
.thumb-card:hover{box-shadow:var(--shadow);border-color:var(--accent)}
.thumb-card img{width:100%;height:210px;object-fit:cover;display:block}
.thumb-card-title{font-family:system-ui,sans-serif;font-size:.8rem;padding:.45rem .6rem;color:var(--text)}
.thumb-card:hover .thumb-card-title{color:var(--accent)}
.lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.93);
z-index:1000;cursor:zoom-out;justify-content:center;align-items:center;padding:2rem}
.lightbox.open{display:flex}
.lightbox img{max-width:100%;max-height:90vh;object-fit:contain;border-radius:2px}
.lb-close{position:fixed;top:1rem;right:1.25rem;color:#fff;font-size:2rem;
cursor:pointer;background:none;border:none;line-height:1;opacity:.7;
font-family:sans-serif;transition:opacity .15s}
.lb-close:hover{opacity:1}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);
z-index:900;justify-content:center;align-items:center;padding:1rem}
.modal-overlay.open{display:flex}
.modal{background:#fff;border-radius:6px;padding:2rem;max-width:460px;width:100%;
box-shadow:0 8px 40px rgba(0,0,0,.25)}
.modal h2{font-size:1rem;color:var(--accent);margin-bottom:.9rem;
font-family:system-ui,sans-serif}
.modal p{font-size:.86rem;line-height:1.65;color:var(--text);margin-bottom:1rem;
font-family:system-ui,sans-serif}
.modal-actions{display:flex;gap:.65rem;justify-content:flex-end;margin-top:.5rem}
footer{background:var(--nav-bg);color:#9C8E84;text-align:center;padding:1.5rem;
font-family:system-ui,sans-serif;font-size:.78rem;line-height:1.9}
footer a{color:#C4B8AE;text-decoration:none}
footer a:hover{color:#fff}
footer .sep{margin:0 .5rem;opacity:.35}
.sidebar-section+.sidebar-section{margin-top:1.25rem}
.rss-bar{display:flex;align-items:center;gap:.6rem;margin-bottom:1.1rem;
font-family:system-ui,sans-serif;font-size:.82rem}
.rss-bar a{color:var(--link);text-decoration:none;display:flex;align-items:center;gap:.35rem}
.rss-bar a:hover{color:var(--accent)}
.time-tabs{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:1.75rem}
.time-tabs a{font-family:system-ui,sans-serif;font-size:.78rem;padding:.3rem .75rem;
border-radius:var(--radius);border:1px solid var(--border);text-decoration:none;
color:var(--text-muted);background:#fff;transition:all .15s}
.time-tabs a:hover{border-color:var(--accent);color:var(--accent)}
.time-tabs a.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.feed-list{margin-bottom:2rem}
.feed-entry{display:flex;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--border)}
.feed-entry:first-child{padding-top:0}
.feed-thumb{flex-shrink:0;width:80px;height:80px;border-radius:var(--radius);
overflow:hidden;background:var(--bg-sidebar);border:1px solid var(--border)}
.feed-thumb img{width:80px;height:80px;object-fit:cover;display:block}
.feed-body{flex:1;min-width:0}
.feed-title{font-size:.97rem;margin-bottom:.28rem;line-height:1.4}
.feed-title a{color:var(--link);text-decoration:none}
.feed-title a:hover{color:var(--accent);text-decoration:underline}
.feed-date{font-family:system-ui,sans-serif;font-size:.75rem;color:var(--text-muted);margin-bottom:.3rem}
.feed-keywords{font-family:system-ui,sans-serif;font-size:.75rem;color:var(--text-light);line-height:1.65}
.feed-keywords strong{color:var(--text-muted);font-weight:600}
.prose{max-width:65ch}
.prose h2{font-size:1.05rem;font-weight:700;color:var(--accent);margin:1.6rem 0 .55rem;
font-family:system-ui,sans-serif}
.prose h2:first-child{margin-top:0}
.prose p{margin-bottom:.9rem;font-size:1rem;line-height:1.78}
.prose p:last-child{margin-bottom:0}
.prose a{color:var(--link)}
.prose a:hover{color:var(--accent)}
.prose strong{font-weight:700}
.prose .credit{background:var(--bg-sidebar);border-left:3px solid var(--accent);
padding:.65rem 1rem;border-radius:0 var(--radius) var(--radius) 0;
font-style:italic;margin:.85rem 0 1rem;font-size:.95rem}
@media print{
.topnav,.site-header,.sidebar,.toolbar,.pagination,
.lightbox,.modal-overlay,footer,.zoom-hint,.view-toggle{display:none!important}
.page-layout{display:block}.main-content{padding:0}
body{font-size:11pt;background:#fff}
.photo-title,.page-title{font-size:16pt;color:#000}
.photo-frame{box-shadow:none;cursor:default;max-width:100%}
.photo-comments,.section-desc{max-width:100%}}
.nav-toggle{display:none;flex-direction:column;justify-content:space-between;
width:22px;height:16px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0}
.nav-toggle span{display:block;height:2px;background:#C4B8AE;border-radius:2px;
transition:transform .2s,opacity .2s}
.nav-toggle[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav-toggle[aria-expanded="true"] span:nth-child(2){opacity:0}
.nav-toggle[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
@media(max-width:680px){
.nav-toggle{display:flex}
.topnav-links{display:none;position:absolute;top:46px;left:0;right:0;
background:var(--nav-bg);flex-direction:column;z-index:100;border-top:1px solid #443A2E}
.topnav-links.open{display:flex}
.topnav-links li+li{border-left:none;border-top:1px solid #443A2E}
.topnav-links a{line-height:1;padding:.85rem 1.5rem}
.topnav{position:relative}
.page-layout{grid-template-columns:1fr}
.sidebar{border-right:none;border-bottom:1px solid var(--border);padding:1rem}
.main-content{padding:1rem 1rem 2rem}
.photo-title,.page-title{font-size:1.3rem}
.photo-controls{flex-direction:column;align-items:flex-start}}
"""

TOPNAV = """<nav class="topnav">
  <div class="topnav-inner">
    <a href="/" class="site-logo">Holy Land <span>Photos</span></a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button><ul class="topnav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/page.asp?page_ID=8">Complete Site List</a></li>
      <li><a href="/search.asp">Search</a></li>
      <li><a href="whats-new.html">What&#8217;s New?</a></li>
      <li><a href="permission.html">Permission to Use</a></li>
      <li><a href="mailto:holylandphotos@gmail.com">Contact Us</a></li>
    </ul>
  </div>
</nav>"""

NAV_JS = '<script>document.querySelector(".nav-toggle").addEventListener("click",function(){var open=this.getAttribute("aria-expanded")==="true";this.setAttribute("aria-expanded",!open);document.querySelector(".topnav-links").classList.toggle("open",!open)});</script>'

HEADER = """<header class="site-header">
  <div class="site-header-inner">
    <div class="site-wordmark">
      <a href="/"><h1>Holy Land Photos</h1>
      <div class="tagline">Free &middot; High-Resolution &middot; Biblical &amp; Archaeological</div>
      </a>
    </div>
    <form class="site-search" action="/search.asp" method="get">
      <input type="text" name="searchText" placeholder="Search 7,022 photos&hellip;" aria-label="Search">
      <button type="submit">Search</button>
    </form>
  </div>
</header>"""

FOOTER = """<footer>
  <div>&copy; 2026 All images are the property of Dr. Carl Rasmussen unless otherwise noted.</div>
  <div>
    <a href="/">Home</a><span class="sep">|</span>
    <a href="https://holylandphotos.wordpress.com" target="_blank">Dr. Rasmussen&#8217;s Blog</a><span class="sep">|</span>
    <a href="mailto:holylandphotos@gmail.com">Contact / Feedback</a><span class="sep">|</span>
    <a href="/page.asp?page_ID=5">Permission to Use</a>
  </div>
</footer>"""

JS = """
  function openLightbox(){document.getElementById('lb').classList.add('open');document.body.style.overflow='hidden'}
  function closeLightbox(){document.getElementById('lb').classList.remove('open');document.body.style.overflow=''}
  function openDL(){document.getElementById('dlm').classList.add('open');document.body.style.overflow='hidden'}
  function closeDL(){document.getElementById('dlm').classList.remove('open');document.body.style.overflow=''}
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeLightbox();closeDL()}})
  function sharePhoto(){
    var d={title:document.title,url:window.location.href};
    if(navigator.share)navigator.share(d).catch(function(){});
    else navigator.clipboard.writeText(window.location.href)
      .then(function(){alert('Link copied!')})
      .catch(function(){prompt('Copy this link:',window.location.href)});
  }
"""

def smyrna_crumb(prefix):
    return (f'<nav class="breadcrumb" aria-label="Location">'
            f'<a href="{prefix}turkey.html">Turkey</a>'
            f'<span class="sep">&#8250;</span>'
            f'<a href="{prefix}western-turkey.html">Western Turkey</a>'
            f'<span class="sep">&#8250;</span>'
            f'<a href="{prefix}aegean.html">Central &amp; Southern Aegean</a>'
            f'<span class="sep">&#8250;</span>'
            f'<span class="current">Smyrna/Izmir</span>'
            f'</nav>')

def photo_sidebar(current_id):
    items = ""
    for num, iid, title, _ in PHOTOS:
        cls = ' class="active"' if iid == current_id else ""
        items += f'<li{cls}><a href="{iid}.html">{_h.escape(title)}</a></li>\n'
    return (smyrna_crumb("../") +
            '\n<div class="view-toggle">'
            '<a href="../smyrna.html">Site Info</a>'
            '<a class="active" href="../smyrna-thumbnails.html">Thumbnails</a>'
            '</div>'
            '\n<div class="sidebar-label">Photos in this site</div>'
            f'\n<ul class="nav-list">\n{items}</ul>')

def static_sidebar(active=None):
    """Sidebar for non-browse pages (search, whats_new, page.asp)."""
    browse = [
        ("Daily Life and Artifacts", "#"),
        ("People",                   "#"),
        ("Atlas Images",             "#"),
        ("Museums of the World",     "#"),
        ("Browse by Countries",      "#"),
    ]
    info = [
        ("Tour \u2013 Turkey &amp; Greece \u2013 Apr/May 2026", "#"),
        ("Recent Additions",    "whats-new.html"),
        ("Permission to Use",   "permission.html"),
        ("Complete Site List",  "#"),
        ("How to Use this Site","#"),
        ("Topical Easy Find",   "#"),
        ("About this Site",     "#"),
        ("Recommended Reading", "#"),
    ]
    def item(label, url, key):
        cls = ' class="active"' if key == active else ""
        return f'<li{cls}><a href="{url}">{label}</a></li>'
    browse_items = "\n".join(item(l, u, l) for l, u in browse)
    info_items   = "\n".join(item(l, u, l) for l, u in info)
    return (
        f'<div class="sidebar-section">'
        f'<div class="sidebar-label">Browse Photos</div>'
        f'<ul class="nav-list">\n{browse_items}\n</ul></div>'
        f'<div class="sidebar-section">'
        f'<div class="sidebar-label">Site Information</div>'
        f'<ul class="nav-list">\n{info_items}\n</ul></div>'
    )

def thumb_sidebar():
    items = ""
    for num, iid, title, _ in PHOTOS:
        items += f'<li><a href="photos/{iid}.html">{_h.escape(title)}</a></li>\n'
    return (smyrna_crumb("") +
            '\n<div class="view-toggle">'
            '<a href="smyrna.html">Site Info</a>'
            '<a class="active" href="smyrna-thumbnails.html">Thumbnails</a>'
            '</div>'
            '\n<div class="sidebar-label">Photos in this site</div>'
            f'\n<ul class="nav-list">\n{items}</ul>')

def site_info_sidebar():
    items = ""
    for num, iid, title, _ in PHOTOS:
        items += f'<li><a href="photos/{iid}.html">{_h.escape(title)}</a></li>\n'
    return (smyrna_crumb("") +
            '\n<div class="view-toggle">'
            '<a class="active" href="smyrna.html">Site Info</a>'
            '<a href="smyrna-thumbnails.html">Thumbnails</a>'
            '</div>'
            '\n<div class="sidebar-label">Photos in this site</div>'
            f'\n<ul class="nav-list">\n{items}</ul>')

def photo_page(num, img_id, title, modified, comments_html):
    et = _h.escape(title)
    desc = _h.escape(_desc_from_comments(comments_html))
    prev, nxt = prev_next(img_id)
    pl = (f'<a href="{prev[1]}.html" aria-label="Previous">&larr; Prev</a>'
          if prev else '<span class="pg-disabled">&larr; Prev</span>')
    nl = (f'<a href="{nxt[1]}.html" aria-label="Next">Next &rarr;</a>'
          if nxt else '<span class="pg-disabled">Next &rarr;</span>')
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{et} &mdash; Smyrna/Izmir &mdash; Holy Land Photos</title>
  <meta name="description" content="{desc}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{et} &mdash; Smyrna/Izmir">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="https://img.holylandphotos.org/{img_id}.jpg?w=1200&amp;h=630&amp;mode=crop">
  <meta property="og:site_name" content="Holy Land Photos">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{et} &mdash; Smyrna/Izmir &mdash; Holy Land Photos">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="https://img.holylandphotos.org/{img_id}.jpg?w=1200&amp;h=630&amp;mode=crop">
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"ImageObject","name":"{title}",
  "contentUrl":"https://img.holylandphotos.org/{img_id}.jpg",
  "creator":{{"@type":"Person","name":"Dr. Carl Rasmussen"}},
  "copyrightYear":2026,
  "about":{{"@type":"Place","name":"Smyrna/Izmir","address":{{"@type":"PostalAddress","addressCountry":"TR"}}}}}}
  </script>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
{TOPNAV}
{HEADER}
<div class="page-layout">
  <aside class="sidebar">{photo_sidebar(img_id)}</aside>
  <main class="main-content">
    <h1 class="photo-title">{et}</h1>
    <div class="photo-location">
      <a href="../smyrna.html">Smyrna/Izmir</a> &nbsp;&middot;&nbsp;
      <a href="../turkey.html">Turkey</a>
    </div>
    <div class="photo-frame" onclick="openLightbox()" role="button" tabindex="0"
         aria-label="View larger image" onkeydown="if(event.key==='Enter')openLightbox()">
      <img src="https://img.holylandphotos.org/{img_id}.jpg?w=760&amp;h=760&amp;mode=max"
           alt="{et} &mdash; Smyrna/Izmir, Turkey" loading="lazy">
      <span class="zoom-hint">Click to enlarge</span>
    </div>
    <div class="photo-controls">
      <nav class="pagination" aria-label="Photo navigation">
        {pl}<span class="pg-info">{num} of 14</span>{nl}
      </nav>
      <div class="toolbar">
        <button class="btn btn-primary" onclick="openDL()">&darr; Download</button>
        <button class="btn btn-secondary" onclick="sharePhoto()">&uarr; Share</button>
        <a href="javascript:window.print()" class="btn btn-secondary">&#9113; Print</a>
        <a href="https://img.holylandphotos.org/{img_id}.jpg?w=950&amp;h=710&amp;mode=max"
           class="btn btn-secondary" target="_blank">&#9671; PowerPoint</a>
      </div>
    </div>
    <div class="photo-comments">
      <div class="comments-label">Photo Comments</div>
      {comments_html}
    </div>
    <div class="photo-meta">
      &copy; 2026 Dr. Carl Rasmussen &nbsp;&middot;&nbsp; Last modified: {modified} &nbsp;&middot;&nbsp;
      <a href="/page.asp?page_ID=5">Permission to Use</a>
    </div>
  </main>
</div>
{FOOTER}
<div class="lightbox" id="lb" onclick="closeLightbox()">
  <button class="lb-close" aria-label="Close">&times;</button>
  <img src="https://img.holylandphotos.org/{img_id}.jpg?w=1400&amp;h=1400&amp;mode=max" alt="{et}">
</div>
<div class="modal-overlay" id="dlm" onclick="if(event.target===this)closeDL()">
  <div class="modal" role="dialog" aria-modal="true">
    <h2>Before You Download</h2>
    <p>Images from <strong>holylandphotos.org</strong> are provided free for personal,
    classroom, and Bible study use.</p>
    <p>They are <strong>not to be used on other websites or commercially</strong> without
    special permission. Contact
    <a href="mailto:holylandphotos@gmail.com">holylandphotos@gmail.com</a>.</p>
    <p>By downloading you acknowledge these terms.</p>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeDL()">Cancel</button>
      <a href="https://img.holylandphotos.org/{img_id}.jpg?hlp=true&amp;mode=max"
         class="btn btn-primary" download onclick="closeDL()">I Agree &mdash; Download</a>
    </div>
  </div>
</div>
<script>{JS}</script>
{NAV_JS}
</body></html>"""

def browse_page(css_path, title, sidebar_html, section_img, desc_html, meta_desc=""):
    et = _h.escape(title)
    md = _h.escape(meta_desc)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{et} &mdash; Holy Land Photos</title>
  <meta name="description" content="{md}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{et} &mdash; Holy Land Photos">
  <meta property="og:description" content="{md}">
  <meta property="og:image" content="{section_img}">
  <meta property="og:site_name" content="Holy Land Photos">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{et} &mdash; Holy Land Photos">
  <meta name="twitter:description" content="{md}">
  <meta name="twitter:image" content="{section_img}">
  <link rel="stylesheet" href="{css_path}">
</head>
<body>
{TOPNAV}
{HEADER}
<div class="page-layout">
  <aside class="sidebar">{sidebar_html}</aside>
  <main class="main-content">
    <h1 class="page-title">{et}</h1>
    <div class="section-intro">
      <div class="section-image">
        <img src="{section_img}" alt="{et} map or overview">
      </div>
      <div class="section-desc">{desc_html}</div>
    </div>
  </main>
</div>
{FOOTER}
{NAV_JS}
</body></html>"""

# ── Browse sidebar helpers ────────────────────────────────────────────────────

def make_crumb(items):
    parts = []
    for i, (label, url) in enumerate(items):
        if i == len(items) - 1:
            parts.append(f'<span class="current">{label}</span>')
        else:
            parts.append(f'<a href="{url}">{label}</a>')
            parts.append('<span class="sep">&#8250;</span>')
    return '<nav class="breadcrumb" aria-label="Location">' + "".join(parts) + '</nav>'

def make_nav(label, links):
    items = "\n".join(f'<li><a href="{url}">{name}</a></li>' for name, url in links)
    return f'<div class="sidebar-label">{label}</div>\n<ul class="nav-list">\n{items}\n</ul>'

TURKEY_SIDEBAR = (
    make_crumb([("Home", "/"), ("Turkey", None)]) +
    make_nav("Regions", [
        ("Western Turkey",  "western-turkey.html"),
        ("Central Turkey",  "#"),
        ("Eastern Turkey",  "#"),
    ])
)

WESTERN_SIDEBAR = (
    make_crumb([("Turkey", "turkey.html"), ("Western Turkey", None)]) +
    make_nav("Sub-regions", [
        ("Istanbul &amp; Marmara",        "#"),
        ("Northern Aegean",               "#"),
        ("Central &amp; Southern Aegean", "aegean.html"),
        ("Lycia / Caria / Mediterranean", "#"),
    ])
)

AEGEAN_SIDEBAR = (
    make_crumb([("Turkey","turkey.html"),("Western Turkey","western-turkey.html"),("Central &amp; Southern Aegean",None)]) +
    make_nav("Sites", [
        ("Colossae",           "#"), ("Didyma",   "#"),
        ("Ephesus Upper City", "#"), ("Ephesus Middle City", "#"),
        ("Ephesus Lower City", "#"), ("Euromos",  "#"),
        ("Hierapolis",         "#"), ("Knidos",   "#"),
        ("Laodicea",           "#"), ("Miletus",  "#"),
        ("Priene",             "#"), ("Smyrna/Izmir", "smyrna.html"),
        ("Smyrna Artifacts",   "#"),
    ])
)

TURKEY_DESC = """<p>Click on a region below, or use the Complete Site List and scroll to Turkey.</p>
<p>Sites to be added: Alacahuyuk, Ankara, Antioch on the Orontes, Aphrodisias, Antalya,
Cappadocia, Hierapolis, Istanbul, Knidos, Laodicea, Miletus, Patara, Pergamum, Sardis,
Smyrna/Izmir, Troy, and many more.</p>
<p>Browse available regions: <a href="western-turkey.html">Western Turkey</a>,
Central Turkey, Eastern Turkey.</p>"""

WESTERN_DESC = """<p>Western Turkey covers sites west of a north&ndash;south line from
Istanbul to Pamukkale. The green dots on the map mark the seven churches of Revelation.</p>
<p>Regions: <a href="aegean.html">Central &amp; Southern Aegean</a>,
Northern Aegean, Istanbul &amp; Marmara, Lycia/Caria/Mediterranean Coast.</p>
<p>Featured sites: Ephesus, Laodicea, Miletus, Pergamum, Sardis,
<a href="smyrna.html">Smyrna/Izmir</a>, Thyatira, and more.</p>"""

AEGEAN_DESC = """<p>The Central &amp; Southern Aegean region includes some of the most
significant biblical and archaeological sites in western Turkey.</p>
<p>Sites currently available or coming soon: Colossae, Didyma, Ephesus, Euromos,
Hierapolis, Knidos, Laodicea, Miletus, Priene,
<a href="smyrna.html">Smyrna/Izmir</a>, and more.</p>"""

SMYRNA_DESC = """<p>Smyrna (modern Izmir) is located on a deep sheltered bay of the
Aegean Sea. It sits at the western end of an important ancient road from the east
(Syria, India, China) through Laodicea, Philadelphia, and Sardis.</p>
<p>By the time of the early church, Smyrna was a center of emperor worship and a close
ally of Rome. It is the second of the seven churches addressed in Revelation
(1:11; 2:8&ndash;11). The &ldquo;crown of life&rdquo; mentioned in 2:10 may refer to the
victor&rsquo;s wreath or to the citadel that towered over the city. Polycarp, burned for
his faith at the stadium here, was one of the first Christian martyrs (age 86, A.D. 156).</p>
<p>The major surviving remains are the citadel (Kadifekale), the agora, and excavated areas
of the ancient city. The Izmir Archaeological Museum contains outstanding artifacts from
the city and vicinity.</p>"""

# ── Feed entry data (real entries from live site + Smyrna examples) ───────────
FEED_ENTRIES = [
    ("TWCSSM20", "Smyrna/Izmir :: Agora Panorama",
     "3/26/2025",
     "Agora, Panorama, Smyrna, Izmir, Turkey, Aegean, Western Turkey, Seven Churches, Revelation"),
    ("TWCSSM03", "Smyrna/Izmir :: Agora From Above",
     "3/26/2025",
     "Agora, Citadel, Kadifekale, Smyrna, Izmir, Turkey, Seven Churches, Revelation"),
    ("TWCSSM04", "Smyrna/Izmir :: Agora Portico",
     "3/26/2025",
     "Agora, Portico, Columns, Corinthian, Smyrna, Izmir, Turkey, Seven Churches"),
    ("TWCSSM30", "Smyrna/Izmir :: Cryptoporticus",
     "3/26/2025",
     "Cryptoporticus, Underground Agora, Arches, Smyrna, Izmir, Turkey"),
    ("TWCSSM20", "Sardis Artemis Temple Plus :: Interior of Second Church",
     "3/19/2026",
     "Second Church, First Church, Byzantine Church, Fourth Century, Sardis, Revelation, Seven Churches, Sart, Turkey, Aegean North"),
    ("TWCSSM21", "Sardis Artemis Temple Plus :: Interior of First Church",
     "3/18/2026",
     "First Church, Byzantine Church, Fourth Century, Sardis, Revelation, Seven Churches"),
    ("TWCSSM10", "Assos: Citadel, Temple of Athena, Harbor :: Ancient Harbor Detail",
     "3/17/2026",
     "Harbor, Port, Paul, Assos, Behramkale, Northern Aegean, Turkey"),
]

def whats_new_page():
    tabs_data = [("1 Week","7"),("2 Weeks","14"),("3 Weeks","21"),("1 Month","30"),("2 Months","60")]
    tabs = ""
    for label, d in tabs_data:
        cls = ' class="active"' if d == "7" else ""
        tabs += f'<a href="whats-new.html?d={d}"{cls}>{label}</a>\n'

    entries_html = ""
    for img_id, title, date, keywords in FEED_ENTRIES:
        site, photo = (title.split(" :: ", 1) + [""])[:2]
        title_html = f"<strong>{_h.escape(site)}</strong>"
        if photo:
            title_html += f" :: {_h.escape(photo)}"
        entries_html += f"""<div class="feed-entry">
  <a href="#" class="feed-thumb">
    <img src="https://img.holylandphotos.org/{img_id}.jpg?w=160&h=160&mode=max"
         alt="{_h.escape(title)}" loading="lazy">
  </a>
  <div class="feed-body">
    <div class="feed-title"><a href="#">{title_html}</a></div>
    <div class="feed-date">Added {date}</div>
    <div class="feed-keywords"><strong>Keywords:</strong> {_h.escape(keywords)}</div>
  </div>
</div>\n"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>What&#8217;s New &mdash; Holy Land Photos</title>
  <meta name="description" content="Browse the most recently added biblical and archaeological photos on Holy Land Photos &mdash; updated weekly with new high-resolution images.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="What&#8217;s New &mdash; Holy Land Photos">
  <meta property="og:description" content="Browse the most recently added biblical and archaeological photos on Holy Land Photos &mdash; updated weekly with new high-resolution images.">
  <meta property="og:site_name" content="Holy Land Photos">
  <link rel="alternate" type="application/rss+xml" title="Holy Land Photos &mdash; Recent Additions" href="/rss.asp">
  <link rel="stylesheet" href="style.css">
</head>
<body>
{TOPNAV}
{HEADER}
<div class="page-layout">
  <aside class="sidebar">{static_sidebar("Recent Additions")}</aside>
  <main class="main-content">
    <h1 class="page-title">What&#8217;s New?</h1>
    <div class="rss-bar">
      <a href="/rss.asp">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)"><circle cx="5" cy="19" r="3"/><path d="M4 4a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7V4zm0 6a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V10z"/></svg>
        Subscribe via RSS
      </a>
    </div>
    <div class="time-tabs">
{tabs}    </div>
    <div class="feed-list">
{entries_html}    </div>
  </main>
</div>
{FOOTER}
{NAV_JS}
</body></html>"""


def permission_page():
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Permission to Use &mdash; Holy Land Photos</title>
  <meta name="description" content="Images on Holy Land Photos are free for personal, classroom, and Bible study use with attribution. Learn about commercial and web usage permissions.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Permission to Use &mdash; Holy Land Photos">
  <meta property="og:description" content="Images on Holy Land Photos are free for personal, classroom, and Bible study use with attribution. Learn about commercial and web usage permissions.">
  <meta property="og:site_name" content="Holy Land Photos">
  <link rel="stylesheet" href="style.css">
</head>
<body>
{TOPNAV}
{HEADER}
<div class="page-layout">
  <aside class="sidebar">{static_sidebar("Permission to Use")}</aside>
  <main class="main-content">
    <h1 class="page-title">Permission to Use</h1>
    <div class="prose">
      <h2>Personal Use &mdash; Free</h2>
      <p>These images are our gift to you for non&#8211;commercial, non&#8211;web personal
      use &mdash; <strong>but</strong> see below for web and commercial usage.</p>
      <p>The only request we make is that you use something like the following credit
      at some point during your presentation:</p>
      <p class="credit">Image(s) courtesy of
      <a href="https://www.holylandphotos.org">www.HolyLandPhotos.org</a>
      &mdash; either in written or verbal form.</p>

      <h2>Commercial Usage</h2>
      <p>To request permission to use images commercially &mdash; for a modest fee &mdash;
      <a href="mailto:holylandphotos@gmail.com?subject=Commercial%20Image%20Usage">contact
      Dr. Rasmussen</a> at
      <a href="mailto:holylandphotos@gmail.com?subject=Commercial%20Image%20Usage">HolyLandPhotos@gmail.com</a>.</p>
      <p>Non-watermarked, high-resolution versions are available for licensed commercial use.</p>

      <h2>Web Usage</h2>
      <p>In general, images are <strong>not</strong> to be used on other websites &mdash;
      <strong>however</strong>, permission is granted to use up to 4 images per website
      if clear credit is given to
      <a href="https://www.holylandphotos.org">www.HolyLandPhotos.org</a> for each image used.</p>
      <p>For use of 5 or more images, you must have the express written permission of
      <a href="mailto:holylandphotos@gmail.com">www.HolyLandPhotos.org</a>.</p>
      <p>Text is not to be reproduced without specific permission from the
      <a href="mailto:holylandphotos@gmail.com">content provider</a>.</p>

      <h2>Register for Updates</h2>
      <p>To receive an occasional notification when images are added,
      <a href="/register.asp">Register Here</a>.</p>
      <p>You will not be swamped with email, and this list will never be shared
      with any other party.</p>

      <h2>Request Additional Images</h2>
      <p>To request an image you would like to see added to the site, contact Dr. Rasmussen at
      <a href="mailto:holylandphotos@gmail.com">HolyLandPhotos@gmail.com</a>.</p>
    </div>
  </main>
</div>
{FOOTER}
{NAV_JS}
</body></html>"""

def thumb_page():
    cards = ""
    for _, img_id, title, _ in PHOTOS:
        et = _h.escape(title)
        cards += (
            f'<a class="thumb-card" href="photos/{img_id}.html">\n'
            f'  <img src="https://img.holylandphotos.org/{img_id}.jpg'
            f'?w=420&amp;h=420&amp;mode=max" alt="{et}" loading="lazy">\n'
            f'  <div class="thumb-card-title">{et}</div>\n'
            f'</a>\n'
        )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Smyrna/Izmir &mdash; All Photos &mdash; Holy Land Photos</title>
  <meta name="description" content="Browse all 14 photos of Smyrna/Izmir (ancient and modern Izmir, Turkey) &mdash; including the agora, citadel, and Cryptoporticus. Free high-resolution downloads.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Smyrna/Izmir &mdash; All Photos &mdash; Holy Land Photos">
  <meta property="og:description" content="Browse all 14 photos of Smyrna/Izmir (ancient and modern Izmir, Turkey). Free high-resolution downloads for personal and classroom use.">
  <meta property="og:image" content="https://img.holylandphotos.org/TWCSSM20.jpg?w=1200&amp;h=630&amp;mode=crop">
  <meta property="og:site_name" content="Holy Land Photos">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Smyrna/Izmir &mdash; All Photos &mdash; Holy Land Photos">
  <meta name="twitter:description" content="Browse all 14 photos of Smyrna/Izmir (ancient and modern Izmir, Turkey). Free high-resolution downloads for personal and classroom use.">
  <meta name="twitter:image" content="https://img.holylandphotos.org/TWCSSM20.jpg?w=1200&amp;h=630&amp;mode=crop">
  <link rel="stylesheet" href="style.css">
</head>
<body>
{TOPNAV}
{HEADER}
<div class="page-layout">
  <aside class="sidebar">{thumb_sidebar()}</aside>
  <main class="main-content">
    <h1 class="page-title">Smyrna/Izmir &mdash; All Photos</h1>
    <div class="thumb-grid">
{cards}    </div>
  </main>
</div>
{FOOTER}
{NAV_JS}
</body></html>"""

def main():
    with open(os.path.join(MOCKUPS, "style.css"), "w") as f:
        f.write(CSS)
    print("style.css")

    for num, img_id, title, modified in PHOTOS:
        html = photo_page(num, img_id, title, modified, COMMENTS[img_id])
        path = os.path.join(PHOTOS_D, f"{img_id}.html")
        with open(path, "w") as f:
            f.write(html)
        print(f"photos/{img_id}.html  ({title})")

    pages = [
        ("turkey.html",        "Turkey",
         TURKEY_SIDEBAR, "http://s3.amazonaws.com/hlp-section-images/TurkeyWCE.jpg",
         TURKEY_DESC,
         "Browse biblical and archaeological photo sites across Turkey, including Ephesus, Pergamum, Sardis, Smyrna, and many more. Free high-resolution downloads."),
        ("western-turkey.html","Western Turkey",
         WESTERN_SIDEBAR, "http://s3.amazonaws.com/hlp-section-images/WesternTurkeyMap3.jpg",
         WESTERN_DESC,
         "Western Turkey covers sites west of a north\u2013south line from Istanbul to Pamukkale, including the seven churches of Revelation. Free high-resolution biblical photos."),
        ("aegean.html",        "Central & Southern Aegean",
         AEGEAN_SIDEBAR, "http://s3.amazonaws.com/hlp-section-images/AegeanSCMap2.jpg",
         AEGEAN_DESC,
         "The Central & Southern Aegean region includes Ephesus, Laodicea, Miletus, Smyrna, and other significant biblical and archaeological sites in western Turkey."),
        ("smyrna.html",        "Smyrna/Izmir",
         site_info_sidebar(), "http://s3.amazonaws.com/hlp-section-images/SmyrnaMap.jpg",
         SMYRNA_DESC,
         "Smyrna (modern Izmir) was the second of the seven churches of Revelation. Browse photos of the agora, citadel, and ancient city remains. Free high-resolution downloads."),
    ]
    for filename, title, sidebar, img, desc, meta_desc in pages:
        html = browse_page("style.css", title, sidebar, img, desc, meta_desc)
        with open(os.path.join(MOCKUPS, filename), "w") as f:
            f.write(html)
        print(filename)

    with open(os.path.join(MOCKUPS, "smyrna-thumbnails.html"), "w") as f:
        f.write(thumb_page())
    print("smyrna-thumbnails.html")

    with open(os.path.join(MOCKUPS, "whats-new.html"), "w") as f:
        f.write(whats_new_page())
    print("whats-new.html")

    with open(os.path.join(MOCKUPS, "permission.html"), "w") as f:
        f.write(permission_page())
    print("permission.html")

    old = os.path.join(MOCKUPS, "photo-view.html")
    if os.path.exists(old):
        os.remove(old)
        print("removed photo-view.html")

    print(f"\nDone. {len(PHOTOS)} photo pages + 4 browse pages + 1 thumbnail page + 2 static pages + style.css")

if __name__ == "__main__":
    main()
