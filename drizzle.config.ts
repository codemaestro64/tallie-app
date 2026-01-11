import 'dotenv/config'
import type { Config } from 'drizzle-kit'
import { getDatabaseUrl } from './src/db/config.js'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
} satisfies Config
