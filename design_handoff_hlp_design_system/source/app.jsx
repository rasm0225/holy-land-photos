// app.jsx — final canvas: Direction A (Plain) + Mobile A + Favicon options.

const W = 1200;
const H_HOME = 2400;
const H_SECT = 2100;
const H_PHOTO = 1500;
const H_SEARCH = 1500;

const MW = 430;
const MH = 900;
const DEV_W = 390;
const DEV_H = 844;

function MobileFrame({ children }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f0eee9",
    }}>
      <IOSDevice width={DEV_W} height={DEV_H}>
        {children}
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="overview"
        title="HolyLandPhotos · Direction A · Plain"
        subtitle="Locked-in direction. Georgia + system sans, white surface, hairline rules, blue links. Click any artboard's expand icon to view fullscreen."
      >
        <DCArtboard id="readme" label="Read me first" width={520} height={H_HOME}>
          <ReadmeCard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="desktop"
        title="Desktop · 1200 px"
        subtitle="Breadcrumbs-only navigation on section pages."
      >
        <DCArtboard id="d-home"       label="Homepage · with AI Search"                  width={W} height={H_HOME}><PlainHome /></DCArtboard>
        <DCArtboard id="d-section"    label="Section · Haran"           width={W} height={H_SECT}><PlainSection /></DCArtboard>
        <DCArtboard id="d-photo"      label="Photo page"                width={W} height={H_PHOTO}><PlainPhoto /></DCArtboard>
        <DCArtboard id="d-search"     label="Search results"            width={W} height={H_SEARCH}><PlainSearch /></DCArtboard>
      </DCSection>

      <DCSection
        id="mobile"
        title="Mobile · 390 px"
        subtitle="iPhone frames. Single column, hamburger nav (search collapses into the icon), 2-up photo grid, 44 px hit targets."
      >
        <DCArtboard id="m-home"    label="Homepage"      width={MW} height={MH}><MobileFrame><MPlainHome /></MobileFrame></DCArtboard>
        <DCArtboard id="m-section" label="Section · Haran" width={MW} height={MH}><MobileFrame><MPlainSection /></MobileFrame></DCArtboard>
        <DCArtboard id="m-photo"   label="Photo page"    width={MW} height={MH}><MobileFrame><MPlainPhoto /></MobileFrame></DCArtboard>
        <DCArtboard id="m-search"  label="Search"        width={MW} height={MH}><MobileFrame><MPlainSearch /></MobileFrame></DCArtboard>
      </DCSection>

      <DCSection
        id="favicon"
        title="Favicon"
        subtitle='Two options at real sizes — the one set on this page (look at the browser tab above) is "H".'
      >
        <DCArtboard id="fav-h"   label='Option 1 · "H"'   width={560} height={520}>
          <FaviconPreview src="favicon-h.svg" label="H" />
        </DCArtboard>
        <DCArtboard id="fav-hlp" label='Option 2 · "HLP"' width={560} height={520}>
          <FaviconPreview src="favicon-hlp.svg" label="HLP" />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

function FaviconPreview({ src, label }) {
  const sizes = [16, 24, 32, 48, 64, 128];
  return (
    <div style={{
      padding: "36px 40px",
      fontFamily: '-apple-system, system-ui, sans-serif',
      color: "#1c1c1c",
      height: "100%",
      boxSizing: "border-box",
      background: "#fff",
    }}>
      <p style={{
        fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase",
        color: "#8a8378", margin: "0 0 6px",
      }}>Option · "{label}"</p>
      <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 600, fontSize: 24, margin: "0 0 24px" }}>
        At real rendering sizes
      </h2>

      {/* Size ladder */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 32,
        padding: "20px 16px", background: "#f7f6f3",
        border: "1px solid #e3e1dc",
      }}>
        {sizes.map((s) => (
          <div key={s} style={{ textAlign: "center" }}>
            <img src={src} width={s} height={s} style={{ display: "block", margin: "0 auto" }} alt={`${s}px`} />
            <div style={{ fontSize: 10.5, color: "#7a7a7a", marginTop: 6, letterSpacing: "0.04em" }}>{s}px</div>
          </div>
        ))}
      </div>

      {/* Browser tab mockup */}
      <p style={{
        fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#8a8378", margin: "0 0 8px",
      }}>In a browser tab</p>
      <div style={{
        background: "#dfddd6",
        padding: "6px 6px 0",
        borderRadius: "8px 8px 0 0",
      }}>
        <div style={{ display: "flex", gap: 2 }}>
          {/* Active tab — ours */}
          <div style={{
            background: "#fff",
            borderRadius: "8px 8px 0 0",
            padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#1c1c1c",
            minWidth: 200, maxWidth: 240,
          }}>
            <img src={src} width={16} height={16} alt="" />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Holy Land Photos — Free High…
            </span>
            <span style={{ marginLeft: "auto", color: "#999" }}>×</span>
          </div>
          {/* Inactive sibling tab for context */}
          <div style={{
            background: "#cdcac1",
            borderRadius: "8px 8px 0 0",
            padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#5a544c",
            minWidth: 160, maxWidth: 200,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 2, background: "#9c948a" }} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Another tab
            </span>
          </div>
        </div>
      </div>

      {/* Bookmark mockup */}
      <p style={{
        fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#8a8378", margin: "26px 0 8px",
      }}>In a bookmarks bar</p>
      <div style={{
        background: "#f3efe6",
        padding: "10px 14px",
        borderRadius: 6,
        display: "flex", gap: 22, alignItems: "center",
        fontSize: 13,
        border: "1px solid #e3e1dc",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src={src} width={16} height={16} alt="" />
          <span>Holy Land Photos</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#7a7a7a" }}>
          <div style={{ width: 16, height: 16, borderRadius: 2, background: "#c2bcb1" }} />
          <span>Other site</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#7a7a7a" }}>
          <div style={{ width: 16, height: 16, borderRadius: 2, background: "#c2bcb1" }} />
          <span>Inbox</span>
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: "#555", margin: "26px 0 0", lineHeight: 1.5 }}>
        {label === "H" ? (
          <>Single serif <strong>H</strong> in Georgia, white on near-black. Reads cleanly at 16 px — the H is fully formed with its serifs intact.</>
        ) : (
          <><strong>HLP</strong> in Georgia. More specific, but at 16 px the letters become muddy and lose their serifs. Better at 32 px+.</>
        )}
      </p>
    </div>
  );
}

function ReadmeCard() {
  return (
    <div style={{
      padding: "44px 40px",
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.55,
      color: "#1c1c1c",
      height: "100%",
      boxSizing: "border-box",
      overflow: "auto",
      background: "#fff",
    }}>
      <p style={{
        fontFamily: "-apple-system, system-ui, sans-serif",
        fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase",
        color: "#8a8378", margin: "0 0 6px",
      }}>For Peter · v3 · May 2026</p>
      <h1 style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.15, margin: "0 0 14px" }}>
        AI Search lives on the homepage now.
      </h1>
      <p style={{ margin: "0 0 14px", color: "#4a453e" }}>
        <strong>Direction A · Plain</strong> + <strong>Georgia + system sans</strong>. White
        background, near-black text, hairline rules, classic blue links. Zero web fonts loaded —
        fastest first paint, completely honest with the audience.
      </p>

      <h2 style={{ fontFamily: "-apple-system, system-ui, sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7a736a", margin: "24px 0 8px" }}>
        Changes since v2
      </h2>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><strong>AI Search</strong> is now a section on the homepage, between the Holy Week feature and Site of the Week. The chat is live — type anything and Claude will actually answer. Try it.</li>
        <li>Sidebar variant removed — breadcrumbs only.</li>
        <li>Photo grid spacing tightened, h2 rules consistent across pages.</li>
      </ul>

      <h2 style={{ fontFamily: "-apple-system, system-ui, sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7a736a", margin: "24px 0 8px" }}>
        About the AI section
      </h2>
      <p style={{ margin: "0 0 8px" }}>
        Empty state shows four suggested questions as chips — click one to fire it off. After
        the first answer, the chip row hides and the thread takes over. Each assistant reply
        renders markdown (bold, italic, lists, headers, and links into the archive like{" "}
        <a href="#" style={{ color: "#0b50a0" }}>[Haran](/browse/haran)</a>). Response time is
        shown after each reply. There's a clear escape hatch to the full <em>AI Search</em>{" "}
        page at the bottom.
      </p>

      <h2 style={{ fontFamily: "-apple-system, system-ui, sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7a736a", margin: "24px 0 8px" }}>
        Coming next
      </h2>
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        <li>Lightbox overlay + download/copyright modal</li>
        <li>News detail (gallery + body + optional YouTube embed)</li>
        <li>Newsletter signup form (with success/error states)</li>
        <li>Dedicated /ai-search full-page chat</li>
        <li>Print stylesheet</li>
      </ol>

      <p style={{ marginTop: 22, padding: "10px 14px", background: "#f7f6f3", fontSize: 14, fontFamily: "-apple-system, system-ui, sans-serif", borderLeft: "2px solid #1c1c1c" }}>
        Tip: click the <strong>⤢ expand</strong> icon on any artboard to view it fullscreen at native size — the AI chat works in expanded mode.
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
