import { eq, notInArray, sql, and } from 'drizzle-orm'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/db/client.js'
import { restaurantsTable, reservationsTable, tablesTable } from '@/db/schema.js'
import { AppError } from '@/utils/appError.js'
import type { CreateRestaurantInput, RestaurantWithAvailableTables } from '@/types/index.js'
import logger from '@/utils/log.js'
import {
  RestaurantDTO,
  RestaurantWithAvailabilityDTO,
  toRestaurantDTO,
  toRestaurantWithAvailabilityDTO,
} from '@/dto/index.js'

export class RestaurantService {
  private static instance: RestaurantService

  private constructor() {}

  public static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService()
    }
    return RestaurantService.instance
  }

  /**
   * Create a new restaurant
   * 1. Checks for existing name (Case-Insensitive)
   * 2. Inserts record
   */
  public async create(data: CreateRestaurantInput): Promise<RestaurantDTO> {
    const existingRestaurant = await db.client.query.restaurantsTable.findFirst({
      where: (restaurants, { sql }) => eq(sql`LOWER(${restaurants.name})`, data.name.toLowerCase()),
    })

    if (existingRestaurant) {
      throw new AppError(
        `A restaurant with the name "${data.name}" already exists.`,
        StatusCodes.CONFLICT,
      )
    }

    try {
      const result = await db.client
        .insert(restaurantsTable)
        .values({
          name: data.name,
          maxNumTables: data.num_tables,
          openingTime: data.opening_time,
          closingTime: data.closing_time,
        })
        .returning()
        .get()

      if (!result) {
        throw new AppError(
          'Database failed to return the new record.',
          StatusCodes.INTERNAL_SERVER_ERROR,
        )
      }

      return toRestaurantDTO(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[RestaurantService.create] Unexpected Error: ${error}`)

      throw new AppError(
        'Could not complete the restaurant registration.',
        StatusCodes.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Fetch a restaurant by ID
   * @throws AppError 404 if not found
   */
  public async getById(
    id: number,
    start_time?: string,
    duration?: number,
    party_size?: number,
  ): Promise<RestaurantWithAvailabilityDTO> {
    let occupiedIds: number[] = []

    // type guard. if one is present, all are present
    if (start_time && duration && party_size) {
      const start = new Date(start_time)
      const end = new Date(start.getTime() + duration * 60000)
      if (start < new Date()) {
        throw new AppError('Cannot check availability for the past', StatusCodes.BAD_REQUEST)
      }

      occupiedIds = await db.client
        .select({ id: reservationsTable.tableId })
        .from(reservationsTable)
        .where(
          and(
            eq(reservationsTable.restaurantId, id),
            eq(reservationsTable.status, 'confirmed'),
            sql`${start.getTime()} < ${reservationsTable.endTime}`,
            sql`${end.getTime()} > ${reservationsTable.startTime}`,
          ),
        )
        .all()
        .then((rows) => rows.map((r) => r.id).filter((id): id is number => id !== null))
    }

    const [restaurant, availableTables] = await Promise.all([
      // Get Restaurant
      db.client.query.restaurantsTable.findFirst({ where: eq(restaurantsTable.id, id) }),
      // Get Free Tables
      db.client
        .select()
        .from(tablesTable)
        .where(
          and(
            eq(tablesTable.restaurantId, id),
            occupiedIds.length > 0 ? notInArray(tablesTable.id, occupiedIds) : undefined,
          ),
        )
        .all(),
    ])

    if (!restaurant) throw new AppError('Not Found', StatusCodes.NOT_FOUND)

    return toRestaurantWithAvailabilityDTO(restaurant, availableTables)
  }

  /**
   * Typed fetch for a restaurant with tables available for a specific stay
   */
  public async getByIdWithAvailability(
    id: number,
    startTime: string,
    durationMinutes: number,
  ): Promise<RestaurantWithAvailableTables> {
    const start = new Date(startTime)
    const end = new Date(start.getTime() + durationMinutes * 60000)

    if (start < new Date()) {
      throw new AppError('Cannot check availability for the past', StatusCodes.BAD_REQUEST)
    }

    const occupiedIds = await db.client
      .select({ id: reservationsTable.tableId })
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.restaurantId, id),
          eq(reservationsTable.status, 'confirmed'),
          sql`${start.getTime()} < ${reservationsTable.endTime}`,
          sql`${end.getTime()} > ${reservationsTable.startTime}`,
        ),
      )
      .all()
      .then((rows) => rows.map((r) => r.id).filter((id): id is number => id !== null))

    const [restaurant, availableTables] = await Promise.all([
      // Get Restaurant
      db.client.query.restaurantsTable.findFirst({ where: eq(restaurantsTable.id, id) }),
      // Get Free Tables
      db.client
        .select()
        .from(tablesTable)
        .where(
          and(
            eq(tablesTable.restaurantId, id),
            occupiedIds.length > 0 ? notInArray(tablesTable.id, occupiedIds) : undefined,
          ),
        )
        .all(),
    ])

    if (!restaurant) throw new AppError('Not Found', StatusCodes.NOT_FOUND)

    return {
      ...restaurant,
      availableTables,
    }
  }
}

export const restaurantService = RestaurantService.getInstance()
