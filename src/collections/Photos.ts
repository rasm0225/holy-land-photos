import type { CollectionConfig } from 'payload'

export const Photos: CollectionConfig = {
  slug: 'photos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['imageId', 'title', 'updatedAt'],
  },
  upload: {
    mimeTypes: ['image/*'],
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
      type: 'text',
      admin: {
        components: {
          Field: '/src/components/KeywordTagInput/index.tsx#KeywordTagInput',
        },
      },
    },
    {
      name: 'internalKeywords',
      type: 'text',
      label: 'Internal Keywords',
      admin: {
        description: 'Not shown on the public site — for search and organization only',
        components: {
          Field: '/src/components/KeywordTagInput/index.tsx#KeywordTagInput',
        },
      },
    },
    {
      name: 'htmlDescription',
      type: 'textarea',
      admin: {
        description: 'Imported HTML content (read-only, will be migrated to rich text)',
        condition: (data) => Boolean(data?.htmlDescription),
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
