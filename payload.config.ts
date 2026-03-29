import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

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
    push: true, // Auto-sync schema in all environments (remove before production launch)
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
  ],
})
