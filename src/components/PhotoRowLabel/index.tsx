'use client'
import React, { useEffect, useState } from 'react'
import { useRowLabel } from '@payloadcms/ui'
import { photoSrc } from '@/lib/photoSrc'

export const PhotoRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ photo?: { title?: string; imageId?: string; filename?: string | null } | number | string }>()
  const [title, setTitle] = useState('')
  const [imageId, setImageId] = useState('')
  const [filename, setFilename] = useState<string | null>(null)

  // photo can be a populated object or just an ID (number/string)
  const photoVal = data?.photo
  const photoId = typeof photoVal === 'object' && photoVal ? undefined : photoVal

  useEffect(() => {
    if (typeof photoVal === 'object' && photoVal) {
      setTitle(photoVal.title || '')
      setImageId(photoVal.imageId || '')
      setFilename(photoVal.filename ?? null)
      return
    }
    if (!photoId) return
    fetch(`/api/photos/${photoId}?depth=0`)
      .then((r) => r.json())
      .then((d) => {
        setTitle(d.title || '')
        setImageId(d.imageId || '')
        setFilename(d.filename ?? null)
      })
      .catch(() => {})
  }, [photoId, photoVal])

  if (!title && !imageId) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {imageId && (
        <img
          src={photoSrc({ imageId, filename })}
          alt=""
          style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 2 }}
        />
      )}
      <span>{title}</span>
    </div>
  )
}
