#!/usr/bin/env node
/**
 * Fix photo ordering in sections to match the original site's image_SortOrder.
 *
 * The original ASP site sorted photos by image_SortOrder from the Images table.
 * Photos without a sort order (empty) come after those with one.
 *
 * Usage:
 *   node scripts/fix_photo_order.cjs /Users/peter/Downloads/Archive
 *   node scripts/fix_photo_order.cjs /Users/peter/Downloads/Archive --dry-run
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

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += line[i]
    }
  }
  result.push(current)
  return result
}

function readCSVMultiline(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8').replace(/^\uFEFF/, '')
  const lines = []
  let currentLine = ''
  let inQ = false
  for (const char of content) {
    if (char === '"') inQ = !inQ
    if ((char === '\n' || char === '\r') && !inQ) {
      if (currentLine.trim()) lines.push(currentLine)
      currentLine = ''
    } else {
      currentLine += char
    }
  }
  if (currentLine.trim()) lines.push(currentLine)

  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => (obj[h.trim()] = (vals[i] || '').trim()))
    return obj
  })
}

function readCSVSimple(filepath) {
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
    console.log('Usage: node scripts/fix_photo_order.cjs /path/to/Archive [--dry-run]')
    process.exit(1)
  }

  // Read Images CSV (has image_SortOrder) - needs multiline parsing
  console.log('Loading Images CSV...')
  const imagesCSV = readCSVMultiline(path.join(archiveDir, 'dbo.holylandphotos_Images.csv'))
  console.log(`  ${imagesCSV.length} images`)

  // Build imageId -> sortOrder map
  const sortOrderMap = {}
  for (const row of imagesCSV) {
    const imageId = row.image_ID
    const sortOrder = row.image_SortOrder
    if (imageId) {
      sortOrderMap[imageId] = sortOrder !== '' ? parseInt(sortOrder) : 99999
    }
  }

  // Read IS CSV (image-section links)
  console.log('Loading IS CSV...')
  const isCSV = readCSVSimple(path.join(archiveDir, 'dbo.holylandphotos_IS.csv'))
  console.log(`  ${isCSV.length} links`)

  // Build section -> images list with sort orders
  const sectionPhotos = {}
  for (const row of isCSV) {
    const sectionId = row.is_Section_ID
    const imageId = row.is_Image_ID
    if (!sectionId || !imageId) continue
    if (!sectionPhotos[sectionId]) sectionPhotos[sectionId] = []
    const sortOrder = sortOrderMap[imageId] !== undefined ? sortOrderMap[imageId] : 99999
    sectionPhotos[sectionId].push({ imageId, sortOrder })
  }

  // Sort each section's photos by sortOrder
  for (const sid of Object.keys(sectionPhotos)) {
    sectionPhotos[sid].sort((a, b) => a.sortOrder - b.sortOrder)
  }
  console.log(`  ${Object.keys(sectionPhotos).length} sections`)

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

  for (const [sectionId, photos] of Object.entries(sectionPhotos)) {
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
    // Verify plutonium
    console.log('\n--- Hierapolis Plutonium expected order ---')
    const plPhotos = sectionPhotos['3766'] || []
    plPhotos.forEach((p, i) => console.log(`  ${i + 1}. ${p.imageId} (sortOrder: ${p.sortOrder})`))

    console.log('\n--- DRY RUN (first 20 updates) ---')
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
