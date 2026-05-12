// plain.jsx — Direction A: Plain / Wikipedia-vibe.
// Restrained, near-monochrome, scholarly serif body, hairline UI.
// All styles scoped via .pln- prefix + .pln-doc root.

const { img: pImg, HARAN: pHARAN, PHOTO_MIDRAS: pPHOTO, HOME: pHOME, SEARCH: pSEARCH, TURKEY_TREE: pTREE } = window.HLP_CONTENT;

const PLAIN_CSS = `
.pln-doc {
  --bg: #ffffff;
  --bg-alt: #f7f6f3;
  --ink: #1c1c1c;
  --ink-muted: #555;
  --ink-faint: #7a7a7a;
  --line: #e3e1dc;
  --line-strong: #c9c6bf;
  --link: #0b50a0;
  --link-visited: #5c2b8f;
  --accent: #8a3a18;
  --serif: Georgia, "Times New Roman", serif;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --fs-body: 17.5px;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--serif);
  font-size: var(--fs-body);
  line-height: 1.6;
  font-feature-settings: "kern", "liga", "onum";
  -webkit-font-smoothing: antialiased;
}
.pln-doc a { color: var(--link); text-decoration: none; }
.pln-doc a:hover { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px; }
.pln-doc a.visited, .pln-doc a.muted { color: var(--ink); }

/* Skip link */
.pln-skip { position: absolute; left: -9999px; top: 0; padding: 8px 12px; background: #000; color: #fff; font-family: var(--sans); }
.pln-skip:focus { left: 8px; top: 8px; }

/* ─────────── Nav ─────────── */
.pln-nav {
  border-bottom: 1px solid var(--line);
  background: var(--bg);
  font-family: var(--sans);
  font-size: 14.5px;
}
.pln-nav-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 18px 32px;
  display: flex;
  align-items: center;
  gap: 28px;
}
.pln-brand {
  display: flex; flex-direction: column; gap: 1px;
  text-decoration: none; color: var(--ink); margin-right: auto;
}
.pln-brand-name {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink);
}
.pln-brand-tag {
  font-size: 11.5px;
  color: var(--ink-faint);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pln-nav-links { display: flex; gap: 24px; align-items: center; }
.pln-nav-links a { color: var(--ink); font-weight: 500; }
.pln-nav-search {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 12px; border: 1px solid var(--line); border-radius: 4px;
  color: var(--ink-muted); cursor: pointer;
}
.pln-nav-search:hover { border-color: var(--line-strong); }

/* ─────────── Layout ─────────── */
.pln-main { max-width: 1120px; margin: 0 auto; padding: 32px; }
.pln-h1 {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 36px;
  letter-spacing: -0.012em;
  line-height: 1.15;
  margin: 0 0 4px;
}
.pln-h2 {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 21px;
  line-height: 1.25;
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.pln-h3 {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 17px;
  margin: 0 0 8px;
}
.pln-lead { font-size: 19px; line-height: 1.55; color: var(--ink); margin: 0 0 18px; }
.pln-p { margin: 0 0 14px; max-width: 68ch; }
.pln-p:last-child { margin-bottom: 0; }

/* Breadcrumbs */
.pln-crumbs {
  font-family: var(--sans);
  font-size: 13.5px;
  color: var(--ink-faint);
  margin-bottom: 22px;
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
}
.pln-crumbs a { color: var(--ink-muted); }
.pln-crumbs .pln-sep { color: var(--line-strong); }
.pln-crumbs .pln-current { color: var(--ink); font-weight: 500; }

/* Type badge */
.pln-badge {
  display: inline-block;
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  border: 1px solid var(--line);
  padding: 3px 9px;
  border-radius: 3px;
  margin-bottom: 18px;
}

/* Two-column: lead image + body */
.pln-two {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 40px;
  margin-bottom: 40px;
}
.pln-figure { margin: 0; }
.pln-figure img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--line);
  background: var(--bg-alt);
}
.pln-figcaption {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-faint);
  margin-top: 8px;
}

/* Photo grid */
.pln-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px 16px;
  margin-top: 14px;
}
.pln-thumb {
  display: flex; flex-direction: column;
  text-decoration: none;
  color: var(--ink);
}
.pln-thumb-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border: 1px solid var(--line);
  background: var(--bg-alt);
}
.pln-thumb-cap {
  font-family: var(--sans);
  font-size: 13px;
  line-height: 1.35;
  color: var(--ink);
  margin-top: 8px;
  letter-spacing: 0.005em;
}
.pln-thumb-cap-sub {
  font-size: 12px;
  color: var(--ink-faint);
  margin-top: 2px;
}

/* Keyword chips */
.pln-kw {
  font-family: var(--sans);
  font-size: 13.5px;
  color: var(--ink-muted);
  border-top: 1px solid var(--line);
  padding-top: 16px;
  margin-top: 32px;
}
.pln-kw-label { font-weight: 600; color: var(--ink); margin-right: 4px; }
.pln-kw a {
  display: inline-block;
  margin: 0 2px 4px 0;
}

/* Photo page */
.pln-photopage {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) 1fr;
  gap: 44px;
}
.pln-photo-main img {
  width: 100%; height: auto; display: block;
  border: 1px solid var(--line);
}
.pln-photo-meta { font-family: var(--sans); font-size: 12.5px; color: var(--ink-faint); margin-top: 10px; letter-spacing: 0.04em; text-transform: uppercase; }
.pln-download {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 14px;
  padding: 9px 14px;
  font-family: var(--sans); font-size: 14px; font-weight: 500;
  background: var(--bg); color: var(--ink);
  border: 1px solid var(--ink); border-radius: 3px;
  cursor: pointer; text-decoration: none;
}
.pln-download:hover { background: var(--ink); color: #fff; text-decoration: none; }

.pln-photo-side .pln-h1 { font-size: 30px; }
.pln-photo-side .pln-p { font-size: 17px; }
.pln-photo-side em { font-style: italic; }

/* Prev/Next */
.pln-pnav {
  display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
  font-family: var(--sans); font-size: 14px;
  color: var(--ink-muted);
  margin-bottom: 20px;
}
.pln-pnav-center { color: var(--ink-faint); font-size: 12.5px; letter-spacing: 0.06em; text-transform: uppercase; }
.pln-pnav a { color: var(--ink); }
.pln-pnav-up {
  font-family: var(--sans); font-size: 13px;
  color: var(--ink-muted);
  margin-bottom: 10px;
}

/* Homepage */
.pln-home-intro {
  font-family: var(--serif);
  font-style: italic;
  font-size: 19px;
  color: var(--ink-muted);
  max-width: 62ch;
  margin: 0 0 24px;
  line-height: 1.5;
}
.pln-home-cols {
  display: grid; grid-template-columns: 1fr 1fr; gap: 56px;
  padding: 22px 0 32px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: 36px;
}
.pln-home-cols h2 {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 12px;
}
.pln-list { list-style: none; padding: 0; margin: 0; }
.pln-list li { margin: 0; padding: 6px 0; border-bottom: 1px dotted var(--line); }
.pln-list li:last-child { border-bottom: 0; }
.pln-list a { font-size: 17.5px; }

/* News carousel */
.pln-feature { display: grid; grid-template-columns: 1.2fr 1fr; gap: 36px; margin-bottom: 56px; }
.pln-carousel { position: relative; }
.pln-carousel img { width: 100%; height: auto; display: block; border: 1px solid var(--line); background: var(--bg-alt); }
.pln-carousel-caption {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--sans); font-size: 13.5px; color: var(--ink-muted);
  margin-top: 10px;
}
.pln-carousel-arrows { display: flex; gap: 4px; }
.pln-arrow {
  width: 30px; height: 30px; border: 1px solid var(--line);
  background: var(--bg); cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--ink);
}
.pln-arrow:hover { border-color: var(--ink); }

.pln-sotw { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.pln-sotw img { width: 100%; height: auto; display: block; border: 1px solid var(--line); }

/* Hint card */
.pln-hint {
  font-family: var(--sans);
  font-size: 14.5px;
  background: var(--bg-alt);
  border-left: 2px solid var(--ink);
  padding: 14px 18px;
  margin: 28px 0;
}
.pln-hint strong { display: block; margin-bottom: 4px; }

/* Search */
.pln-searchbox {
  display: flex;
  border: 1px solid var(--ink);
  background: var(--bg);
  margin: 0 0 18px;
  max-width: 640px;
}
.pln-searchbox input {
  flex: 1; border: 0; padding: 14px 16px;
  font-family: var(--serif); font-size: 19px;
  background: transparent; color: var(--ink); outline: none;
}
.pln-searchbox button {
  border: 0; border-left: 1px solid var(--ink);
  background: var(--ink); color: #fff;
  padding: 0 22px; font-family: var(--sans); font-size: 14px; font-weight: 500;
  cursor: pointer;
}
.pln-search-meta {
  font-family: var(--sans); font-size: 13.5px; color: var(--ink-muted);
  margin-bottom: 28px;
}

.pln-results-head {
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint);
  margin: 32px 0 14px;
  padding-bottom: 8px; border-bottom: 1px solid var(--line);
  display: flex; justify-content: space-between; align-items: baseline;
}
.pln-results-head .pln-count { color: var(--ink-muted); font-weight: 500; letter-spacing: 0.04em; }

.pln-section-result {
  display: flex; gap: 14px; align-items: baseline;
  padding: 12px 0; border-bottom: 1px solid var(--line);
}
.pln-section-result:last-child { border-bottom: 0; }
.pln-section-result .pln-badge { margin-bottom: 0; flex: 0 0 70px; text-align: center; }
.pln-section-result h3 { margin: 0 0 2px; font-size: 19px; font-family: var(--serif); font-weight: 600; }
.pln-section-result h3 a { color: var(--ink); }
.pln-section-result .pln-path { font-family: var(--sans); font-size: 13.5px; color: var(--ink-muted); }

/* Sidebar variant */
.pln-shell { display: grid; grid-template-columns: 230px 1fr; gap: 48px; }
.pln-side {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--ink);
  border-right: 1px solid var(--line);
  padding-right: 24px;
}
.pln-side h4 {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 10px;
}
.pln-side ul { list-style: none; padding: 0; margin: 0 0 18px; }
.pln-side > ul > li { margin-bottom: 14px; }
.pln-side .pln-side-group { font-weight: 600; color: var(--ink); margin-bottom: 4px; }
.pln-side .pln-side-group.is-current { color: var(--accent); }
.pln-side .pln-side-sub { list-style: none; padding: 0; margin: 0 0 0 0; }
.pln-side .pln-side-sub li { padding: 3px 0 3px 12px; border-left: 1px solid var(--line); }
.pln-side .pln-side-sub li.is-current {
  border-left-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}
.pln-side .pln-side-sub a { color: var(--ink); display: block; }

/* ─────────── AI Search section ─────────── */
.pln-ai-section { margin: 0 0 56px; }
.pln-ai-blurb {
  font-size: 17px; line-height: 1.55;
  color: var(--ink-muted);
  margin: 0 0 18px;
  max-width: 68ch;
}
.pln-ai-disclaimer-inline {
  font-family: var(--sans);
  font-size: 13.5px;
  color: var(--ink-faint);
  display: inline-block;
}
.pln-ai-panel {
  border: 1px solid var(--line);
  background: var(--bg);
}
.pln-ai-input-wrap {
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.pln-ai-input {
  display: flex;
  border: 1px solid var(--ink);
  background: var(--bg);
}
.pln-ai-input input {
  flex: 1; border: 0; padding: 12px 14px;
  font-family: var(--serif); font-size: 17px;
  background: transparent; color: var(--ink); outline: none;
  min-width: 0;
}
.pln-ai-input input:disabled { color: var(--ink-faint); cursor: not-allowed; }
.pln-ai-input button {
  border: 0; border-left: 1px solid var(--ink);
  background: var(--ink); color: #fff;
  padding: 0 20px; font-family: var(--sans); font-size: 14px; font-weight: 500;
  cursor: pointer; min-width: 84px;
}
.pln-ai-input button:disabled { background: var(--ink-faint); border-left-color: var(--ink-faint); cursor: not-allowed; }

.pln-ai-chips {
  padding: 14px 18px 18px;
  display: flex; flex-wrap: wrap; gap: 8px;
  align-items: center;
}
.pln-ai-chips-label {
  font-family: var(--sans);
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-right: 4px;
}
.pln-ai-chip {
  font-family: var(--sans);
  font-size: 13.5px;
  padding: 6px 12px;
  border: 1px solid var(--line-strong);
  background: var(--bg);
  color: var(--ink);
  cursor: pointer;
  border-radius: 3px;
}
.pln-ai-chip:hover { border-color: var(--ink); background: var(--bg-alt); }

.pln-ai-thread {
  padding: 22px 18px;
  max-height: 460px;
  overflow-y: auto;
}
.pln-ai-msg { margin: 0 0 22px; }
.pln-ai-msg:last-child { margin-bottom: 4px; }
.pln-ai-msg-user { display: flex; justify-content: flex-end; }
.pln-ai-user-bubble {
  background: #eaf0f9;
  border: 1px solid #c8d6ea;
  padding: 10px 14px;
  max-width: 78%;
  font-size: 16.5px;
  line-height: 1.45;
  color: var(--ink);
}
.pln-ai-msg-assistant {}
.pln-ai-assistant-tag {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-bottom: 8px;
}
.pln-ai-md { font-size: 16.5px; line-height: 1.55; color: var(--ink); }
.pln-ai-md p { margin: 0 0 10px; }
.pln-ai-md p:last-child { margin-bottom: 0; }
.pln-ai-md ul, .pln-ai-md ol { margin: 4px 0 12px; padding-left: 22px; }
.pln-ai-md li { margin: 0 0 4px; }
.pln-ai-md strong { font-weight: 600; }
.pln-ai-md em { font-style: italic; }
.pln-ai-md a { color: var(--link); }
.pln-ai-md code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 14px; background: var(--bg-alt); padding: 1px 5px; border-radius: 2px; }
.pln-ai-md h3, .pln-ai-md h4 { font-family: var(--serif); font-weight: 600; margin: 14px 0 6px; line-height: 1.25; }
.pln-ai-md h3 { font-size: 18px; }
.pln-ai-md h4 { font-size: 16px; }
.pln-ai-foot {
  font-family: var(--sans);
  font-size: 12.5px;
  color: var(--ink-faint);
  margin-top: 8px;
}
.pln-ai-loading {
  font-family: var(--sans);
  font-size: 14.5px;
  color: var(--ink-faint);
  font-style: italic;
}
.pln-ai-loading::after {
  content: "";
  display: inline-block;
  width: 6px; height: 6px;
  margin-left: 6px;
  background: var(--ink-faint);
  border-radius: 50%;
  animation: pln-ai-pulse 1.1s infinite;
}
@keyframes pln-ai-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.pln-ai-open-full {
  display: block;
  padding: 12px 18px;
  font-family: var(--sans);
  font-size: 14px;
  color: var(--ink-muted) !important;
  background: var(--bg-alt);
  border-top: 1px solid var(--line);
  text-decoration: none;
}
.pln-ai-open-full:hover { color: var(--ink) !important; }

/* Footer */
.pln-footer {
  border-top: 1px solid var(--line);
  margin-top: 48px;
  padding: 24px 32px;
  font-family: var(--sans); font-size: 13px; color: var(--ink-muted);
  max-width: 1120px; margin-left: auto; margin-right: auto;
  display: flex; flex-wrap: wrap; gap: 18px;
  align-items: baseline;
}
.pln-footer-cr { margin-right: auto; }
.pln-footer a { color: var(--ink-muted); }
.pln-footer a:hover { color: var(--ink); }
`;

function PlainStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PLAIN_CSS }} />;
}

function PlainNav() {
  return (
    <header className="pln-nav">
      <div className="pln-nav-inner">
        <a href="/" className="pln-brand">
          <span className="pln-brand-name">HolyLandPhotos.org</span>
          <span className="pln-brand-tag">Biblical & Archaeological Archive</span>
        </a>
        <nav className="pln-nav-links">
          <a href="/search">Search</a>
          <a href="/ai-search">AI Search</a>
          <a href="/pages/about-this-site">About</a>
          <a href="/pages/permission-to-use">Permission to Use</a>
        </nav>
      </div>
    </header>
  );
}

function PlainFooter() {
  return (
    <footer className="pln-footer">
      <span className="pln-footer-cr">© 1995–2026 Dr. Carl Rasmussen</span>
      <a href="/pages/about-this-site">About</a>
      <a href="/pages/permission-to-use">Permission to Use</a>
      <a href="/news">News</a>
      <a href="/pages/feedback">Feedback</a>
    </footer>
  );
}

function PlainCrumbs({ items }) {
  return (
    <nav className="pln-crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="pln-crumb">
            {i > 0 && <span className="pln-sep">›</span>}
            {it.href && !last ? (
              <a href={it.href}>{it.label}</a>
            ) : (
              <span className={last ? "pln-current" : ""}>{it.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ──────────────────── ARTBOARDS ──────────────────── */

function PlainHome() {
  const { hero, sotw, browse, pages } = pHOME;
  return (
    <div className="pln-doc">
      <PlainStyles />
      <PlainNav />
      <main className="pln-main">
        <p className="pln-home-intro">
          Free, high-resolution photographs of biblical and archaeological sites,
          taken by Dr. Carl Rasmussen across more than four decades —
          7,000 images from 612 locations in 12 countries.
        </p>

        <div className="pln-home-cols">
          <section>
            <h2>Browse</h2>
            <ul className="pln-list">
              {browse.map((b, i) => <li key={i}><a href={b.href}>{b.label}</a></li>)}
            </ul>
          </section>
          <section>
            <h2>Pages</h2>
            <ul className="pln-list">
              {pages.map((p, i) => <li key={i}><a href={p.href}>{p.label}</a></li>)}
            </ul>
          </section>
        </div>

        <section className="pln-feature">
          <div>
            <h2 className="pln-h2"><a href="/news/9" className="muted">Holy Week and Easter</a></h2>
            <div className="pln-carousel">
              <img src={hero.image} alt={hero.caption} />
              <div className="pln-carousel-caption">
                <span><em>{hero.caption}</em> — {hero.index} of {hero.total}</span>
                <span className="pln-carousel-arrows">
                  <button className="pln-arrow" aria-label="Previous"><Icon name="chevron-left" size={14}/></button>
                  <button className="pln-arrow" aria-label="Next"><Icon name="chevron-right" size={14}/></button>
                </span>
              </div>
            </div>
          </div>
          <div>
            <Paragraphs blocks={hero.body} pClass="pln-p" />
            <div className="pln-hint">
              <strong>Sunday Service Hint</strong>
              If you use PowerPoint presentations during your worship services you are welcome to download and use our images.
            </div>
          </div>
        </section>

        <AISearchSection variant="plain" />

        <section>
          <h2 className="pln-h2">Site of the Week</h2>
          <div className="pln-sotw">
            <a href={sotw.href}><img src={sotw.image} alt={sotw.title} /></a>
            <div>
              <h3 className="pln-h3" style={{ fontSize: 22, marginBottom: 8 }}>
                <a href={sotw.href}>{sotw.title}</a>
              </h3>
              <p className="pln-p">{sotw.body}</p>
            </div>
          </div>
        </section>
      </main>
      <PlainFooter />
    </div>
  );
}

function PlainSectionBody({ withSidebar }) {
  const s = pHARAN;
  return (
    <main className="pln-main">
      <PlainCrumbs items={s.breadcrumb} />
      <div className={withSidebar ? "pln-shell" : ""}>
        {withSidebar && (
          <aside className="pln-side" aria-label="Browse Turkey">
            <h4>Turkey</h4>
            <ul>
              {pTREE.items.map((grp, i) => (
                <li key={i}>
                  <div className={"pln-side-group" + (grp.current ? " is-current" : "")}>{grp.label}</div>
                  <ul className="pln-side-sub">
                    {grp.children.map((c, j) => (
                      <li key={j} className={c.current ? "is-current" : ""}>
                        {c.current ? c.label : <a href="#">{c.label}</a>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div>
          <h1 className="pln-h1">{s.title}</h1>
          <span className="pln-badge">{s.type}</span>

          <div className="pln-two">
            <figure className="pln-figure">
              <img src={s.hero} alt={s.heroAlt} />
              <figcaption className="pln-figcaption">Click image to enlarge · {s.heroAlt}</figcaption>
            </figure>
            <div>
              {s.body.map((p, i) => (
                <p key={i} className={i === 0 ? "pln-lead" : "pln-p"}>{p}</p>
              ))}
            </div>
          </div>

          <h2 className="pln-h2">Photos <span style={{ color: "var(--ink-faint)", fontWeight: 400, fontSize: 17 }}>({s.photos.length})</span></h2>
          <div className="pln-grid">
            {s.photos.map((p) => (
              <a className="pln-thumb" key={p.id} href={`/photos/${p.id}?s=${s.slug}`}>
                <img className="pln-thumb-img" src={pImg(p.id)} alt={p.title} loading="lazy" />
                <span className="pln-thumb-cap">{p.title}</span>
              </a>
            ))}
          </div>

          <div className="pln-kw">
            <span className="pln-kw-label">Keywords:</span>
            {s.keywords.map((k, i) => (
              <span key={k}>
                {i > 0 && <span style={{ color: "var(--line-strong)" }}>·</span>}{" "}
                <a href={`/keywords/${encodeURIComponent(k)}`}>{k}</a>{" "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function PlainSection() {
  return (
    <div className="pln-doc">
      <PlainStyles />
      <PlainNav />
      <PlainSectionBody withSidebar={false} />
      <PlainFooter />
    </div>
  );
}

function PlainSectionWithSidebar() {
  return (
    <div className="pln-doc">
      <PlainStyles />
      <PlainNav />
      <PlainSectionBody withSidebar={true} />
      <PlainFooter />
    </div>
  );
}

function PlainPhoto() {
  const p = pPHOTO;
  return (
    <div className="pln-doc">
      <PlainStyles />
      <PlainNav />
      <main className="pln-main">
        <div className="pln-pnav-up">
          <a href={p.parent.href}>← {p.parent.label}</a>
        </div>
        <div className="pln-pnav">
          <a href={`/photos/${p.prev}`}>‹ Previous</a>
          <span className="pln-pnav-center">{p.index} of {p.total}</span>
          <a href={`/photos/${p.next}`}>Next ›</a>
        </div>

        <div className="pln-photopage">
          <div className="pln-photo-main">
            <img src={p.image} alt={p.title} />
            <div className="pln-photo-meta">ID: {p.id} · © Carl Rasmussen</div>
            <a className="pln-download" href="#">
              <Icon name="download" size={16} />
              Download Photo
            </a>
          </div>
          <div className="pln-photo-side">
            <h1 className="pln-h1">{p.title}</h1>
            <span className="pln-badge">photo</span>
            <Paragraphs blocks={p.description} pClass="pln-p" />

            <h3 className="pln-h3" style={{ marginTop: 24, fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Found in</h3>
            <ul className="pln-list" style={{ marginBottom: 16 }}>
              {p.foundIn.map((f, i) => <li key={i}><a href={f.href}>{f.label}</a></li>)}
            </ul>

            <div className="pln-kw" style={{ marginTop: 16 }}>
              <span className="pln-kw-label">Keywords:</span>
              {p.keywords.map((k, i) => (
                <span key={k}>
                  {i > 0 && <span style={{ color: "var(--line-strong)" }}>·</span>}{" "}
                  <a href={`/keywords/${encodeURIComponent(k)}`}>{k}</a>{" "}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
      <PlainFooter />
    </div>
  );
}

function PlainSearch() {
  const s = pSEARCH;
  return (
    <div className="pln-doc">
      <PlainStyles />
      <PlainNav />
      <main className="pln-main">
        <h1 className="pln-h1" style={{ fontSize: 28, marginBottom: 16 }}>Search</h1>
        <div className="pln-searchbox">
          <input defaultValue={s.query} aria-label="Search photos and sites" />
          <button>Search</button>
        </div>
        <div className="pln-search-meta">
          {s.total} results for <em>"{s.query}"</em> · {s.duration}
        </div>

        <div className="pln-results-head">
          <span>Sites & Sections</span>
          <span className="pln-count">{s.sections.length} matches</span>
        </div>
        {s.sections.map((r, i) => (
          <div className="pln-section-result" key={i}>
            <span className="pln-badge">{r.type}</span>
            <div>
              <h3><a href={r.href}>{r.title}</a></h3>
              <div className="pln-path">{r.path}{r.count != null && ` · ${r.count} photos`}</div>
            </div>
          </div>
        ))}

        <div className="pln-results-head">
          <span>Photos</span>
          <span className="pln-count">{s.photos.length} matches</span>
        </div>
        <div className="pln-grid">
          {s.photos.map((p) => (
            <a className="pln-thumb" key={p.id} href={`/photos/${p.id}`}>
              <img className="pln-thumb-img" src={pImg(p.id)} alt={p.title} loading="lazy" />
              <span className="pln-thumb-cap">{p.title}</span>
              <span className="pln-thumb-cap-sub">{p.section}</span>
            </a>
          ))}
        </div>
      </main>
      <PlainFooter />
    </div>
  );
}

Object.assign(window, {
  PlainHome, PlainSection, PlainSectionWithSidebar, PlainPhoto, PlainSearch,
});
