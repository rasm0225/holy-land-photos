import type { CollectionConfig } from 'payload'

export const SectionPhotos: CollectionConfig = {
  slug: 'section-photos',
  admin: {
    hidden: true,
    defaultColumns: ['section', 'photo', 'sortOrder'],
  },
  fields: [
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'sections',
      required: true,
      index: true,
    },
    {
      name: 'photo',
      type: 'relationship',
      relationTo: 'photos',
      required: true,
      index: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order within the section (lower numbers first)',
      },
    },
  ],
}
