import { z } from 'zod'
import { tablesTable } from '@/db/schema.js'
import { createTableSchema } from '@/utils/index.js'

export type CreateTableInput = z.infer<typeof createTableSchema>['body']
export type Table = typeof tablesTable.$inferSelect
