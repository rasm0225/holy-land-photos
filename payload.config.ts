import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
// import { migrations } from './src/migrations'

import { Users } from './src/collections/Users'
import { Sections } from './src/collections/Sections'
import { Photos } from './src/collections/Photos'
import { SectionPhotos } from './src/collections/SectionPhotos'
import { Pages } from './src/collections/Pages'
import { News } from './src/collections/News'
import { SiteOfTheWeek } from './src/collections/SiteOfTheWeek'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        'section-hierarchy': {
          Component: '/src/components/SectionHierarchy/index.tsx',
          path: '/section-hierarchy',
        },
        'keyword-index': {
          Component: '/src/components/KeywordIndex/index.tsx',
          path: '/keyword-index',
        },
        'search-logs': {
          Component: '/src/components/SearchLogs/index.tsx',
          path: '/search-logs',
        },
        'page-logs': {
          Component: '/src/components/PageLogs/index.tsx',
          path: '/page-logs',
        },
      },
      afterNavLinks: [
        '/src/components/SectionHierarchy/NavLink.tsx#SectionHierarchyNavLink',
        '/src/components/KeywordIndex/NavLink.tsx#KeywordIndexNavLink',
        '/src/components/SearchLogs/NavLink.tsx#SearchLogsNavLink',
        '/src/components/PageLogs/NavLink.tsx#PageLogsNavLink',
      ],
    },
  },
  collections: [
    Users,
    Sections,
    Photos,
    SectionPhotos,
    Pages,
    News,
    SiteOfTheWeek,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    },
  }),
  sharp,
  plugins: [
    nestedDocsPlugin({
      collections: ['sections'],
      generateLabel: (_, doc) => doc.title as string,
      generateURL: (docs) =>
        docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),
    s3Storage({
      collections: {
        photos: {
          generateFileURL: ({ filename }) =>
            `https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com/${filename}`,
          disablePayloadAccessControl: true,
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-2',
      },
    }),
  ],
})
