import React from 'react'

export function KeywordLinks({ keywords }: { keywords: string }) {
  const tags = keywords.split(',').map((k) => k.trim()).filter(Boolean)
  if (tags.length === 0) return null

  return (
    <div style={{ fontSize: '13px', color: '#666' }}>
      <strong>Keywords: </strong>
      {tags.map((tag, i) => (
        <span key={i}>
          {i > 0 && ', '}
          <a
            href={`/keywords/${encodeURIComponent(tag)}`}
            style={{ color: '#666', textDecoration: 'underline', textDecorationColor: '#ccc', textUnderlineOffset: '2px' }}
          >
            {tag}
          </a>
        </span>
      ))}
    </div>
  )
}
