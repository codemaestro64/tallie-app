import { RequestHandler, Request, Response } from 'express'
import { CreateRestaurantInput } from '@/types/index.js'
import { GetRestaurantResponse } from '@/types/index.js'

export const createRestaurant: RequestHandler<
  Record<string, never>,
  Record<string, never>,
  CreateRestaurantInput
> = async (req: Request, res: Response) => {}

export const getRestaurantById: RequestHandler<
  { id: string },
  GetRestaurantResponse,
  Record<string, never>,
  Record<string, never>
> = async (req: Request, res: Response) => {
  const { id } = req.params
  // req.params.id is now correctly typed as a string
}
