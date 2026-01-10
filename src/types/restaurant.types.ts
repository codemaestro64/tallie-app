import { z } from "zod"
import { createRestaurantSchema } from "../utils/validators"

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>['body']

export interface CreateRestaurantResponse {
  id: number
}