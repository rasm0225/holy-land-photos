import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import { KeywordIndexClient } from './client'

export default async function KeywordIndexView({}: AdminViewServerProps) {
  const payload = await getPayload({ config })

  const [sections, photos] = await Promise.all([
    payload.find({
      collection: 'sections',
      limit: 0,
      depth: 0,
      select: { title: true, keywords: true, internalKeywords: true },
    }),
    payload.find({
      collection: 'photos',
      limit: 0,
      depth: 0,
      select: { title: true, keywords: true, internalKeywords: true },
    }),
  ])

  // Build keyword -> content mapping
  const keywordMap: Record<
    string,
    { sections: { id: number; title: string }[]; photos: { id: number; title: string }[] }
  > = {}

  function addKeywords(
    text: string | undefined | null,
    type: 'sections' | 'photos',
    item: { id: number; title: string },
  ) {
    if (!text) return
    const tags = text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    for (const tag of tags) {
      const lower = tag.toLowerCase()
      if (!keywordMap[lower]) {
        keywordMap[lower] = { sections: [], photos: [] }
      }
      // Use original casing from first occurrence
      keywordMap[lower][type].push(item)
    }
  }

  for (const doc of sections.docs) {
    const item = { id: doc.id as number, title: doc.title }
    addKeywords(doc.keywords as string, 'sections', item)
    addKeywords(doc.internalKeywords as string, 'sections', item)
  }

  for (const doc of photos.docs) {
    const item = { id: doc.id as number, title: doc.title }
    addKeywords(doc.keywords as string, 'photos', item)
    addKeywords(doc.internalKeywords as string, 'photos', item)
  }

  // Sort keywords alphabetically and build serializable data
  const keywords = Object.entries(keywordMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      keyword: key,
      sectionCount: data.sections.length,
      photoCount: data.photos.length,
      sections: data.sections,
      photos: data.photos,
    }))

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
        Keyword Index
      </h1>
      <p
        style={{
          marginBottom: '24px',
          color: 'var(--theme-elevation-500)',
          fontSize: '14px',
        }}
      >
        {keywords.length} unique keywords across {sections.totalDocs} sections and{' '}
        {photos.totalDocs} photos
      </p>
      <KeywordIndexClient keywords={keywords} />
    </div>
  )
}
