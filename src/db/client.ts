import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema.js'
import logger from '@/utils/log.js'
import { getDatabaseUrl } from './config.js'

class DB {
  private static instance: DB
  private _db: LibSQLDatabase<typeof schema> | null = null

  private constructor() {} // prevent class instantiation from outside cos: singleton

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB()
    }
    return DB.instance
  }

  public async initialize(): Promise<void> {
    if (this._db) return

    const url = getDatabaseUrl()

    try {
      const client = createClient({ url })
      this._db = drizzle(client, { schema })

      logger.info('Database initialized successfully')
    } catch (error) {
      logger.error(`Failed to initialize database: ${error}`)
      throw error
    }
  }

  // Helper getter to access the db instance safely
  public get client(): LibSQLDatabase<typeof schema> {
    if (!this._db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this._db
  }
}

export const db = DB.getInstance()
