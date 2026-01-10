import path from "node:path"
import fs from "node:fs"
import os from "node:os"
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import Database, { Database as SQLiteClient } from "better-sqlite3"
import * as schema from "./schema"
import { env } from "../env"

class DB {
  private static instance: DB
  private _db: BetterSQLite3Database<typeof schema> | null = null
  private _client: SQLiteClient | null = null

  private constructor() {}

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB()
    }
    return DB.instance;
  }

  public async initialize(): Promise<void> {
    if (this._db) return;

    let dbURL = env.DB_FILE_NAME
    dbURL = this.resolveDbPath(dbURL)
    
    try {
      this._client = new Database(dbURL)
      this._db = drizzle(this._client, { schema })
      
      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Failed to initialize database:", error)
      throw error
    }
  }

  private resolveDbPath(fileName: string): string {
    // If it's already an absolute path or an in-memory DB, return as is
    if (fileName.startsWith("file:") && (fileName.includes("/") || fileName.includes("\\"))) {
      return fileName
    }

    let baseDir: string

    // Logic to find the "Appropriate" folder per OS
    switch (process.platform) {
      case "win32":
        baseDir = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local")
        break
      case "darwin":
        baseDir = path.join(os.homedir(), "Library", "Application Support")
        break
      default: // Linux and others
        baseDir = process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share")
        break
    }

    const finalDir = path.join(baseDir, env.APP_NAME.toLocaleLowerCase())
    
    // Ensure the directory exists before the DB tries to write to it
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true })
    }

    const cleanFileName = fileName.replace("file:", "")
    return `file:${path.join(finalDir, cleanFileName)}`
  }
  // Helper getter to access the db instance safely
  public get client(): BetterSQLite3Database<typeof schema> {
    if (!this._db) {
      throw new Error("Database not initialized. Call initialize() first.")
    }
    return this._db
  }
}

export const db = DB.getInstance()