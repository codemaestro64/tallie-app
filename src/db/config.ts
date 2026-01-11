import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

import { env } from '@/env.js'

export function getDatabaseUrl(): string {
  const fileName = env.DB_FILE_NAME || 'dev.db'
  const appName = (env.APP_NAME || 'tallie_app').toLowerCase()

  if (fileName.includes('/') || fileName.includes('\\')) {
    return fileName.startsWith('file:') ? fileName : `file:${fileName}`
  }

  let baseDir: string
  switch (process.platform) {
    case 'win32':
      baseDir = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
      break
    case 'darwin':
      baseDir = path.join(os.homedir(), 'Library', 'Application Support')
      break
    default:
      baseDir = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share')
      break
  }

  const finalDir = path.join(baseDir, appName)
  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true })
  }

  const cleanFileName = fileName.replace('file:', '')
  return `file:${path.join(finalDir, cleanFileName)}`
}
