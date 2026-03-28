import type { CollectionConfig } from 'payload'

export const Sections: CollectionConfig = {
  slug: 'sections',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sectionType', 'updatedAt'],
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
      },
    },
    {
      name: 'sectionType',
      type: 'select',
      options: [
        { label: 'Top Level', value: 'top-level' },
        { label: 'Country', value: 'country' },
        { label: 'Region', value: 'region' },
        { label: 'Site', value: 'site' },
        { label: 'Artifact', value: 'artifact' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'primaryImage',
      type: 'upload',
      relationTo: 'section-images',
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
      name: 'photos',
      type: 'join',
      collection: 'section-photos',
      on: 'section',
      admin: {
        description: 'Photos in this section (managed via Section Photos)',
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
    // 'parent' and 'breadcrumbs' are auto-added by the nested-docs plugin
  ],
}
