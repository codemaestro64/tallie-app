import { z } from 'zod'
import { restaurantsTable } from '@/db/schema.js'
import { Table } from './table.types.js'
import { createRestaurantSchema, getRestaurantAvailabilitySchema } from '@/utils/validators.js'

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>['body']
export type Restaurant = typeof restaurantsTable.$inferSelect
export type AvailabilityQuery = z.infer<typeof getRestaurantAvailabilitySchema>['query']
export type AvailabilityInput = z.infer<typeof getRestaurantAvailabilitySchema>
export interface RestaurantWithAvailableTables extends Restaurant {
  availableTables: Table[]
}
