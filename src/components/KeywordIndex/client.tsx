'use client'
import React, { useState, useMemo } from 'react'

type KeywordEntry = {
  keyword: string
  sectionCount: number
  photoCount: number
  sections: { id: number; title: string }[]
  photos: { id: number; title: string }[]
}

export const KeywordIndexClient: React.FC<{ keywords: KeywordEntry[] }> = ({ keywords }) => {
  const [filter, setFilter] = useState('')
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!filter) return keywords
    const lower = filter.toLowerCase()
    return keywords.filter((k) => k.keyword.includes(lower))
  }, [keywords, filter])

  return (
    <div>
      <input
        type="text"
        placeholder="Filter keywords..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '4px',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-elevation-800)',
          marginBottom: '16px',
          outline: 'none',
        }}
      />
      <p
        style={{
          fontSize: '12px',
          color: 'var(--theme-elevation-400)',
          marginBottom: '12px',
        }}
      >
        Showing {filtered.length} of {keywords.length} keywords
      </p>
      <div>
        {filtered.map((entry) => {
          const isExpanded = expandedKeyword === entry.keyword
          const total = entry.sectionCount + entry.photoCount
          return (
            <div
              key={entry.keyword}
              style={{
                borderBottom: '1px solid var(--theme-elevation-100)',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedKeyword(isExpanded ? null : entry.keyword)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--theme-elevation-800)',
                  textAlign: 'left',
                }}
              >
                <span>{entry.keyword}</span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--theme-elevation-400)',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                >
                  {total} {total === 1 ? 'item' : 'items'}
                </span>
              </button>
              {isExpanded && (
                <div
                  style={{
                    padding: '0 4px 12px 16px',
                    fontSize: '13px',
                  }}
                >
                  {entry.sections.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--theme-elevation-500)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px',
                        }}
                      >
                        Sections ({entry.sectionCount})
                      </div>
                      {entry.sections.map((s) => (
                        <div key={s.id} style={{ padding: '2px 0' }}>
                          <a
                            href={`/admin/collections/sections/${s.id}`}
                            style={{
                              color: 'var(--theme-elevation-800)',
                              textDecoration: 'none',
                            }}
                          >
                            {s.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {entry.photos.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--theme-elevation-500)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px',
                        }}
                      >
                        Photos ({entry.photoCount})
                      </div>
                      {entry.photos.map((p) => (
                        <div key={p.id} style={{ padding: '2px 0' }}>
                          <a
                            href={`/admin/collections/photos/${p.id}`}
                            style={{
                              color: 'var(--theme-elevation-800)',
                              textDecoration: 'none',
                            }}
                          >
                            {p.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p style={{ color: 'var(--theme-elevation-400)', padding: '20px 0' }}>
            No keywords match &ldquo;{filter}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
