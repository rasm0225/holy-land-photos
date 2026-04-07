'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

export const PhotoRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ photo?: { title?: string; imageId?: string } | number }>()
  const photo = typeof data?.photo === 'object' ? data.photo : null
  const title = photo?.title || 'Untitled'
  const imageId = photo?.imageId

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
