import type { CollectionConfig } from 'payload'

export const SectionImages: CollectionConfig = {
  slug: 'section-images',
  admin: {
    hidden: true,
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
