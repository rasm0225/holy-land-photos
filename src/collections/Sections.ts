import type { CollectionConfig } from 'payload'

const formatSlug = (val: string): string =>
  val
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const Sections: CollectionConfig = {
  slug: 'sections',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sectionType', 'updatedAt'],
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
      relationTo: 'photos',
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
