import type { CollectionConfig } from 'payload'

export const Photos: CollectionConfig = {
  slug: 'photos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['imageId', 'title', 'updatedAt'],
    listSearchableFields: ['imageId', 'title', 'keywords'],
    preview: (doc) => {
      if (doc?.imageId) {
        return `/photos/${doc.imageId as string}`
      }
      return null
    },
  },
  // Note: Photos are served from S3 by imageId, not through Payload's upload system.
  // Upload was removed to allow editing metadata without re-uploading files.
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
      name: 'photographer',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Name of the photographer (defaults to Dr. Carl Rasmussen if empty)',
      },
    },
    {
      name: 'year',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Year the photo was taken',
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
