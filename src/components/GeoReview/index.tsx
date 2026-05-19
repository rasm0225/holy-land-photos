import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import React from 'react'
import { GeoReviewClient, type GeoSite } from './client'

type CsvRow = Record<string, string>

async function loadCsv(): Promise<Map<number, CsvRow>> {
  const filePath = path.resolve(process.cwd(), 'docs/site-geocode-enriched.csv')
  const out = new Map<number, CsvRow>()
  try {
    const text = await readFile(filePath, 'utf8')
    const lines = text.split(/\r?\n/).filter(Boolean)
    const header = parseCsvLine(lines[0])
    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i])
      const row: CsvRow = {}
      header.forEach((h, idx) => (row[h] = cells[idx] ?? ''))
      const id = parseInt(row.id, 10)
      if (!Number.isNaN(id)) out.set(id, row)
    }
  } catch {
    // CSV may not exist in prod — that's fine, alternatives just won't render
  }
  return out
}

// Tiny CSV parser that respects quoted fields (good enough for our generator output).
function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        q = false
      } else {
        cur += c
      }
    } else {
      if (c === ',') {
        out.push(cur)
        cur = ''
      } else if (c === '"') {
        q = true
      } else {
        cur += c
      }
    }
  }
  out.push(cur)
  return out
}

function stripHtml(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function GeoReviewView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props

  if (!initPageResult.req.user) {
    redirect('/admin/login')
  }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'sections',
    where: { sectionType: { equals: 'site' } },
    limit: 0,
    depth: 0,
    sort: 'title',
    select: {
      title: true,
      slug: true,
      htmlBody: true,
      latitude: true,
      longitude: true,
      geoReviewStatus: true,
      geoSource: true,
      geoNotes: true,
      breadcrumbs: true,
    },
  })

  const csv = await loadCsv()

  const sites: GeoSite[] = docs.map((d) => {
    const dd = d as unknown as Record<string, unknown>
    const csvRow = csv.get(d.id as number)
    const breadcrumbs = (dd.breadcrumbs as Array<{ label?: string; url?: string }>) || []
    const ancestry = breadcrumbs.map((b) => b.label).filter(Boolean).join(' / ')

    const current = {
      lat: typeof dd.latitude === 'number' ? (dd.latitude as number) : null,
      lon: typeof dd.longitude === 'number' ? (dd.longitude as number) : null,
      status: (dd.geoReviewStatus as string) || 'pending',
      source: (dd.geoSource as string) || '',
      notes: (dd.geoNotes as string) || '',
    }

    // Pull both candidates from the CSV so the reviewer can compare.
    const alternatives: GeoSite['alternatives'] = []
    if (csvRow) {
      if (csvRow.lat && csvRow.lon) {
        alternatives.push({
          lat: parseFloat(csvRow.lat),
          lon: parseFloat(csvRow.lon),
          source: csvRow.source || 'wikidata',
          confidence: csvRow.confidence,
          notes: csvRow.notes,
        })
      }
      if (csvRow.llm_lat && csvRow.llm_lon) {
        alternatives.push({
          lat: parseFloat(csvRow.llm_lat),
          lon: parseFloat(csvRow.llm_lon),
          source: 'llm',
          confidence: csvRow.llm_confidence,
          notes: csvRow.llm_notes,
        })
      }
    }

    return {
      id: d.id as number,
      title: d.title,
      slug: d.slug as string,
      country: csvRow?.country || '',
      ancestry,
      description: stripHtml(dd.htmlBody as string | null).slice(0, 800),
      current,
      alternatives,
    }
  })

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <GeoReviewClient sites={sites} />
    </DefaultTemplate>
  )
}
