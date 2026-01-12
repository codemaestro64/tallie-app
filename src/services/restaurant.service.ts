import { StatusCodes } from 'http-status-codes'
import { db } from '@/db/client.js'
import { restaurantsTable } from '@/db/schema.js'
import { AppError } from '@/utils/index.js'
import {
  CreateRestaurantRequest,
  GetRestaurantRequest,
  RestaurantResponse,
  toRestaurantResponse,
  toRestaurantWithAvailabilityResponse,
} from '@/dto/index.js'
import { tableService } from './table.service.js'
import { DrizzleQueryError } from 'drizzle-orm'

export class RestaurantService {
  private static instance: RestaurantService

  private constructor() {}

  public static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService()
    }
    return RestaurantService.instance
  }

  public async get(req: GetRestaurantRequest): Promise<RestaurantResponse> {
    const restaurantTask = db.client.query.restaurantsTable.findFirst()

    let tablesTask

    if (req.get_available_tables) {
      const start = req.start_time ? new Date(req.start_time) : new Date()
      const end = req.end_time ? new Date(req.end_time) : start

      tablesTask = tableService.getAvailableTablesQuery(start, end)
    }

    const [restaurant, availableTables] = await Promise.all([restaurantTask, tablesTask])
    if (!restaurant) throw new AppError('Not Found', StatusCodes.NOT_FOUND)

    return toRestaurantWithAvailabilityResponse(restaurant, availableTables ?? [])
  }

  public async create(req: CreateRestaurantRequest): Promise<RestaurantResponse> {
    try {
      const newRestaurant = await db.client
        .insert(restaurantsTable)
        .values({
          id: 1, // Ensures only one record is inserted
          name: req.name,
          maxNumTables: req.num_tables,
          openingTime: req.opening_time,
          closingTime: req.closing_time,
        })
        .returning()
        .get()

      return toRestaurantResponse(newRestaurant)
    } catch (error: unknown) {
      if (error instanceof DrizzleQueryError) {
        const cause = error.cause as { code?: string }
        if (cause?.code === 'SQLITE_CONSTRAINT') {
          throw new AppError('Restaurant already exists', StatusCodes.CONFLICT)
        }
      }

      // Throw unknown errors to be caught by error middleware
      throw error
    }
  }
}

export const restaurantService = RestaurantService.getInstance()
