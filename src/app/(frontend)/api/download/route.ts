import { NextRequest, NextResponse } from 'next/server'

const S3_BASE = 'https://photos.holylandphotos.org'

export async function GET(req: NextRequest) {
  const imageId = req.nextUrl.searchParams.get('id')
  if (!imageId || !/^[A-Za-z0-9_-]+$/.test(imageId)) {
    return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 })
  }

  const title = req.nextUrl.searchParams.get('title') || ''
  const s3Url = `${S3_BASE}/${imageId}.jpg`

  // Build a clean filename: TWCSEP02-Library-of-Celsus.jpg
  let filename = imageId
  if (title) {
    const cleanTitle = title
      .replace(/[^\w\s-]/g, '')   // remove special chars
      .replace(/\s+/g, '-')       // spaces to hyphens
      .replace(/-+/g, '-')        // collapse multiple hyphens
      .replace(/^-|-$/g, '')      // trim hyphens
      .slice(0, 80)               // cap length
    if (cleanTitle) {
      filename = `${imageId}-${cleanTitle}`
    }
  }
  filename += '.jpg'

  // Fetch from S3 and stream back with Content-Disposition header
  const s3Response = await fetch(s3Url)
  if (!s3Response.ok) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  return new NextResponse(s3Response.body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': s3Response.headers.get('Content-Length') || '',
    },
  })
}
