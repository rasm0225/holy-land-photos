import type { CollectionConfig } from 'payload'

export const Photos: CollectionConfig = {
  slug: 'photos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['imageId', 'title', 'updatedAt'],
  },
  upload: {
    mimeTypes: ['image/*'],
    staticDir: process.env.VERCEL ? '/tmp/photos' : 'photos',
  },
  fields: [
    {
      name: 'imageId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique photo identifier (e.g. DLPLTROL01)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Photo comments and scholarly description',
      },
    },
    {
      name: 'keywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'sections',
      type: 'join',
      collection: 'section-photos',
      on: 'photo',
      admin: {
        description: 'Sections this photo appears in',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Internal notes (not shown on public site)',
      },
    },
  ],
}
