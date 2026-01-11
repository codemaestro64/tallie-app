import { Restaurant, Table } from '@/types/index.js'
import { TableDTO, toTableDTO } from './table.dto.js'

export type RestaurantDTO = {
  id: number
  name: string
  max_num_tables: number
  opening_time: string
  closing_time: string
}

export interface RestaurantWithAvailabilityDTO extends RestaurantDTO {
  available_tables: TableDTO[]
}

// Base restaurant DTO without tables
export const toRestaurantDTO = (row: Restaurant): RestaurantDTO => ({
  id: row.id,
  name: row.name,
  max_num_tables: row.maxNumTables,
  opening_time: row.openingTime,
  closing_time: row.closingTime,
})

// Full restaurant with availability
export const toRestaurantWithAvailabilityDTO = (
  restaurant: Restaurant,
  tables: Table[],
): RestaurantWithAvailabilityDTO => ({
  ...toRestaurantDTO(restaurant),
  available_tables: tables.map(toTableDTO),
})
