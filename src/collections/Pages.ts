import type { CollectionConfig } from 'payload'

const formatSlug = (val: string): string =>
  val
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'display', 'updatedAt'],
    preview: (doc) => {
      if (doc?.slug) {
        return `/pages/${doc.slug as string}`
      }
      return null
    },
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data.slug) {
          data.slug = formatSlug(data.title)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from title if left blank',
      },
    },
    {
      name: 'display',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Show this page on the public site',
      },
    },
    {
      name: 'redirectUrl',
      type: 'text',
      admin: {
        description: 'Optional: redirect to this URL instead of showing page content',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'htmlBody',
      type: 'textarea',
      admin: {
        description: 'Imported HTML content (read-only, will be migrated to rich text)',
        condition: (data) => Boolean(data?.htmlBody),
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
