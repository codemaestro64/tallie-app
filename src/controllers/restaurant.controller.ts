import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '@/utils/index.js'
import { restaurantService } from '@/services/restaurant.service.js'
import {
  CreateRestaurantInput,
  Result,
  ApiResponse,
  AvailabilityQuery,
  RestaurantWithAvailableTables,
} from '@/types/index.js'
import { RestaurantDTO } from '@/dto/index.js'

export const createRestaurant = catchAsync<
  Record<string, never>,
  ApiResponse<RestaurantDTO>,
  CreateRestaurantInput,
  Record<string, never>
>(async (req, res) => {
  const restaurant = await restaurantService.create(req.body)

  res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: restaurant,
  })
})

export const getRestaurantById = catchAsync<
  { restaurant_id: string },
  ApiResponse<RestaurantDTO>,
  Record<string, never>,
  Record<string, never>
>(async (req, res) => {
  const restaurant_id = Number(req.params.restaurant_id)
  const { start_time, duration, party_size } = req.query
  const reqCount = [start_time, duration, party_size].filter((v) => v !== undefined).length
  if (!(reqCount === 0 || reqCount === 3)) {
    throw 'start_time, duration, and party_size must all be provided together'
  }

  const restaurant = await restaurantService.getById(
    restaurant_id,
    start_time,
    duration,
    party_size,
  )

  res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: restaurant,
  })
})

export const getRestaurantAvailability = catchAsync<
  { id: string },
  ApiResponse<RestaurantWithAvailableTables>,
  Record<string, never>,
  Record<string, never>
>(async (req, res) => {
  /**const id = Number(req.params.id)
  const { start_time, duration } = req.query as unknown as AvailabilityQuery

  const data = await restaurantService.getByIdWithAvailability(id, start_time, duration)

  res.status(StatusCodes.OK).json({
    status: Result.Success,
    data,
  })**/
})
