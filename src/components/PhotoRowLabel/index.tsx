'use client'
import React, { useEffect, useState } from 'react'
import { useRowLabel } from '@payloadcms/ui'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

export const PhotoRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ photo?: { title?: string; imageId?: string } | number | string }>()
  const [title, setTitle] = useState('')
  const [imageId, setImageId] = useState('')

  // photo can be a populated object or just an ID (number/string)
  const photoVal = data?.photo
  const photoId = typeof photoVal === 'object' && photoVal ? undefined : photoVal

  useEffect(() => {
    if (typeof photoVal === 'object' && photoVal) {
      setTitle(photoVal.title || '')
      setImageId(photoVal.imageId || '')
      return
    }
    if (!photoId) return
    fetch(`/api/photos/${photoId}?depth=0`)
      .then((r) => r.json())
      .then((d) => {
        setTitle(d.title || '')
        setImageId(d.imageId || '')
      })
      .catch(() => {})
  }, [photoId, photoVal])

  if (!title && !imageId) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {imageId && (
        <img
          src={`${S3_BASE}/${imageId}.jpg`}
          alt=""
          style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 2 }}
        />
      )}
      <span>{title}</span>
    </div>
  )
}
