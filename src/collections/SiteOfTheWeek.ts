import type { CollectionConfig } from 'payload'

export const SiteOfTheWeek: CollectionConfig = {
  slug: 'site-of-the-week',
  labels: {
    singular: 'Site of the Week',
    plural: 'Site of the Week',
  },
  admin: {
    useAsTitle: 'imageId',
    defaultColumns: ['section', 'imageId', 'isCurrent', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // When setting an entry as current, uncheck all others
        if (data?.isCurrent) {
          await req.payload.update({
            collection: 'site-of-the-week',
            where: {
              isCurrent: { equals: true },
            },
            data: {
              isCurrent: false,
            },
          })
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'sections',
      required: true,
    },
    {
      name: 'imageId',
      type: 'text',
      required: true,
      admin: {
        description: 'HLP Image ID for the featured photo (e.g. TEETHN02)',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Set as the currently featured Site of the Week',
      },
    },
  ],
}
