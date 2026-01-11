import { Table } from '@/types/index.js'

export type TableDTO = {
  id: number
  restaurant_id: number | null
  table_number: number
  capacity: number
}

export const toTableDTO = (row: Table): TableDTO => ({
  id: row.id,
  restaurant_id: row.restaurantId,
  table_number: row.tableNumber,
  capacity: row.capacity,
})
