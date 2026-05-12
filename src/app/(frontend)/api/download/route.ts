import { NextRequest, NextResponse } from 'next/server'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

export async function GET(req: NextRequest) {
  const imageId = req.nextUrl.searchParams.get('id')
  if (!imageId || !/^[A-Za-z0-9_-]+$/.test(imageId)) {
    return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 })
  }

  const filename = `${imageId}.jpg`
  const s3Url = `${S3_BASE}/${filename}`

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
