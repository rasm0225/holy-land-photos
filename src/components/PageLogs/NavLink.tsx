'use client'
import React from 'react'

export const PageLogsNavLink: React.FC = () => {
  return (
    <a
      href="/admin/page-logs"
      style={{
        display: 'block',
        padding: '4px 16px',
        color: 'var(--theme-elevation-600)',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      Page Logs
    </a>
  )
}
