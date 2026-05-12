// shared.jsx — tiny helpers for both visual directions.

// Render an array of "runs": strings, {link, href}, {bold}, {italic}.
// Returns an array (no Fragment wrapper — the editor injects data-om-id on
// every JSX element and Fragments choke on it).
function Runs({ runs, linkClass }) {
  if (!Array.isArray(runs)) runs = [runs];
  return runs.map((r, i) => {
    if (r == null) return null;
    if (typeof r === "string") return <span key={i}>{r}</span>;
    if (r.link) return (
      <a key={i} href={r.href || "#"} className={linkClass}>{r.link}</a>
    );
    if (r.bold) return <strong key={i}>{r.bold}</strong>;
    if (r.italic) return <em key={i}>{r.italic}</em>;
    return null;
  });
}

// Render a list of paragraphs (each is {type, runs}).
function Paragraphs({ blocks, linkClass, pClass }) {
  return blocks.map((b, i) => (
    <p key={i} className={pClass}>
      <Runs runs={b.runs} linkClass={linkClass} />
    </p>
  ));
}

// Minimal inline icons (used sparingly — chevron, search, etc.).
function Icon({ name, size = 16, stroke = "currentColor" }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke, strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": "true",
  };
  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common}>
          <path d="m15 6-6 6 6 6" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v12" />
          <path d="m6 12 6 6 6-6" />
          <path d="M5 21h14" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    case "expand":
      return (
        <svg {...common}>
          <path d="M4 9V4h5" />
          <path d="M20 9V4h-5" />
          <path d="M4 15v5h5" />
          <path d="M20 15v5h-5" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M7 7h10v10" />
          <path d="m7 17 10-10" />
        </svg>
      );
    default:
      return null;
  }
}

Object.assign(window, { Runs, Paragraphs, Icon });
