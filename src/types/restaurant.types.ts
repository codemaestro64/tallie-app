import { z } from 'zod'
import { createRestaurantSchema } from '@/utils/validators.js'

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>['body']

export interface CreateRestaurantResponse {
  id: number
}

export interface GetRestaurantResponse {
  id: number
}
