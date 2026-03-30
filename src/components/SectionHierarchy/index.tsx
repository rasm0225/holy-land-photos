import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'

type SectionDoc = {
  id: number
  title: string
  parent?: number | null
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
        paddingLeft: depth > 0 ? '24px' : '0',
        margin: 0,
      }}
    >
      {children.map((section) => (
        <li key={section.id} style={{ padding: '3px 0' }}>
          <a
            href={`/admin/collections/sections/${section.id}`}
            style={{
              color: 'var(--theme-elevation-800)',
              textDecoration: 'none',
              fontSize: '14px',
              lineHeight: '1.4',
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
      ))}
    </ul>
  )
}

export default async function SectionHierarchyView({}: AdminViewServerProps) {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'sections',
    limit: 0,
    depth: 0,
    sort: 'title',
    select: {
      title: true,
      parent: true,
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
      parent: parentId,
    })
  }

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '900px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '8px',
          color: 'var(--theme-elevation-1000)',
        }}
      >
        Section Hierarchy
      </h1>
      <p
        style={{
          marginBottom: '24px',
          color: 'var(--theme-elevation-500)',
          fontSize: '14px',
        }}
      >
        {docs.length} sections
      </p>
      <TreeBranch parentId={null} childrenMap={childrenMap} depth={0} />
    </div>
  )
}
