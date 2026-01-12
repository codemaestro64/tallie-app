import { tablesTable } from '@/db/schema.js'

export type Table = typeof tablesTable.$inferSelect
