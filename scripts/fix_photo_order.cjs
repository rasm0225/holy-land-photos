#!/usr/bin/env node
/**
 * Fix photo ordering in sections to match the original site's order.
 *
 * Usage:
 *   node scripts/fix_photo_order.js /Users/peter/Downloads/Archive
 *   node scripts/fix_photo_order.js /Users/peter/Downloads/Archive --dry-run
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Load env
const envContent = fs.readFileSync('.env', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim()
})

const DB_URL = env.DATABASE_URL.replace('libsql://', 'https://') + '/v2/pipeline'
const DB_TOKEN = env.DATABASE_AUTH_TOKEN

function query(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }],
    })
    const u = new URL(DB_URL)
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: {
        Authorization: 'Bearer ' + DB_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let body = ''
      res.on('data', c => (body += c))
      res.on('end', () => {
        const parsed = JSON.parse(body)
        const result = parsed.results[0].response.result
        resolve(result.rows.map(r => r.map(c => c.value)))
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function execBatch(statements) {
  return new Promise((resolve, reject) => {
    const requests = statements.map(sql => ({ type: 'execute', stmt: { sql } }))
    requests.push({ type: 'close' })
    const data = JSON.stringify({ requests })
    const u = new URL(DB_URL)
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: {
        Authorization: 'Bearer ' + DB_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let body = ''
      res.on('data', c => (body += c))
      res.on('end', () => resolve(JSON.parse(body)))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function readCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8').replace(/^\uFEFF/, '')
  const lines = content.split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim())
    const obj = {}
    headers.forEach((h, i) => (obj[h] = vals[i] || ''))
    return obj
  })
}

async function main() {
  const archiveDir = process.argv[2]
  const dryRun = process.argv.includes('--dry-run')

  if (!archiveDir) {
    console.log('Usage: node scripts/fix_photo_order.js /path/to/Archive [--dry-run]')
    process.exit(1)
  }

  // Read CSV
  const isPath = path.join(archiveDir, 'dbo.holylandphotos_IS.csv')
  console.log('Loading CSV...')
  const isRows = readCSV(isPath)
  console.log(`  ${isRows.length} image-section links`)

  // Build correct order per section (sorted by is_ID)
  const sectionOrder = {}
  for (const row of isRows) {
    const isId = parseInt(row.is_ID)
    const imageId = row.is_Image_ID
    const sectionId = row.is_Section_ID
    if (!imageId || !sectionId) continue
    if (!sectionOrder[sectionId]) sectionOrder[sectionId] = []
    sectionOrder[sectionId].push({ isId, imageId })
  }
  for (const sid of Object.keys(sectionOrder)) {
    sectionOrder[sid].sort((a, b) => a.isId - b.isId)
  }
  console.log(`  ${Object.keys(sectionOrder).length} sections with photos`)

  // Get photo ID mapping from DB
  console.log('Loading photos from database...')
  const photoRows = await query('SELECT id, image_id FROM photos')
  const imageToDbId = {}
  for (const [id, imageId] of photoRows) {
    imageToDbId[imageId] = id
  }
  console.log(`  ${photoRows.length} photos`)

  // Get current sections_photos rows
  console.log('Loading sections_photos...')
  const spRows = await query('SELECT id, _parent_id, photo_id FROM sections_photos')
  const rowMap = {}
  for (const [id, parentId, photoId] of spRows) {
    rowMap[`${parentId}:${photoId}`] = id
  }
  console.log(`  ${spRows.length} links`)

  // Generate updates
  const updates = []
  let sectionsFixed = 0

  for (const [sectionId, photos] of Object.entries(sectionOrder)) {
    let hasUpdates = false
    for (let i = 0; i < photos.length; i++) {
      const newOrder = i + 1
      const dbPhotoId = imageToDbId[photos[i].imageId]
      if (!dbPhotoId) continue
      const rowId = rowMap[`${sectionId}:${dbPhotoId}`]
      if (!rowId) continue
      updates.push(
        `UPDATE sections_photos SET _order = ${newOrder} WHERE id = '${rowId}'`
      )
      hasUpdates = true
    }
    if (hasUpdates) sectionsFixed++
  }

  console.log(`\n${updates.length} updates for ${sectionsFixed} sections`)

  if (dryRun) {
    console.log('\n--- DRY RUN (first 20) ---')
    updates.slice(0, 20).forEach(s => console.log(s))
    if (updates.length > 20) console.log(`  ... and ${updates.length - 20} more`)
    return
  }

  // Execute in batches
  const batchSize = 50
  let executed = 0
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    await execBatch(batch)
    executed += batch.length
    if (executed % 500 === 0 || executed === updates.length) {
      console.log(`  Executed ${executed}/${updates.length}...`)
    }
  }

  console.log(`\nDone. ${executed} photo orders fixed across ${sectionsFixed} sections.`)
}

main().catch(console.error)
