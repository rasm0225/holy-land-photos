'use client'
import React from 'react'

export const SearchLogsNavLink: React.FC = () => {
  return (
    <a
      href="/admin/search-logs"
      style={{
        display: 'block',
        padding: '4px 16px',
        color: 'var(--theme-elevation-600)',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      Search Logs
    </a>
  )
}
