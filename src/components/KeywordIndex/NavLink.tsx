'use client'
import React from 'react'

export const KeywordIndexNavLink: React.FC = () => {
  return (
    <a
      href="/admin/keyword-index"
      style={{
        display: 'block',
        padding: '4px 16px',
        color: 'var(--theme-elevation-600)',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      Keyword Index
    </a>
  )
}
