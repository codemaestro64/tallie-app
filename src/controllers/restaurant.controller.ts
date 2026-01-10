
import { RequestHandler, Request, Response } from "express"
import { CreateReservationInput } from "../types"

export const createRestaurant: RequestHandler<
  {},
  {},
  CreateReservationInput
> = async (req: Request, res: Response) => {

}

export const getRestaurantById: RequestHandler<
  { id: string },
  any,
  {},
  {}
> = async (req: Request, res: Response) => {
  const { id } = req.params
} 