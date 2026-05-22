export const S3_BASE = 'https://photos.holylandphotos.org'

type PhotoLike = { filename?: string | null; imageId?: string | null }

// `filename` is the actual S3 object key. Legacy photos happen to follow
// `${imageId}.jpg` by convention, but Payload uploads can land with any
// filename — so trust the DB. The fallback covers the rare case where
// the field is somehow missing.
export function photoSrc(photo: PhotoLike): string {
  const key = photo.filename || (photo.imageId ? `${photo.imageId}.jpg` : '')
  return `${S3_BASE}/${key}`
}
