// round2.jsx — Lightbox, Download modal, Mobile hamburger drawer,
// AI Search full page, Newsletter form, Print preview.

const { img: r2Img, HARAN: r2HARAN, PHOTO_MIDRAS: r2PHOTO, HOME: r2HOME } = window.HLP_CONTENT;

const R2_CSS = `
/* ─────────── Shared overlay base ─────────── */
.pln-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.pln-overlay-close {
  position: absolute; top: 20px; right: 20px;
  width: 44px; height: 44px;
  background: transparent; border: 0;
  color: rgba(255,255,255,0.9);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 3px;
}
.pln-overlay-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* ─────────── Lightbox ─────────── */
.pln-lightbox-img {
  max-width: 95%;
  max-height: 90%;
  object-fit: contain;
  display: block;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.pln-lightbox-cap {
  position: absolute; bottom: 18px; left: 0; right: 0;
  text-align: center;
  font-family: var(--sans);
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.06em;
}
.pln-lightbox-cap strong { color: #fff; font-weight: 600; margin-right: 14px; }

/* ─────────── Download modal ─────────── */
.pln-modal {
  background: #fff;
  max-width: 480px;
  width: 92%;
  border: 1px solid var(--ink);
  padding: 32px 36px 28px;
  box-sizing: border-box;
  font-family: var(--serif);
  color: var(--ink);
  position: relative;
}
.pln-modal h2 {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 22px;
  margin: 0 0 4px;
  letter-spacing: -0.005em;
}
.pln-modal .pln-modal-eyebrow {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 8px;
}
.pln-modal p {
  font-size: 15.5px;
  line-height: 1.55;
  margin: 0 0 12px;
  color: var(--ink-muted);
}
.pln-modal p:last-of-type { margin-bottom: 24px; }
.pln-modal strong { color: var(--ink); font-weight: 600; }
.pln-modal-actions {
  display: flex; gap: 10px;
  justify-content: flex-end;
  border-top: 1px solid var(--line);
  padding-top: 20px;
}
.pln-btn-primary, .pln-btn-secondary {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid var(--ink);
  display: inline-flex; align-items: center; gap: 8px;
}
.pln-btn-primary {
  background: var(--ink); color: #fff;
}
.pln-btn-primary:hover { background: #000; }
.pln-btn-secondary {
  background: #fff; color: var(--ink);
}
.pln-btn-secondary:hover { background: var(--bg-alt); }

/* ─────────── Mobile drawer ─────────── */
.mpln-drawer-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
}
.mpln-drawer {
  position: absolute; top: 0; bottom: 0; left: 0;
  width: 84%;
  max-width: 320px;
  background: #fff;
  padding: 0;
  display: flex; flex-direction: column;
  box-shadow: 6px 0 24px rgba(0,0,0,0.18);
  font-family: var(--sans);
  color: var(--ink);
  animation: mpln-slide-in 0.22s ease-out;
}
@keyframes mpln-slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.mpln-drawer-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
}
.mpln-drawer-brand {
  font-family: var(--serif); font-weight: 600; font-size: 17px;
  color: var(--ink);
}
.mpln-drawer-close {
  width: 44px; height: 44px;
  background: transparent; border: 0;
  color: var(--ink);
  display: flex; align-items: center; justify-content: center;
  margin-right: -10px;
  cursor: pointer;
}
.mpln-drawer-section {
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}
.mpln-drawer-section:last-child { border-bottom: 0; }
.mpln-drawer-label {
  display: block;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-faint);
  padding: 12px 18px 4px;
}
.mpln-drawer-link {
  display: block;
  padding: 14px 18px;
  font-family: var(--serif);
  font-size: 18px;
  color: var(--ink);
  text-decoration: none;
  min-height: 44px;
  box-sizing: border-box;
}
.mpln-drawer-link:active { background: var(--bg-alt); }
.mpln-drawer-foot {
  margin-top: auto;
  padding: 16px 18px;
  font-size: 12px;
  color: var(--ink-faint);
  border-top: 1px solid var(--line);
}

/* ─────────── AI Search full page ─────────── */
.pln-aip-hero {
  border-bottom: 1px solid var(--line);
  padding-bottom: 28px;
  margin-bottom: 28px;
}
.pln-aip-hero h1 {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 36px;
  letter-spacing: -0.012em;
  line-height: 1.15;
  margin: 0 0 8px;
}
.pln-aip-hero p {
  font-size: 17.5px;
  color: var(--ink-muted);
  margin: 0;
  max-width: 68ch;
  line-height: 1.55;
}
.pln-aip-disclaimer {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-faint);
  background: var(--bg-alt);
  border-left: 2px solid var(--ink);
  padding: 10px 14px;
  margin: 14px 0 0;
  max-width: 68ch;
}
.pln-aip-main {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 48px;
  align-items: start;
}
.pln-aip-thread-wrap {
  border: 1px solid var(--line);
  background: var(--bg);
}
.pln-aip-input-wrap {
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.pln-aip-thread {
  padding: 24px 22px;
  min-height: 360px;
  max-height: 640px;
  overflow-y: auto;
}
.pln-aip-side {
  font-family: var(--sans);
  font-size: 13.5px;
  color: var(--ink-muted);
  position: sticky;
  top: 24px;
}
.pln-aip-side h3 {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.pln-aip-side ul { list-style: none; padding: 0; margin: 0 0 24px; }
.pln-aip-side li { padding: 8px 0; border-bottom: 1px dotted var(--line); }
.pln-aip-side li:last-child { border-bottom: 0; }
.pln-aip-side a { color: var(--ink); text-decoration: none; font-family: var(--serif); font-size: 15px; }
.pln-aip-side a:hover { color: var(--link); }
.pln-aip-side .pln-aip-counter {
  font-size: 12px;
  color: var(--ink-faint);
  margin-top: 4px;
}

/* ─────────── Newsletter form ─────────── */
.pln-nl {
  max-width: 560px;
  margin: 0;
}
.pln-nl-blurb {
  font-size: 17.5px;
  color: var(--ink-muted);
  margin: 0 0 28px;
  line-height: 1.55;
  max-width: 60ch;
}
.pln-nl-field {
  margin: 0 0 16px;
}
.pln-nl-label {
  display: block;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px;
  letter-spacing: 0.02em;
}
.pln-nl-label .pln-nl-req { color: var(--accent); font-weight: 400; margin-left: 2px; }
.pln-nl-label .pln-nl-opt {
  font-weight: 400;
  color: var(--ink-faint);
  margin-left: 6px;
  letter-spacing: 0;
}
.pln-nl-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--line-strong);
  background: #fff;
  padding: 12px 14px;
  font-family: var(--serif);
  font-size: 17px;
  color: var(--ink);
  outline: none;
}
.pln-nl-input:focus { border-color: var(--ink); }
.pln-nl-input--email {
  border: 1px solid var(--ink);
  font-size: 18px;
}
.pln-nl-input--error {
  border-color: var(--accent);
  background: #fdf6f3;
}
.pln-nl-help {
  font-family: var(--sans);
  font-size: 12.5px;
  color: var(--ink-faint);
  margin: 6px 0 0;
}
.pln-nl-error {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--accent);
  margin: 6px 0 0;
  display: flex; align-items: center; gap: 6px;
}
.pln-nl-submit-row {
  display: flex; align-items: center; gap: 16px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}
.pln-nl-submit {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 500;
  background: var(--ink);
  color: #fff;
  border: 1px solid var(--ink);
  padding: 12px 22px;
  border-radius: 3px;
  cursor: pointer;
  letter-spacing: 0.02em;
}
.pln-nl-submit:hover { background: #000; }
.pln-nl-submit:disabled { background: var(--ink-faint); border-color: var(--ink-faint); cursor: not-allowed; }
.pln-nl-privacy {
  font-family: var(--sans);
  font-size: 12.5px;
  color: var(--ink-faint);
  flex: 1;
  max-width: 28ch;
}
.pln-nl-success {
  border: 1px solid var(--line-strong);
  background: var(--bg-alt);
  padding: 22px 24px;
  font-family: var(--serif);
}
.pln-nl-success h3 {
  font-family: var(--serif);
  font-size: 21px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--ink);
}
.pln-nl-success p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 16px;
  line-height: 1.5;
}

/* ─────────── Print preview ─────────── */
.pln-print-page {
  background: #fff;
  padding: 0.75in 0.75in 0.75in;
  font-family: Georgia, serif;
  font-size: 12pt;
  line-height: 1.4;
  color: #000;
  box-sizing: border-box;
  min-height: 100%;
}
.pln-print-page h1 {
  font-family: Georgia, serif;
  font-weight: 600;
  font-size: 22pt;
  margin: 0 0 4pt;
  letter-spacing: -0.005em;
  line-height: 1.15;
}
.pln-print-page .pln-print-section {
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 12pt;
  color: #444;
  margin: 0 0 18pt;
}
.pln-print-page img {
  width: 100%; height: auto;
  display: block;
  margin: 0 0 14pt;
  page-break-inside: avoid;
}
.pln-print-page p {
  margin: 0 0 10pt;
  max-width: 100%;
}
.pln-print-page em { font-style: italic; }
.pln-print-page a {
  color: #000;
  text-decoration: none;
  border-bottom: 1px solid #999;
}
.pln-print-page .pln-print-foot {
  border-top: 1px solid #999;
  padding-top: 8pt;
  margin-top: 24pt;
  font-size: 9.5pt;
  color: #444;
  display: flex; justify-content: space-between;
}
.pln-print-marker {
  background: #1c1c1c;
  color: #fff;
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 8px 14px;
  display: flex; justify-content: space-between;
}
`;

function Round2Styles() { return <style dangerouslySetInnerHTML={{ __html: R2_CSS }} />; }

/* ──────────── LIGHTBOX ──────────── */

function PlainLightboxDemo() {
  // Renders the photo page underneath, then the lightbox overlay on top.
  return (
    <div className="pln-doc" style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <PlainStyles />
      <Round2Styles />
      <PlainNav />
      <div style={{ filter: "blur(2px)", pointerEvents: "none" }}>
        <main className="pln-main">
          <div className="pln-pnav-up"><a href="#">← Midras (Rolling Stone Tomb)</a></div>
          <div className="pln-pnav">
            <a href="#">‹ Previous</a>
            <span className="pln-pnav-center">2 of 8</span>
            <a href="#">Next ›</a>
          </div>
          <div className="pln-photopage">
            <div className="pln-photo-main">
              <img src={r2PHOTO.image} alt="" />
            </div>
            <div />
          </div>
        </main>
      </div>
      {/* Lightbox overlay */}
      <div className="pln-overlay" role="dialog" aria-modal="true" aria-label="Photo lightbox">
        <button className="pln-overlay-close" aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </button>
        <img className="pln-lightbox-img" src={r2PHOTO.image} alt={r2PHOTO.title} />
        <div className="pln-lightbox-cap">
          <strong>{r2PHOTO.title}</strong>
          ID: {r2PHOTO.id} · © Carl Rasmussen · Press <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 2, fontFamily: "ui-monospace", fontSize: 11 }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}

/* ──────────── DOWNLOAD MODAL ──────────── */

function PlainDownloadModalDemo() {
  return (
    <div className="pln-doc" style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <PlainStyles />
      <Round2Styles />
      <PlainNav />
      <div style={{ filter: "blur(2px)", pointerEvents: "none" }}>
        <main className="pln-main">
          <div className="pln-pnav-up"><a href="#">← Midras (Rolling Stone Tomb)</a></div>
          <div className="pln-photopage">
            <div className="pln-photo-main">
              <img src={r2PHOTO.image} alt="" />
            </div>
            <div className="pln-photo-side">
              <h1 className="pln-h1">{r2PHOTO.title}</h1>
            </div>
          </div>
        </main>
      </div>
      <div className="pln-overlay" role="dialog" aria-modal="true" aria-labelledby="dl-title">
        <button className="pln-overlay-close" aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </button>
        <div className="pln-modal">
          <p className="pln-modal-eyebrow">Permission to use</p>
          <h2 id="dl-title">Before you download</h2>
          <p>
            All photographs on HolyLandPhotos.org are the property of Dr. Carl Rasmussen and are
            provided <strong>free for non-commercial use</strong> — sermons, lessons, slides,
            personal study, and academic work.
          </p>
          <p>
            Please credit <em>HolyLandPhotos.org</em> when you use a photograph. For commercial
            licensing or print reproduction, please{" "}
            <a href="/pages/permission-to-use" style={{ color: "var(--link)" }}>read our permission policy</a>.
          </p>
          <div className="pln-modal-actions">
            <button className="pln-btn-secondary" type="button">Cancel</button>
            <button className="pln-btn-primary" type="button">
              <Icon name="download" size={15} stroke="#fff" />
              I agree — Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────── MOBILE HAMBURGER DRAWER ──────────── */

function MobileDrawerDemo() {
  return (
    <div className="mpln" style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <MPlainStyles />
      <Round2Styles />
      <MPlainNav />
      <main className="mpln-main" style={{ filter: "blur(1px)", pointerEvents: "none" }}>
        <p className="mpln-home-intro">
          Free, high-resolution photographs of biblical and archaeological sites…
        </p>
        <h2 className="mpln-h2" style={{ marginTop: 0 }}>Browse</h2>
        <ul className="mpln-list">
          <li><a href="#">Atlas Images</a></li>
          <li><a href="#">Browse by Countries</a></li>
        </ul>
      </main>
      <div className="mpln-drawer-overlay" />
      <div className="mpln-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
        <div className="mpln-drawer-head">
          <span className="mpln-drawer-brand">HolyLandPhotos</span>
          <button className="mpln-drawer-close" aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
          </button>
        </div>
        <div className="mpln-drawer-section">
          <span className="mpln-drawer-label">Search</span>
          <a className="mpln-drawer-link" href="#">Search photos</a>
          <a className="mpln-drawer-link" href="#">AI Search</a>
        </div>
        <div className="mpln-drawer-section">
          <span className="mpln-drawer-label">Archive</span>
          <a className="mpln-drawer-link" href="#">Browse by Countries</a>
          <a className="mpln-drawer-link" href="#">Daily Life and Artifacts</a>
          <a className="mpln-drawer-link" href="#">Museums of the World</a>
          <a className="mpln-drawer-link" href="#">Complete Site List</a>
        </div>
        <div className="mpln-drawer-section">
          <span className="mpln-drawer-label">About</span>
          <a className="mpln-drawer-link" href="#">About this Site</a>
          <a className="mpln-drawer-link" href="#">Permission to Use</a>
          <a className="mpln-drawer-link" href="#">News</a>
          <a className="mpln-drawer-link" href="#">Newsletter</a>
          <a className="mpln-drawer-link" href="#">Feedback</a>
        </div>
        <div className="mpln-drawer-foot">© 1995–2026 Dr. Carl Rasmussen</div>
      </div>
    </div>
  );
}

/* ──────────── AI SEARCH FULL PAGE ──────────── */

const AI_RECENT = [
  { q: "Where did Paul preach in Athens?", elapsed: "1.2s" },
  { q: "What is a Rolling Stone Tomb?", elapsed: "1.6s" },
  { q: "Photos of the Temple Mount", elapsed: "0.9s" },
  { q: "Sites mentioned in Acts", elapsed: "2.1s" },
];

const AI_DEMO_THREAD = [
  { role: "user", content: "Where did Abraham settle on his way from Ur?" },
  {
    role: "assistant",
    content:
      "Abraham (then Abram) stopped and settled at **Haran** for a period on his way from Ur of the Chaldees to the land of Canaan, as described in [Genesis 11–12](/browse/haran).\n\nHaran sits on an open plain in modern southern Turkey, about 28 miles south-southeast of Sanliurfa. It was a key node on the trade route from Nineveh to the ford at Carchemish.\n\nA few related sites in the archive:\n\n* [Haran](/browse/haran) — the main site, with 18 photos including the beehive houses, the Grand Mosque, and the Aleppo Gate.\n* [Sanliurfa](/browse/sanliurfa) — traditionally identified with Ur of the Chaldees in some traditions.\n* [Carchemish](/browse/carchemish) — the Euphrates crossing west of Haran.",
    duration: "1.4",
  },
];

function PlainAISearchPage() {
  return (
    <div className="pln-doc">
      <PlainStyles />
      <Round2Styles />
      <PlainNav />
      <main className="pln-main">
        <nav className="pln-crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span className="pln-sep">›</span> <span className="pln-current">AI Search</span>
        </nav>

        <div className="pln-aip-hero">
          <h1>AI Search</h1>
          <p>
            Ask plain-English questions about biblical sites, archaeology, or the archive
            itself. The assistant is grounded in Dr. Rasmussen's catalog and will link you to
            specific sites and photos when relevant.
          </p>
          <p className="pln-aip-disclaimer">
            <strong style={{ color: "var(--ink)" }}>About these answers.</strong> Powered by
            Claude AI. The assistant can make mistakes and is not a substitute for primary
            sources. For scholarly work, verify any factual claims independently.
          </p>
        </div>

        <div className="pln-aip-main">
          <div className="pln-aip-thread-wrap">
            <div className="pln-aip-input-wrap">
              <div className="pln-ai-input">
                <input type="text" placeholder="Ask a follow-up…" aria-label="Ask the archive" />
                <button type="button">Ask</button>
              </div>
            </div>

            <div className="pln-aip-thread">
              {AI_DEMO_THREAD.map((m, i) => (
                <div key={i} className={`pln-ai-msg pln-ai-msg-${m.role}`}>
                  {m.role === "user" ? (
                    <div className="pln-ai-user-bubble">{m.content}</div>
                  ) : (
                    <div>
                      <div className="pln-ai-assistant-tag">Holy Land Photos · AI</div>
                      <MarkdownText text={m.content} className="pln-ai-md" />
                      <div className="pln-ai-foot">— answered in {m.duration}s</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <aside className="pln-aip-side" aria-label="Recent questions">
            <h3>Recent questions</h3>
            <ul>
              {AI_RECENT.map((r, i) => (
                <li key={i}>
                  <a href="#">{r.q}</a>
                  <div className="pln-aip-counter">{r.elapsed}</div>
                </li>
              ))}
            </ul>
            <h3>Try asking</h3>
            <ul>
              <li><a href="#">Where did Abraham settle?</a></li>
              <li><a href="#">Roman ruins in Turkey</a></li>
              <li><a href="#">Photos for a sermon on the resurrection</a></li>
              <li><a href="#">Sites along the Sea of Galilee</a></li>
            </ul>
          </aside>
        </div>
      </main>
      <PlainFooter />
    </div>
  );
}

/* ──────────── NEWSLETTER ──────────── */

function PlainNewsletter({ state = "idle" }) {
  return (
    <div className="pln-doc">
      <PlainStyles />
      <Round2Styles />
      <PlainNav />
      <main className="pln-main">
        <nav className="pln-crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span className="pln-sep">›</span> <span className="pln-current">Newsletter</span>
        </nav>
        <h1 className="pln-h1">Newsletter</h1>
        <div className="pln-nl">
          <p className="pln-nl-blurb">
            Get a short email when Dr. Rasmussen adds new photographs, posts a new
            <em> Site of the Week</em>, or publishes news from the field.
            About one email a month. No marketing — just the archive.
          </p>

          {state === "success" ? (
            <div className="pln-nl-success">
              <h3>You're subscribed.</h3>
              <p>
                Thanks — we sent a confirmation to <strong>peter@example.com</strong>.
                Click the link in that email to confirm your subscription.
              </p>
            </div>
          ) : (
            <form>
              <div className="pln-nl-field">
                <label className="pln-nl-label" htmlFor="email">
                  Email address <span className="pln-nl-req">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={"pln-nl-input pln-nl-input--email" + (state === "error" ? " pln-nl-input--error" : "")}
                  defaultValue={state === "error" ? "not-an-email" : ""}
                  placeholder="your.name@example.com"
                />
                {state === "error" ? (
                  <p className="pln-nl-error">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>
                    Please enter a valid email address.
                  </p>
                ) : (
                  <p className="pln-nl-help">We'll send a confirmation email — click the link to subscribe.</p>
                )}
              </div>
              <div className="pln-nl-field">
                <label className="pln-nl-label" htmlFor="fname">
                  First name <span className="pln-nl-opt">— optional</span>
                </label>
                <input id="fname" type="text" className="pln-nl-input" />
              </div>
              <div className="pln-nl-field">
                <label className="pln-nl-label" htmlFor="lname">
                  Last name <span className="pln-nl-opt">— optional</span>
                </label>
                <input id="lname" type="text" className="pln-nl-input" />
              </div>
              <div className="pln-nl-submit-row">
                <button type="submit" className="pln-nl-submit" disabled={state === "loading"}>
                  {state === "loading" ? "Subscribing…" : "Subscribe"}
                </button>
                <span className="pln-nl-privacy">
                  We never share your address. Unsubscribe any time with one click.
                </span>
              </div>
            </form>
          )}
        </div>
      </main>
      <PlainFooter />
    </div>
  );
}

/* ──────────── PRINT PREVIEW ──────────── */

function PlainPrintPreview() {
  const p = r2PHOTO;
  return (
    <div style={{ height: "100%", background: "#e8e6e0", display: "flex", flexDirection: "column" }}>
      <Round2Styles />
      <div className="pln-print-marker">
        <span>Print preview · /photos/{p.id}</span>
        <span>Letter · portrait · 0.75″ margins</span>
      </div>
      <div style={{ padding: "32px", overflow: "auto" }}>
        <div className="pln-print-page" style={{ maxWidth: "8.5in", margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
          <h1>{p.title}</h1>
          <p className="pln-print-section">From Midras (Rolling Stone Tomb)</p>
          <img src={p.image} alt={p.title} />
          <p>
            View looking east from above. The outer courtyard of the tomb is visible in the
            lower center of the picture. It is an area 12 × 12 ft. [3.7 × 3.7 m.] carved into
            the soft solid rock, lined with hewn stones, which were then plastered and painted.
            At the east end of the courtyard the entrance to the tomb is visible.
          </p>
          <p>
            For a detail of the entrance and the <em>rolling stone</em>{" "}
            <a href="#">see photo ICSHMD20</a>.
          </p>
          <p>
            For a map and descriptive commentary about the site{" "}
            <a href="#">see the site page</a>.
          </p>
          <div className="pln-print-foot">
            <span>Source: holylandphotos.org/photos/{p.id}</span>
            <span>© Carl Rasmussen</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PlainLightboxDemo, PlainDownloadModalDemo,
  MobileDrawerDemo,
  PlainAISearchPage,
  PlainNewsletter,
  PlainPrintPreview,
});
