'use client'
import React from 'react'

export const GeoReviewNavLink: React.FC = () => {
  return (
    <a
      href="/admin/geo-review"
      style={{
        display: 'block',
        padding: '4px 16px',
        color: 'var(--theme-elevation-600)',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      Geo Review
    </a>
  )
}
