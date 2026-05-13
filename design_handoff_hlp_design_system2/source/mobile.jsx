// mobile.jsx — 375px mobile variants for both visual directions.
// Single column, hamburger nav, generous hit targets for older users.

const { img: mImg, HARAN: mHARAN, PHOTO_MIDRAS: mPHOTO, HOME: mHOME, SEARCH: mSEARCH } = window.HLP_CONTENT;

/* ─────────────────────────────────────────────────────────────────
   PLAIN MOBILE
   ───────────────────────────────────────────────────────────────── */

const MPLAIN_CSS = `
.mpln {
  --bg: #ffffff;
  --bg-alt: #f7f6f3;
  --ink: #1c1c1c;
  --ink-muted: #555;
  --ink-faint: #7a7a7a;
  --line: #e3e1dc;
  --line-strong: #c9c6bf;
  --link: #0b50a0;
  --serif: Georgia, serif;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  min-height: 100%;
  padding-top: 54px;
}
.mpln a { color: var(--link); text-decoration: none; }
.mpln a:active { text-decoration: underline; }

.mpln-topnav {
  position: absolute; top: 50px; left: 0; right: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  font-family: var(--sans);
}
.mpln-burger {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  margin-left: -10px;
  color: var(--ink);
}
.mpln-brand {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 17px;
  color: var(--ink);
}
.mpln-search-btn {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  margin-right: -10px;
  color: var(--ink);
}

.mpln-main { padding: 22px 18px 32px; }
.mpln-h1 {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 28px;
  letter-spacing: -0.012em;
  line-height: 1.15;
  margin: 0 0 6px;
}
.mpln-h2 {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 19px;
  margin: 24px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.mpln-lead { font-size: 18px; line-height: 1.5; margin: 0 0 14px; }
.mpln-p { margin: 0 0 14px; }
.mpln-p:last-child { margin-bottom: 0; }

.mpln-crumbs {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-faint);
  margin-bottom: 16px;
}
.mpln-crumbs a { color: var(--ink-muted); }
.mpln-crumbs .sep { color: var(--line-strong); margin: 0 4px; }

.mpln-badge {
  display: inline-block;
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  border: 1px solid var(--line);
  padding: 3px 9px;
  border-radius: 3px;
  margin-bottom: 16px;
}

.mpln-figure { margin: 18px -18px; }
.mpln-figure img { width: 100%; height: auto; display: block; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--bg-alt); }
.mpln-figcaption {
  font-family: var(--sans); font-size: 13px;
  color: var(--ink-faint);
  padding: 8px 18px 0;
}

.mpln-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 12px;
  margin-top: 12px;
}
.mpln-thumb { display: flex; flex-direction: column; color: var(--ink); }
.mpln-thumb-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border: 1px solid var(--line);
  background: var(--bg-alt);
}
.mpln-thumb-cap {
  font-family: var(--sans);
  font-size: 13.5px;
  line-height: 1.3;
  margin-top: 7px;
}

.mpln-kw {
  font-family: var(--sans);
  font-size: 13.5px;
  border-top: 1px solid var(--line);
  padding-top: 14px;
  margin-top: 24px;
  color: var(--ink-muted);
}
.mpln-kw-label {
  display: block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink-faint); margin-bottom: 8px;
}

.mpln-photo-img { margin: 0 -18px; }
.mpln-photo-img img { width: 100%; height: auto; display: block; background: var(--bg-alt); }
.mpln-photo-meta {
  font-family: var(--sans); font-size: 12px; color: var(--ink-faint);
  letter-spacing: 0.05em; text-transform: uppercase;
  margin: 8px 0 12px;
  display: flex; justify-content: space-between;
}
.mpln-download {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 16px;
  font-family: var(--sans); font-size: 16px; font-weight: 500;
  background: var(--bg); color: var(--ink);
  border: 1px solid var(--ink); border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 22px;
}

.mpln-pnav {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--sans); font-size: 13.5px;
  color: var(--ink-muted);
  padding: 10px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: 16px;
}
.mpln-pnav-up {
  font-family: var(--sans); font-size: 13.5px; margin-bottom: 12px;
}

.mpln-home-intro {
  font-family: var(--serif);
  font-style: italic;
  font-size: 17px;
  color: var(--ink-muted);
  margin: 0 0 18px;
  line-height: 1.5;
}
.mpln-list { list-style: none; padding: 0; margin: 0; }
.mpln-list li {
  padding: 14px 0; border-bottom: 1px dotted var(--line);
}
.mpln-list li:last-child { border-bottom: 0; }
.mpln-list a { font-size: 17px; display: block; }
.mpln-sec-eyebrow {
  font-family: var(--sans);
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 8px;
}

.mpln-carousel { margin: 12px -18px; }
.mpln-carousel img { width: 100%; height: auto; display: block; background: var(--bg-alt); }
.mpln-carousel-caption {
  padding: 8px 18px 0;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--sans); font-size: 13px; color: var(--ink-muted);
}

.mpln-hint {
  font-family: var(--sans);
  font-size: 14px;
  background: var(--bg-alt);
  border-left: 2px solid var(--ink);
  padding: 12px 14px;
  margin: 18px 0;
}
.mpln-hint strong { display: block; margin-bottom: 4px; }

.mpln-search-box {
  display: flex;
  border: 1px solid var(--ink);
  margin-bottom: 14px;
}
.mpln-search-box input {
  flex: 1; border: 0; padding: 12px 14px;
  font-family: var(--serif); font-size: 17px;
  background: transparent; color: var(--ink); outline: none;
  min-width: 0;
}
.mpln-search-box button {
  border: 0; background: var(--ink); color: #fff;
  padding: 0 16px; font-family: var(--sans); font-size: 13.5px;
}
.mpln-search-meta {
  font-family: var(--sans); font-size: 13px; color: var(--ink-muted);
  margin-bottom: 22px;
}
.mpln-results-head {
  font-family: var(--sans); font-size: 11.5px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint);
  margin: 22px 0 12px;
  padding-bottom: 8px; border-bottom: 1px solid var(--line);
  display: flex; justify-content: space-between;
}
.mpln-section-result {
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.mpln-section-result h3 {
  margin: 6px 0 2px; font-family: var(--serif); font-weight: 600; font-size: 18px;
}
.mpln-section-result h3 a { color: var(--ink); }
.mpln-section-result .path { font-family: var(--sans); font-size: 13px; color: var(--ink-muted); }

/* ─── AI section ─── */
.mpln-ai-section { margin: 0 0 32px; }
.mpln-ai-blurb {
  font-size: 16px; line-height: 1.5;
  color: var(--ink-muted);
  margin: 0 0 14px;
}
.mpln-ai-disclaimer-inline {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-faint);
  display: block;
  margin-top: 4px;
}
.mpln-ai-panel {
  margin: 0 -18px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}
.mpln-ai-input-wrap { padding: 14px 18px; border-bottom: 1px solid var(--line); }
.mpln-ai-input {
  display: flex;
  border: 1px solid var(--ink);
}
.mpln-ai-input input {
  flex: 1; border: 0; padding: 11px 12px;
  font-family: var(--serif); font-size: 16px;
  background: var(--bg); color: var(--ink); outline: none;
  min-width: 0;
}
.mpln-ai-input button {
  border: 0; background: var(--ink); color: #fff;
  padding: 0 14px; font-family: var(--sans); font-size: 13.5px; font-weight: 500;
  min-width: 64px;
}
.mpln-ai-input button:disabled { background: var(--ink-faint); }

.mpln-ai-chips {
  padding: 12px 18px 16px;
  display: flex; flex-wrap: wrap; gap: 8px;
  align-items: center;
}
.mpln-ai-chips-label {
  width: 100%;
  font-family: var(--sans); font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-faint);
  margin-bottom: 2px;
}
.mpln-ai-chip {
  font-family: var(--sans);
  font-size: 13px;
  padding: 7px 12px;
  border: 1px solid var(--line-strong);
  background: var(--bg);
  color: var(--ink);
  border-radius: 3px;
}

.mpln-ai-thread { padding: 16px 18px; }
.mpln-ai-msg { margin: 0 0 18px; }
.mpln-ai-msg-user { display: flex; justify-content: flex-end; }
.mpln-ai-user-bubble {
  background: #eaf0f9; border: 1px solid #c8d6ea;
  padding: 9px 12px; max-width: 85%;
  font-size: 15.5px; line-height: 1.45;
}
.mpln-ai-assistant-tag {
  font-family: var(--sans);
  font-size: 10.5px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-faint);
  margin-bottom: 6px;
}
.mpln-ai-md { font-size: 15.5px; line-height: 1.55; color: var(--ink); }
.mpln-ai-md p { margin: 0 0 8px; }
.mpln-ai-md ul, .mpln-ai-md ol { margin: 4px 0 10px; padding-left: 20px; }
.mpln-ai-md li { margin: 0 0 4px; }
.mpln-ai-md a { color: var(--link); }
.mpln-ai-md strong { font-weight: 600; }
.mpln-ai-md em { font-style: italic; }
.mpln-ai-foot {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--ink-faint);
  margin-top: 6px;
}
.mpln-ai-loading {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--ink-faint);
  font-style: italic;
}

.mpln-ai-open-full {
  display: block;
  padding: 12px 18px;
  font-family: var(--sans);
  font-size: 14px;
  color: var(--ink-muted) !important;
  background: var(--bg-alt);
  border-top: 1px solid var(--line);
  text-decoration: none;
  text-align: center;
}

.mpln-footer {
  font-family: var(--sans); font-size: 12.5px;
  color: var(--ink-muted);
  border-top: 1px solid var(--line);
  padding: 18px 18px 34px;
  margin-top: 28px;
  display: flex; flex-wrap: wrap; gap: 14px;
}
.mpln-footer a { color: var(--ink-muted); }
.mpln-footer .cr { width: 100%; margin-bottom: 4px; }
`;

function MPlainStyles() { return <style dangerouslySetInnerHTML={{ __html: MPLAIN_CSS }} />; }

function MPlainNav() {
  return (
    <div className="mpln-topnav">
      <button className="mpln-burger" aria-label="Menu"><Icon name="menu" size={22} /></button>
      <span className="mpln-brand">HolyLandPhotos</span>
      <button className="mpln-search-btn" aria-label="Search"><Icon name="search" size={20} /></button>
    </div>
  );
}

function MPlainFooter() {
  return (
    <footer className="mpln-footer">
      <span className="cr">© 1995–2026 Dr. Carl Rasmussen</span>
      <a href="#">About</a>
      <a href="#">Permission</a>
      <a href="#">News</a>
      <a href="#">Feedback</a>
    </footer>
  );
}

function MPlainHome() {
  const { hero, sotw, browse, pages } = mHOME;
  return (
    <div className="mpln">
      <MPlainStyles />
      <MPlainNav />
      <main className="mpln-main">
        <p className="mpln-home-intro">
          Free, high-resolution photographs of biblical and archaeological sites,
          taken by Dr. Carl Rasmussen across more than four decades.
        </p>

        <h2 className="mpln-h2" style={{ marginTop: 0 }}>Browse</h2>
        <ul className="mpln-list">
          {browse.slice(0, 6).map((b, i) => <li key={i}><a href={b.href}>{b.label}</a></li>)}
        </ul>

        <h2 className="mpln-h2">Pages</h2>
        <ul className="mpln-list">
          {pages.slice(0, 5).map((p, i) => <li key={i}><a href={p.href}>{p.label}</a></li>)}
        </ul>

        <h2 className="mpln-h2"><a href="/news/9" style={{ color: "var(--ink)" }}>Holy Week and Easter</a></h2>
        <div className="mpln-carousel">
          <img src={hero.image} alt={hero.caption} />
          <div className="mpln-carousel-caption">
            <span><em>{hero.caption}</em></span>
            <span>{hero.index} of {hero.total}</span>
          </div>
        </div>
        <Paragraphs blocks={hero.body.slice(0, 2)} pClass="mpln-p" />
        <div className="mpln-hint">
          <strong>Sunday Service Hint</strong>
          You're welcome to use these images in worship slides.
        </div>

        <AISearchSection variant="mobile" />

        <h2 className="mpln-h2">Site of the Week</h2>
        <a href={sotw.href}><img src={sotw.image} alt={sotw.title} style={{ width: "100%", height: "auto", display: "block", border: "1px solid var(--line)" }} /></a>
        <h3 className="mpln-h1" style={{ fontSize: 22, marginTop: 14 }}><a href={sotw.href}>{sotw.title}</a></h3>
        <p className="mpln-p">{sotw.body}</p>
      </main>
      <MPlainFooter />
    </div>
  );
}

function MPlainSection() {
  const s = mHARAN;
  return (
    <div className="mpln">
      <MPlainStyles />
      <MPlainNav />
      <main className="mpln-main">
        <nav className="mpln-crumbs">
          <a href="/">Home</a><span className="sep">›</span>
          <a href="/browse/turkey">Turkey</a><span className="sep">›</span>
          <a href="/browse/eastern-turkey">Eastern Turkey</a><span className="sep">›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Haran</span>
        </nav>
        <h1 className="mpln-h1">{s.title}</h1>
        <span className="mpln-badge">{s.type}</span>

        <figure className="mpln-figure">
          <img src={s.hero} alt={s.heroAlt} />
          <figcaption className="mpln-figcaption">Tap image to enlarge</figcaption>
        </figure>

        {s.body.map((p, i) => (
          <p key={i} className={i === 0 ? "mpln-lead" : "mpln-p"}>{p}</p>
        ))}

        <h2 className="mpln-h2">Photos <span style={{ color: "var(--ink-faint)", fontWeight: 400, fontSize: 16 }}>({s.photos.length})</span></h2>
        <div className="mpln-grid">
          {s.photos.slice(0, 8).map((p) => (
            <a className="mpln-thumb" key={p.id} href={`/photos/${p.id}?s=${s.slug}`}>
              <img className="mpln-thumb-img" src={mImg(p.id)} alt={p.title} loading="lazy" />
              <span className="mpln-thumb-cap">{p.title}</span>
            </a>
          ))}
        </div>

        <div className="mpln-kw">
          <span className="mpln-kw-label">Keywords</span>
          {s.keywords.slice(0, 8).map((k, i) => (
            <span key={k}>
              {i > 0 && <span style={{ color: "var(--line-strong)" }}> · </span>}
              <a href={`/keywords/${encodeURIComponent(k)}`}>{k}</a>
            </span>
          ))}
        </div>
      </main>
      <MPlainFooter />
    </div>
  );
}

function MPlainPhoto() {
  const p = mPHOTO;
  return (
    <div className="mpln">
      <MPlainStyles />
      <MPlainNav />
      <main className="mpln-main">
        <div className="mpln-pnav-up">
          <a href={p.parent.href}>← {p.parent.label}</a>
        </div>
        <div className="mpln-pnav">
          <a href="#">‹ Prev</a>
          <span style={{ color: "var(--ink-faint)", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.index} of {p.total}</span>
          <a href="#">Next ›</a>
        </div>

        <h1 className="mpln-h1">{p.title}</h1>
        <span className="mpln-badge">photo</span>

        <div className="mpln-photo-img" style={{ marginTop: 4, marginBottom: 8 }}>
          <img src={p.image} alt={p.title} />
        </div>
        <div className="mpln-photo-meta">
          <span>ID: {p.id}</span>
          <span>© Carl Rasmussen</span>
        </div>
        <a className="mpln-download" href="#">
          <Icon name="download" size={17} />
          Download Photo
        </a>

        <Paragraphs blocks={p.description} pClass="mpln-p" />

        <h3 style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)", margin: "22px 0 8px" }}>Found in</h3>
        <ul className="mpln-list" style={{ marginTop: 0 }}>
          {p.foundIn.map((f, i) => <li key={i}><a href={f.href}>{f.label}</a></li>)}
        </ul>

        <div className="mpln-kw">
          <span className="mpln-kw-label">Keywords</span>
          {p.keywords.slice(0, 8).map((k, i) => (
            <span key={k}>
              {i > 0 && <span style={{ color: "var(--line-strong)" }}> · </span>}
              <a href={`/keywords/${encodeURIComponent(k)}`}>{k}</a>
            </span>
          ))}
        </div>
      </main>
      <MPlainFooter />
    </div>
  );
}

function MPlainSearch() {
  const s = mSEARCH;
  return (
    <div className="mpln">
      <MPlainStyles />
      <MPlainNav />
      <main className="mpln-main">
        <h1 className="mpln-h1" style={{ fontSize: 24, marginBottom: 14 }}>Search</h1>
        <div className="mpln-search-box">
          <input defaultValue={s.query} aria-label="Search" />
          <button>Go</button>
        </div>
        <div className="mpln-search-meta">{s.total} results for <em>"{s.query}"</em> · {s.duration}</div>

        <div className="mpln-results-head">
          <span>Sites & Sections</span>
          <span>{s.sections.length}</span>
        </div>
        {s.sections.map((r, i) => (
          <div className="mpln-section-result" key={i}>
            <span className="mpln-badge" style={{ marginBottom: 0 }}>{r.type}</span>
            <h3><a href={r.href}>{r.title}</a></h3>
            <div className="path">{r.path}{r.count != null && ` · ${r.count} photos`}</div>
          </div>
        ))}

        <div className="mpln-results-head">
          <span>Photos</span>
          <span>{s.photos.length}</span>
        </div>
        <div className="mpln-grid">
          {s.photos.slice(0, 6).map((p) => (
            <a className="mpln-thumb" key={p.id} href={`/photos/${p.id}`}>
              <img className="mpln-thumb-img" src={mImg(p.id)} alt={p.title} loading="lazy" />
              <span className="mpln-thumb-cap">{p.title}</span>
            </a>
          ))}
        </div>
      </main>
      <MPlainFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   WARM MOBILE
   ───────────────────────────────────────────────────────────────── */

const MWARM_CSS = `
.mwrm {
  --bg: #F9F7F4;
  --bg-deeper: #F2EFE8;
  --paper: #FFFDFA;
  --ink: #2C2A26;
  --ink-2: #4A453E;
  --ink-faint: #7A736A;
  --line: #E2DCD2;
  --line-strong: #C9C1B3;
  --accent: #B85C2C;
  --accent-deep: #7A3B18;
  --nav: #2C2416;
  --serif: "Lora", Georgia, serif;
  --sans: "Cabin", "Hanken Grotesk", system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1.6;
  min-height: 100%;
  padding-top: 54px;
  -webkit-font-smoothing: antialiased;
}
.mwrm a { color: var(--accent-deep); text-decoration: none; }

.mwrm-topnav {
  position: absolute; top: 50px; left: 0; right: 0;
  background: var(--nav);
  color: #f3ece0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px;
  font-family: var(--sans);
}
.mwrm-burger {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  color: #f3ece0; margin-left: -10px;
}
.mwrm-brand {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 17px;
  color: #fdf8ed;
}
.mwrm-search-btn {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  color: #d5c7a8; margin-right: -10px;
}

.mwrm-main { padding: 22px 18px 32px; }
.mwrm-h1 { font-family: var(--serif); font-weight: 600; font-size: 30px; line-height: 1.15; margin: 0 0 6px; }
.mwrm-h2 {
  font-family: var(--serif); font-weight: 600;
  font-size: 20px; margin: 26px 0 14px;
  padding-bottom: 10px;
  position: relative;
}
.mwrm-h2::after {
  content: ""; position: absolute; left: 0; bottom: -1px;
  width: 30px; height: 2px; background: var(--accent);
}
.mwrm-lead { font-size: 18px; line-height: 1.55; margin: 0 0 14px; }
.mwrm-p { margin: 0 0 14px; }
.mwrm-eyebrow {
  font-family: var(--sans); font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-faint); margin: 0 0 8px;
}

.mwrm-crumbs {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-faint);
  margin-bottom: 16px;
}
.mwrm-crumbs a { color: var(--ink-2); }
.mwrm-crumbs .sep { color: var(--line-strong); margin: 0 4px; }

.mwrm-badge {
  display: inline-block; font-family: var(--sans);
  font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--accent);
  background: rgba(184,92,44,0.08);
  border: 1px solid rgba(184,92,44,0.25);
  padding: 3px 9px; border-radius: 3px;
  margin-bottom: 16px;
}

.mwrm-figure { margin: 18px -18px; }
.mwrm-figure img { width: 100%; height: auto; display: block; background: var(--bg-deeper); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.mwrm-figcaption { font-family: var(--sans); font-size: 12.5px; color: var(--ink-faint); padding: 8px 18px 0; font-style: italic; }

.mwrm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 14px;
  margin-top: 14px;
}
.mwrm-thumb { display: flex; flex-direction: column; color: var(--ink); }
.mwrm-thumb-img {
  width: 100%; aspect-ratio: 4 / 3; object-fit: cover;
  border: 1px solid var(--line); background: var(--bg-deeper);
}
.mwrm-thumb-cap {
  font-family: var(--serif); font-size: 14.5px; line-height: 1.35;
  margin-top: 7px; color: var(--ink);
}

.mwrm-kw {
  font-family: var(--sans); font-size: 13.5px;
  border-top: 1px solid var(--line);
  padding-top: 16px; margin-top: 26px;
}
.mwrm-kw-label {
  display: block; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--ink-faint); margin-bottom: 10px;
}
.mwrm-kw a {
  display: inline-block; margin: 0 6px 6px 0;
  padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px;
  background: var(--paper); color: var(--ink-2); font-size: 13px;
}

.mwrm-photo-img { margin: 0 -18px; }
.mwrm-photo-img img { width: 100%; height: auto; display: block; background: var(--bg-deeper); }
.mwrm-photo-meta {
  font-family: var(--sans); font-size: 12px; color: var(--ink-faint);
  letter-spacing: 0.06em; text-transform: uppercase;
  margin: 10px 0 12px;
  display: flex; justify-content: space-between;
}
.mwrm-download {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 16px;
  font-family: var(--sans); font-size: 15px; font-weight: 600;
  letter-spacing: 0.04em;
  background: var(--accent); color: #fff;
  border: 1px solid var(--accent); border-radius: 3px;
  width: 100%; box-sizing: border-box;
  margin: 0 0 22px;
  text-decoration: none;
}

.mwrm-pnav {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--sans); font-size: 13.5px;
  color: var(--ink-2);
  padding: 12px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: 18px;
}
.mwrm-pnav-up { font-family: var(--sans); font-size: 13.5px; margin-bottom: 10px; }

.mwrm-home-hero {
  background: var(--paper);
  padding: 28px 22px;
  border-bottom: 1px solid var(--line);
  text-align: center;
  margin: 0 -18px 24px;
}
.mwrm-home-tag {
  font-family: var(--sans); font-size: 11.5px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-faint);
  margin-bottom: 8px;
}
.mwrm-home-h1 {
  font-family: var(--serif); font-weight: 600;
  font-size: 34px; letter-spacing: -0.005em; line-height: 1.1;
  margin: 0 0 8px;
}
.mwrm-home-blurb {
  font-family: var(--serif); font-size: 15.5px;
  font-style: italic;
  color: var(--ink-2); margin: 0;
}
.mwrm-home-divider { width: 50px; height: 1px; background: var(--accent); margin: 14px auto 0; }

.mwrm-list { list-style: none; padding: 0; margin: 0; }
.mwrm-list li { padding: 14px 0; border-bottom: 1px solid var(--line); }
.mwrm-list li:last-child { border-bottom: 0; }
.mwrm-list a {
  font-family: var(--serif); font-size: 17px; color: var(--ink);
  display: flex; justify-content: space-between; align-items: center;
}
.mwrm-list a::after { content: "›"; color: var(--line-strong); font-size: 18px; }

.mwrm-sotw {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: 20px;
  margin-top: 24px;
}
.mwrm-sotw img { width: 100%; height: auto; display: block; }

.mwrm-hint {
  font-family: var(--sans); font-size: 14px;
  background: rgba(184,92,44,0.06);
  border-left: 3px solid var(--accent);
  padding: 12px 14px;
  margin: 18px 0;
}
.mwrm-hint strong { display: block; margin-bottom: 4px; color: var(--ink); }

.mwrm-carousel { margin: 14px -18px 0; }
.mwrm-carousel img { width: 100%; height: auto; display: block; background: var(--bg-deeper); }
.mwrm-carousel-caption {
  padding: 8px 18px 0;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--sans); font-size: 13px; color: var(--ink-2);
}

.mwrm-search-box {
  display: flex;
  background: var(--paper);
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  margin-bottom: 14px;
  overflow: hidden;
}
.mwrm-search-box input {
  flex: 1; border: 0; padding: 12px 14px;
  font-family: var(--serif); font-size: 17px;
  background: transparent; color: var(--ink); outline: none;
  min-width: 0;
}
.mwrm-search-box button {
  border: 0; background: var(--accent); color: #fff;
  padding: 0 18px; font-family: var(--sans); font-size: 13px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.mwrm-search-meta { font-family: var(--sans); font-size: 13px; color: var(--ink-faint); margin-bottom: 18px; }
.mwrm-search-meta em { color: var(--ink); font-style: italic; }
.mwrm-results-head {
  font-family: var(--sans); font-size: 11px; font-weight: 600;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-faint);
  margin: 22px 0 14px;
  padding-bottom: 8px; border-bottom: 1px solid var(--line);
  display: flex; justify-content: space-between;
}
.mwrm-results-head .count { color: var(--accent); }
.mwrm-section-result { padding: 14px 0; border-bottom: 1px solid var(--line); }
.mwrm-section-result h3 { margin: 6px 0 2px; font-family: var(--serif); font-size: 19px; font-weight: 600; }
.mwrm-section-result h3 a { color: var(--ink); }
.mwrm-section-result .path { font-family: var(--sans); font-size: 13px; color: var(--ink-faint); }

.mwrm-footer {
  font-family: var(--sans); font-size: 12.5px;
  background: var(--nav); color: #c9b88c;
  padding: 18px 18px 36px;
  margin-top: 28px;
  display: flex; flex-wrap: wrap; gap: 16px;
}
.mwrm-footer .cr { width: 100%; color: #d8c9a8; margin-bottom: 4px; }
.mwrm-footer a { color: #ece2cc; }
`;

function MWarmStyles() { return <style dangerouslySetInnerHTML={{ __html: MWARM_CSS }} />; }

function MWarmNav() {
  return (
    <div className="mwrm-topnav">
      <button className="mwrm-burger" aria-label="Menu"><Icon name="menu" size={22} stroke="#f3ece0" /></button>
      <span className="mwrm-brand">HolyLandPhotos</span>
      <button className="mwrm-search-btn" aria-label="Search"><Icon name="search" size={20} stroke="#d5c7a8" /></button>
    </div>
  );
}

function MWarmFooter() {
  return (
    <footer className="mwrm-footer">
      <span className="cr">© 1995–2026 Dr. Carl Rasmussen</span>
      <a href="#">About</a>
      <a href="#">Permission</a>
      <a href="#">News</a>
      <a href="#">Feedback</a>
    </footer>
  );
}

function MWarmHome() {
  const { hero, sotw, browse, pages } = mHOME;
  return (
    <div className="mwrm">
      <MWarmStyles />
      <MWarmNav />
      <main className="mwrm-main" style={{ paddingTop: 0 }}>
        <div className="mwrm-home-hero">
          <p className="mwrm-home-tag">est. 1995</p>
          <h1 className="mwrm-home-h1">Holy Land Photos</h1>
          <p className="mwrm-home-blurb">7,000+ photographs from biblical sites.</p>
          <div className="mwrm-home-divider" />
        </div>

        <h2 className="mwrm-h2" style={{ marginTop: 8 }}>Browse the Archive</h2>
        <ul className="mwrm-list">
          {browse.slice(0, 6).map((b, i) => <li key={i}><a href={b.href}>{b.label}</a></li>)}
        </ul>

        <h2 className="mwrm-h2">About & Resources</h2>
        <ul className="mwrm-list">
          {pages.slice(0, 4).map((p, i) => <li key={i}><a href={p.href}>{p.label}</a></li>)}
        </ul>

        <p className="mwrm-eyebrow" style={{ marginTop: 26 }}>News · Featured</p>
        <h2 className="mwrm-h2" style={{ marginTop: 0 }}><a href="/news/9" style={{ color: "var(--ink)" }}>Holy Week and Easter</a></h2>
        <div className="mwrm-carousel">
          <img src={hero.image} alt={hero.caption} />
          <div className="mwrm-carousel-caption">
            <span><em>{hero.caption}</em></span>
            <span>{hero.index} of {hero.total}</span>
          </div>
        </div>
        <Paragraphs blocks={hero.body.slice(0, 2)} pClass="mwrm-p" />
        <div className="mwrm-hint">
          <strong>For pastors & teachers</strong>
          You're welcome to download images for sermons, slides, and lessons.
        </div>

        <div className="mwrm-sotw">
          <p className="mwrm-eyebrow" style={{ color: "var(--accent)" }}>Site of the Week</p>
          <a href={sotw.href}><img src={sotw.image} alt={sotw.title} /></a>
          <h3 className="mwrm-h1" style={{ fontSize: 24, margin: "14px 0 8px" }}><a href={sotw.href} style={{ color: "var(--ink)" }}>{sotw.title}</a></h3>
          <p className="mwrm-p" style={{ fontSize: 15.5 }}>{sotw.body}</p>
        </div>
      </main>
      <MWarmFooter />
    </div>
  );
}

function MWarmSection() {
  const s = mHARAN;
  return (
    <div className="mwrm">
      <MWarmStyles />
      <MWarmNav />
      <main className="mwrm-main">
        <nav className="mwrm-crumbs">
          <a href="/">Home</a><span className="sep">›</span>
          <a href="#">Turkey</a><span className="sep">›</span>
          <a href="#">Eastern Turkey</a><span className="sep">›</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Haran</span>
        </nav>
        <p className="mwrm-eyebrow">Eastern Turkey</p>
        <h1 className="mwrm-h1">{s.title}</h1>
        <span className="mwrm-badge">{s.type}</span>

        <figure className="mwrm-figure">
          <img src={s.hero} alt={s.heroAlt} />
          <figcaption className="mwrm-figcaption">Tap image to enlarge</figcaption>
        </figure>

        {s.body.map((p, i) => (
          <p key={i} className={i === 0 ? "mwrm-lead" : "mwrm-p"}>{p}</p>
        ))}

        <h2 className="mwrm-h2">Photographs <span style={{ color: "var(--ink-faint)", fontWeight: 400, fontSize: 16 }}>({s.photos.length})</span></h2>
        <div className="mwrm-grid">
          {s.photos.slice(0, 8).map((p) => (
            <a className="mwrm-thumb" key={p.id} href={`/photos/${p.id}?s=${s.slug}`}>
              <img className="mwrm-thumb-img" src={mImg(p.id)} alt={p.title} loading="lazy" />
              <span className="mwrm-thumb-cap">{p.title}</span>
            </a>
          ))}
        </div>

        <div className="mwrm-kw">
          <span className="mwrm-kw-label">Keywords</span>
          {s.keywords.slice(0, 7).map((k) => (
            <a key={k} href={`/keywords/${encodeURIComponent(k)}`}>{k}</a>
          ))}
        </div>
      </main>
      <MWarmFooter />
    </div>
  );
}

function MWarmPhoto() {
  const p = mPHOTO;
  return (
    <div className="mwrm">
      <MWarmStyles />
      <MWarmNav />
      <main className="mwrm-main">
        <div className="mwrm-pnav-up">
          <a href={p.parent.href}>← {p.parent.label}</a>
        </div>
        <div className="mwrm-pnav">
          <a href="#">‹ Prev</a>
          <span style={{ color: "var(--ink-faint)", fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>Photo {p.index} of {p.total}</span>
          <a href="#">Next ›</a>
        </div>

        <p className="mwrm-eyebrow">Midras (Rolling Stone Tomb)</p>
        <h1 className="mwrm-h1">{p.title}</h1>
        <span className="mwrm-badge">photograph</span>

        <div className="mwrm-photo-img">
          <img src={p.image} alt={p.title} />
        </div>
        <div className="mwrm-photo-meta">
          <span>ID: {p.id}</span>
          <span>© Carl Rasmussen</span>
        </div>
        <a className="mwrm-download" href="#">
          <Icon name="download" size={16} stroke="#fff" />
          Download Photo
        </a>

        <Paragraphs blocks={p.description} pClass="mwrm-p" />

        <h3 style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)", margin: "22px 0 8px", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>Found in</h3>
        <ul className="mwrm-list">
          {p.foundIn.map((f, i) => <li key={i}><a href={f.href}>{f.label}</a></li>)}
        </ul>

        <div className="mwrm-kw">
          <span className="mwrm-kw-label">Keywords</span>
          {p.keywords.slice(0, 8).map((k) => (
            <a key={k} href={`/keywords/${encodeURIComponent(k)}`}>{k}</a>
          ))}
        </div>
      </main>
      <MWarmFooter />
    </div>
  );
}

function MWarmSearch() {
  const s = mSEARCH;
  return (
    <div className="mwrm">
      <MWarmStyles />
      <MWarmNav />
      <main className="mwrm-main">
        <p className="mwrm-eyebrow">Search the Archive</p>
        <h1 className="mwrm-h1" style={{ fontSize: 24, marginBottom: 14 }}>Find a site or photo</h1>
        <div className="mwrm-search-box">
          <input defaultValue={s.query} aria-label="Search" />
          <button>Go</button>
        </div>
        <div className="mwrm-search-meta">
          <strong style={{ color: "var(--ink)" }}>{s.total}</strong> results for <em>"{s.query}"</em> · {s.duration}
        </div>

        <div className="mwrm-results-head">
          <span>Sites & Sections</span>
          <span className="count">{s.sections.length}</span>
        </div>
        {s.sections.map((r, i) => (
          <div className="mwrm-section-result" key={i}>
            <span className="mwrm-badge" style={{ marginBottom: 0 }}>{r.type}</span>
            <h3><a href={r.href}>{r.title}</a></h3>
            <div className="path">{r.path}{r.count != null && ` · ${r.count} photos`}</div>
          </div>
        ))}

        <div className="mwrm-results-head">
          <span>Photographs</span>
          <span className="count">{s.photos.length}</span>
        </div>
        <div className="mwrm-grid">
          {s.photos.slice(0, 6).map((p) => (
            <a className="mwrm-thumb" key={p.id} href={`/photos/${p.id}`}>
              <img className="mwrm-thumb-img" src={mImg(p.id)} alt={p.title} loading="lazy" />
              <span className="mwrm-thumb-cap">{p.title}</span>
            </a>
          ))}
        </div>
      </main>
      <MWarmFooter />
    </div>
  );
}

Object.assign(window, {
  MPlainHome, MPlainSection, MPlainPhoto, MPlainSearch,
  MWarmHome, MWarmSection, MWarmPhoto, MWarmSearch,
});
