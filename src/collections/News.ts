import type { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'active', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Show on the public site',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'imageGallery',
      type: 'array',
      admin: {
        description: 'Photos to display in the homepage gallery for this news item',
      },
      fields: [
        {
          name: 'imageId',
          type: 'text',
          required: true,
          admin: {
            description: 'HLP Image ID (e.g. IJNTMLGN31)',
          },
        },
        {
          name: 'caption',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Optional: link to a custom URL instead of the photo page',
          },
        },
      ],
    },
    {
      name: 'htmlBody',
      type: 'textarea',
      admin: {
        description: 'Imported HTML content (read-only, will be migrated to rich text)',
        readOnly: true,
        condition: (data) => Boolean(data?.htmlBody),
      },
    },
    {
      name: 'youtubeVideoId',
      type: 'text',
      admin: {
        description: 'Optional: embed a YouTube video instead of an image gallery',
      },
    },
  ],
}
