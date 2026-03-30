'use client'
import React from 'react'

export const SectionHierarchyNavLink: React.FC = () => {
  return (
    <a
      href="/admin/section-hierarchy"
      style={{
        display: 'block',
        padding: '4px 16px',
        color: 'var(--theme-elevation-600)',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      Section Hierarchy
    </a>
  )
}
