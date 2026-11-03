import path from 'path'
import { buildFigmaConfig } from '@payloadcms/figma'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Branches } from './collections/Branches'
import { Orders } from './collections/Orders'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'shoprite-zambia-demo-secret-key-at-least-32-chars-long-12345'
}

export default buildFigmaConfig({
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { 'en': adminLanguage },
  },
  collections: [Admins, Media, Folders, Tags, Categories, Products, Branches, Orders],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  figma: {
    environmentId: process.env.FIGMA_EID || 'ai-studio-env',
    contentSystemId: process.env.FIGMA_CONTENT_API_CONTENT_SYSTEM_ID || 'ai-studio-cs',
    useContentSystem: false,
    storage: false,
  },
  db: {
    defaultIDType: 'text',
    connect: async () => {},
    init: async () => {},
  } as any,
})
