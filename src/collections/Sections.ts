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
    preview: (doc) => {
      if (doc?.slug) {
        return `/browse/${doc.slug as string}`
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
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Uncheck to hide this section from the public site. Admins still see it everywhere.',
        position: 'sidebar',
      },
    },
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
      name: 'photos',
      type: 'array',
      admin: {
        description: 'Drag to reorder. Photos display in this order on the public site.',
        components: {
          RowLabel: '/src/components/PhotoRowLabel/index.tsx#PhotoRowLabel',
        },
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'photos',
          required: true,
        },
      ],
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
      name: 'sectionImage',
      type: 'text',
      admin: {
        description: 'Original section image filename from legacy site',
        condition: (data) => Boolean(data?.sectionImage),
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
    {
      name: 'latitude',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'WGS84 decimal degrees. Set via /admin/geo-review.',
        step: 0.000001,
      },
    },
    {
      name: 'longitude',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'WGS84 decimal degrees. Set via /admin/geo-review.',
        step: 0.000001,
      },
    },
    {
      name: 'geoReviewStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Excluded (not a single place)', value: 'excluded' },
        { label: 'Needs research', value: 'needs_research' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Geographic coordinate review state.',
      },
    },
    {
      name: 'geoSource',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'wikidata | nominatim | llm | adjusted | manual',
      },
    },
    {
      name: 'geoNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Reviewer notes about the coordinate decision.',
      },
    },
    {
      name: 'geoMapLinks',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/src/components/SectionGeoMapLink/index.tsx#SectionGeoMapLink',
        },
      },
    },
    // 'parent' and 'breadcrumbs' are auto-added by the nested-docs plugin
  ],
}
