import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema.js'
import { env } from '@/env.js'
import logger from '@/utils/log.js'

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

    let url = env.DB_FILE_NAME
    url = this.resolveDbPath(url)

    try {
      const client = createClient({ url })
      this._db = drizzle(client, { schema })

      logger.info('Database initialized successfully')
    } catch (error) {
      logger.error(`Failed to initialize database: ${error}`)
      throw error
    }
  }

  private resolveDbPath(fileName: string): string {
    // If it's already an absolute path or an in-memory DB, return as is
    if (fileName.startsWith('file:') && (fileName.includes('/') || fileName.includes('\\'))) {
      return fileName
    }

    let baseDir: string

    // Logic to find the "Appropriate" folder per OS
    switch (process.platform) {
      case 'win32':
        baseDir = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
        break
      case 'darwin':
        baseDir = path.join(os.homedir(), 'Library', 'Application Support')
        break
      default: // Linux and others
        baseDir = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share')
        break
    }

    const finalDir = path.join(baseDir, env.APP_NAME.toLocaleLowerCase())

    // Ensure the directory exists before the DB tries to write to it
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true })
    }

    const cleanFileName = fileName.replace('file:', '')
    return `file:${path.join(finalDir, cleanFileName)}`
  }
  // Helper getter to access the db instance safely
  public get db(): LibSQLDatabase<typeof schema> {
    if (!this._db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this._db
  }
}

export const db = DB.getInstance()
