import React from 'react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { LinkJSXConverter } from '@payloadcms/richtext-lexical/react'
import { photoSrc } from '@/lib/photoSrc'

// Resolves an "Internal Link" picked in the CMS (LinkFeature, linkType:
// 'internal') to its public URL. Without this, Payload's default link
// converter logs "internalDocToHref is not provided" and emits href="#",
// which is exactly the bug Carl hit on the Alexandria Troas section.
//
// `doc.value` is only an object when the page fetched with depth >= 1;
// at depth 0 it is a bare ID and we cannot build a URL for photos or
// sections (their URLs use imageId / slug, not the numeric ID). Every
// page that renders <RichText> must therefore fetch at depth >= 1.
type LinkDoc = {
  relationTo: string
  value: number | string | { id?: number; slug?: string; imageId?: string }
}

export function internalDocToHref({ linkNode }: { linkNode: { fields: { doc?: LinkDoc | null } } }): string {
  const doc = linkNode.fields.doc
  if (!doc) return '#'
  const v = doc.value
  const obj = typeof v === 'object' && v !== null ? v : null
  switch (doc.relationTo) {
    case 'photos':
      return obj?.imageId ? `/photos/${obj.imageId}` : '#'
    case 'sections':
      return obj?.slug ? `/browse/${obj.slug}` : '#'
    case 'pages':
      return obj?.slug ? `/pages/${obj.slug}` : '#'
    case 'news': {
      const id = obj?.id ?? (typeof v === 'object' ? undefined : v)
      return id != null ? `/news/${id}` : '#'
    }
    default:
      return '#'
  }
}

export const richTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
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
