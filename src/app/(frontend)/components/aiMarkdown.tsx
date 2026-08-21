import React from 'react'

/**
 * Minimal markdown renderer for AI assistant replies — handles
 * [text](url) links, **bold**, headings, and paragraphs.
 *
 * Extracted from AISearchChat so the search page's zero-result fallback
 * can render answers without a fourth copy of this function. (Three
 * copies still exist, in AskTheArchive and FloatingAISearch — they have
 * drifted apart and unifying them is a separate job.)
 *
 * Link targeting is decided HERE rather than left to
 * ExternalLinkHandler, for two reasons:
 *   1. That handler runs once per navigation, in a useEffect. AI replies
 *      arrive seconds later, so links inside them are never processed.
 *   2. It also skips any anchor that already has target="_blank", which
 *      is what the previous inline renderer hardcoded on every link —
 *      so internal photo links were opening in new tabs, against the
 *      documented rule.
 *
 * The rule implemented below matches ExternalLinkHandler's docblock:
 * external links open in a new tab, internal links stay in the same tab.
 */

function isExternal(href: string): boolean {
  if (!href.startsWith('http')) return false
  if (typeof window === 'undefined') return true
  return !href.startsWith(window.location.origin)
}

export function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Combined regex: links, bold, line breaks
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+?)\*\*|\n/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index))
    if (m[1] && m[2]) {
      const href = m[2]
      const external = isExternal(href)
      parts.push(
        <a
          key={key++}
          href={href}
          style={{ color: 'var(--link)' }}
          {...(external ? { target: '_blank', rel: 'noopener' } : {})}
        >
          {m[1]}
        </a>,
      )
    } else if (m[3]) {
      // Bold — recursively render so nested links/formatting work
      parts.push(<strong key={key++}>{renderInline(m[3])}</strong>)
    } else if (m[0] === '\n') {
      parts.push(<br key={key++} />)
    }
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts
}

export function renderMarkdown(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => {
    const h3Match = /^###\s+(.+)$/.exec(para)
    if (h3Match) {
      return (
        <h3 key={pi} style={{ fontSize: '1rem', fontWeight: 600, margin: '0.75rem 0 0.4rem 0' }}>
          {renderInline(h3Match[1])}
        </h3>
      )
    }
    const h2Match = /^##\s+(.+)$/.exec(para)
    if (h2Match) {
      return (
        <h2 key={pi} style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1rem 0 0.5rem 0' }}>
          {renderInline(h2Match[1])}
        </h2>
      )
    }
    const h1Match = /^#\s+(.+)$/.exec(para)
    if (h1Match) {
      return (
        <h2 key={pi} style={{ fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>
          {renderInline(h1Match[1])}
        </h2>
      )
    }
    return (
      <p key={pi} style={{ margin: '0 0 0.75rem 0' }}>
        {renderInline(para)}
      </p>
    )
  })
}
