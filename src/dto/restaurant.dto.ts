import { z } from 'zod'
import { createRestaurantSchema, getRestaurantSchema } from '@/utils/index.js'
import { Restaurant, Table } from '@/types/index.js'
import { TableResponse, toTableResponse } from './index.js'

export type GetRestaurantRequest = z.infer<typeof getRestaurantSchema>['query']

export type CreateRestaurantRequest = z.infer<typeof createRestaurantSchema>['body']
export type RestaurantResponse = {
  id: number
  name: string
  max_num_tables: number
  opening_time: string
  closing_time: string
}

export interface RestaurantWithAvailabilityResponse extends RestaurantResponse {
  available_tables: TableResponse[]
}

// Base restaurant DTO without tables
export const toRestaurantResponse = (row: Restaurant): RestaurantResponse => ({
  id: row.id,
  name: row.name,
  max_num_tables: row.maxNumTables,
  opening_time: row.openingTime,
  closing_time: row.closingTime,
})

// Full restaurant with availability
export const toRestaurantWithAvailabilityResponse = (
  restaurant: Restaurant,
  tables: Table[],
): RestaurantWithAvailabilityResponse => ({
  ...toRestaurantResponse(restaurant),
  available_tables: tables.map(toTableResponse),
})
