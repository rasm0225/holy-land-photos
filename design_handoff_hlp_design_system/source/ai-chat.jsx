// ai-chat.jsx — AI search chat component.
// Lives on the homepage as a featured section. Wired to window.claude.complete
// for real responses.

function escapeHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text) {
  let html = escapeHTML(text);
  // [label](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // **bold**
  html = html.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  // *italic*
  html = html.replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, "$1<em>$2</em>$3");
  // `code`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  return html;
}

function MarkdownText({ text, className }) {
  const blocks = (text || "").split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((raw, i) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("### "))
          return <h4 key={i} dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(4)) }} />;
        if (trimmed.startsWith("## "))
          return <h3 key={i} dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(3)) }} />;
        if (trimmed.startsWith("# "))
          return <h3 key={i} dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(2)) }} />;
        const lines = trimmed.split("\n");
        const allList = lines.length > 0 && lines.every((l) => /^\s*[*-]\s+/.test(l));
        if (allList) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li
                  key={j}
                  dangerouslySetInnerHTML={{
                    __html: renderInline(l.replace(/^\s*[*-]\s+/, "")),
                  }}
                />
              ))}
            </ul>
          );
        }
        const allOrdered = lines.length > 0 && lines.every((l) => /^\s*\d+\.\s+/.test(l));
        if (allOrdered) {
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li
                  key={j}
                  dangerouslySetInnerHTML={{
                    __html: renderInline(l.replace(/^\s*\d+\.\s+/, "")),
                  }}
                />
              ))}
            </ol>
          );
        }
        return (
          <p
            key={i}
            dangerouslySetInnerHTML={{
              __html: renderInline(trimmed.replace(/\n/g, " ")),
            }}
          />
        );
      })}
    </div>
  );
}

const AI_SYSTEM = [
  "You are a scholarly assistant for HolyLandPhotos.org, a free archive of 7,000+ photographs of biblical and archaeological sites curated by Dr. Carl Rasmussen.",
  "Answer concisely — 3-5 sentences, with a short bulleted list when it helps. Plain language; avoid emoji.",
  "When relevant, recommend specific sites or photos by linking like [Haran](/browse/haran), [Rolling Stone Tomb](/photos/ICSHMD20), [Ephesus](/browse/ephesus). Make up reasonable slugs from the site/place name. Never invent specific photo IDs (those start with letters and a number); only link to /browse/<slug>.",
  "If the user asks something outside biblical archaeology, gently steer them back to the archive's subject matter.",
].join(" ");

const AI_SUGGESTIONS = [
  "Where did Abraham settle?",
  "What is a Rolling Stone Tomb?",
  "Roman ruins in Turkey",
  "Photos for a sermon on the resurrection",
];

async function askClaude(messages) {
  // Try {system, messages} first; fall back to inlining system into first user msg.
  try {
    return await window.claude.complete({ system: AI_SYSTEM, messages });
  } catch (e1) {
    try {
      const first = messages[0];
      const stitched = [
        { ...first, content: AI_SYSTEM + "\n\n---\n\n" + first.content },
        ...messages.slice(1),
      ];
      return await window.claude.complete({ messages: stitched });
    } catch (e2) {
      throw e2;
    }
  }
}

/* ────────── Desktop component (Plain direction) ────────── */

function AISearchSection({ variant = "plain" }) {
  const ns = variant === "mobile" ? "mpln" : "pln";
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const threadRef = React.useRef(null);

  React.useEffect(() => {
    // Scroll thread to bottom when new messages arrive
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const ask = async (q) => {
    if (!q || loading) return;
    setInput("");
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setLoading(true);
    const t0 = performance.now();
    try {
      const apiMessages = next.map((m) => ({ role: m.role, content: m.content }));
      const text = await askClaude(apiMessages);
      const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
      setMessages((prev) => [...prev, { role: "assistant", content: text, duration: elapsed }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry — couldn't reach the AI right now. Please try again, or [open the full AI Search page](/ai-search).",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(input.trim());
  };

  return (
    <section className={`${ns}-ai-section`}>
      <h2 className={`${ns}-h2`}>Ask the archive</h2>
      <p className={`${ns}-ai-blurb`}>
        Have a question about a site, a Bible passage, or where to find a photo? Ask in plain English.{" "}
        <span className={`${ns}-ai-disclaimer-inline`}>
          Powered by Claude AI; verify with primary sources.
        </span>
      </p>

      <div className={`${ns}-ai-panel`}>
        <form className={`${ns}-ai-input-wrap`} onSubmit={handleSubmit}>
          <div className={`${ns}-ai-input`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={messages.length ? "Ask a follow-up…" : "Ask anything about biblical sites…"}
              aria-label="Ask the archive"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Thinking…" : "Ask"}
            </button>
          </div>
        </form>

        {messages.length === 0 && !loading && (
          <div className={`${ns}-ai-chips`}>
            <span className={`${ns}-ai-chips-label`}>Try asking</span>
            {AI_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`${ns}-ai-chip`}
                onClick={() => ask(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {(messages.length > 0 || loading) && (
          <div className={`${ns}-ai-thread`} ref={threadRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${ns}-ai-msg ${ns}-ai-msg-${m.role}`}>
                {m.role === "user" ? (
                  <div className={`${ns}-ai-user-bubble`}>{m.content}</div>
                ) : (
                  <div>
                    <div className={`${ns}-ai-assistant-tag`}>Holy Land Photos · AI</div>
                    <MarkdownText text={m.content} className={`${ns}-ai-md`} />
                    {m.duration && (
                      <div className={`${ns}-ai-foot`}>— answered in {m.duration}s</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className={`${ns}-ai-msg ${ns}-ai-msg-assistant`}>
                <div className={`${ns}-ai-assistant-tag`}>Holy Land Photos · AI</div>
                <div className={`${ns}-ai-loading`}>Searching the archive…</div>
              </div>
            )}
          </div>
        )}

        <a href="/ai-search" className={`${ns}-ai-open-full`}>
          Open the full AI Search page →
        </a>
      </div>
    </section>
  );
}

Object.assign(window, { AISearchSection, MarkdownText });
