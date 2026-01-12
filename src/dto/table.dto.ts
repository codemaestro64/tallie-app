import { z } from 'zod/mini'
import { Table } from '@/types/index.js'
import { createTableSchema, getAvailableTablesSchema } from '@/utils/index.js'

export type CreateTableRequest = z.infer<typeof createTableSchema>['body']
export type ListAvailableTablesRequest = z.infer<typeof getAvailableTablesSchema>['query']

export interface TableResponse {
  id: number
  table_number: number
  capacity: number
}

export const toTableResponse = (row: Table): TableResponse => ({
  id: row.id,
  table_number: row.tableNumber,
  capacity: row.capacity,
})
