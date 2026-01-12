import 'dotenv/config'
import process from 'process'

import { loadEnv } from './env.load.js'

loadEnv()

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME,
  },
}
