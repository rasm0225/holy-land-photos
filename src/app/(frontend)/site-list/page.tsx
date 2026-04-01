import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complete Site List',
  description: 'Browse all 612+ biblical and archaeological sites organized by region and country.',
  openGraph: {
    title: 'Complete Site List — Holy Land Photos',
    description: 'Browse all 612+ biblical and archaeological sites organized by region and country.',
    type: 'website',
  },
}

type SectionDoc = {
  id: number
  title: string
  slug: string
  parent: number | null
  sectionType: string | null
}

function TreeBranch({
  parentId,
  childrenMap,
  depth,
}: {
  parentId: number | null
  childrenMap: Map<number | null, SectionDoc[]>
  depth: number
}) {
  const children = childrenMap.get(parentId) ?? []
  if (children.length === 0) return null

  return (
    <ul
      style={{
        listStyle: 'none',
        paddingLeft: depth > 0 ? '20px' : '0',
        margin: 0,
      }}
    >
      {children.map((section) => {
        const hasChildren = (childrenMap.get(section.id) ?? []).length > 0
        return (
          <li key={section.id} style={{ padding: '2px 0' }}>
            <a
              href={`/browse/${section.slug}`}
              style={{
                textDecoration: 'none',
                fontSize: '14px',
                lineHeight: '1.5',
                fontWeight: hasChildren && depth < 2 ? 600 : 400,
              }}
            >
              {section.title}
            </a>
            <TreeBranch
              parentId={section.id}
              childrenMap={childrenMap}
              depth={depth + 1}
            />
          </li>
        )
      })}
    </ul>
  )
}

export default async function SiteListPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'sections',
    limit: 0,
    depth: 0,
    sort: 'title',
    select: {
      title: true,
      slug: true,
      parent: true,
      sectionType: true,
    },
  })

  const allIds = new Set(docs.map((d) => d.id))
  const childrenMap = new Map<number | null, SectionDoc[]>()

  for (const doc of docs) {
    const rawParent = (doc.parent as number) ?? null
    const parentId = rawParent !== null && allIds.has(rawParent) ? rawParent : null
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, [])
    childrenMap.get(parentId)!.push({
      id: doc.id as number,
      title: doc.title,
      slug: doc.slug,
      parent: parentId,
      sectionType: doc.sectionType ?? null,
    })
  }

  const siteCount = docs.filter((d) => d.sectionType === 'site').length

  return (
    <div>
      <nav style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        <a href="/">Home</a>
        {' / '}
        <strong>Complete Site List</strong>
      </nav>

      <h1>Complete Site List</h1>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        {docs.length} sections &middot; {siteCount} sites
      </p>

      <TreeBranch parentId={null} childrenMap={childrenMap} depth={0} />
    </div>
  )
}
