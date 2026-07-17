import React from 'react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { photoSrc } from '@/lib/photoSrc'

// Renders Lexical `upload` nodes that reference the photos collection.
// The default converter expects an upload-enabled collection with a `url`
// field; our photos live on S3 keyed by filename/imageId instead, so we
// build the CDN URL with photoSrc(). Requires the page to fetch with
// depth >= 1 — at depth 0 the node's `value` is a bare ID and there is
// nothing to render.
//
// Unpublished photos are skipped: the `published` flag hides a photo
// everywhere on the public site, including rich-text embeds. Publish the
// referenced photo in /admin to make an embed appear.
export const richTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    if (node.relationTo !== 'photos' || typeof node.value !== 'object' || !node.value) {
      return null
    }
    const photo = node.value as {
      imageId?: string
      filename?: string | null
      title?: string
      width?: number | null
      height?: number | null
      published?: boolean
    }
    if (photo.published === false) {
      return null
    }
    return (
      // Plain <img> to match how imported htmlDescription bodies render
      // their inline images.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoSrc(photo)}
        alt={photo.title ?? ''}
        width={photo.width ?? undefined}
        height={photo.height ?? undefined}
        style={{ maxWidth: '100%', height: 'auto' }}
        loading="lazy"
      />
    )
  },
})
