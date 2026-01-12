import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '@/utils/index.js'
import { restaurantService } from '@/services/restaurant.service.js'
import { Result, ApiResponse } from '@/types/index.js'
import { CreateRestaurantRequest, GetRestaurantRequest, RestaurantResponse } from '@/dto/index.js'

export const createRestaurant = catchAsync<
  Record<string, never>,
  ApiResponse<RestaurantResponse>,
  CreateRestaurantRequest,
  Record<string, never>
>(async (req, res) => {
  const restaurant = await restaurantService.create(req.body)

  res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: restaurant,
  })
})

export const getRestaurant = catchAsync<
  Record<never, never>,
  ApiResponse<RestaurantResponse>,
  Record<string, never>,
  GetRestaurantRequest
>(async (req, res) => {
  const restaurant = await restaurantService.get(req.query)

  res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: restaurant,
  })
})
