import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Import Collections
import Users from './src/payload/collections/Users'
import Categories from './src/payload/collections/Categories'
import Makers from './src/payload/collections/Makers'
import Series from './src/payload/collections/Series'
import Products from './src/payload/collections/Products'
import News from './src/payload/collections/News'
import Downloads from './src/payload/collections/Downloads'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - Virex CMS Admin',
      favicon: '/favicon.ico',
    },
    // CMS Admin 전용 경로 설정
    route: '/cms-admin',
  },
  collections: [
    Users,
    Categories,
    Makers,
    Series,
    Products,
    News,
    Downloads,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [
    'http://localhost:3000',
    'http://localhost:3002', // Your current dev port
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost:3002',
  ],
})