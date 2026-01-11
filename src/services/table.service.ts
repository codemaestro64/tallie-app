import { eq, and } from 'drizzle-orm'
import { db } from '@/db/client.js'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '@/utils/appError.js'
import { tablesTable } from '@/db/schema.js'
import { CreateTableInput, Table } from '@/types/index.js'
import logger from '@/utils/log.js'
import { restaurantService } from './restaurant.service.js'

export class TableService {
  private static instance: TableService

  private constructor() {}

  public static getInstance(): TableService {
    if (!TableService.instance) {
      TableService.instance = new TableService()
    }
    return TableService.instance
  }

  public async create(data: CreateTableInput): Promise<Table> {
    // first, ensure restaurant exists. will throw if it doesnt exist
    await restaurantService.getById(data.restaurant_id)

    // ensure table does not already exist
    const existingTable = await db.client.query.tablesTable.findFirst({
      where: and(
        eq(tablesTable.restaurantId, data.restaurant_id),
        eq(tablesTable.tableNumber, data.table_number),
      ),
    })

    if (existingTable) {
      throw new AppError(
        `A table with the number "${data.table_number}" already exists.`,
        StatusCodes.CONFLICT,
      )
    }

    try {
      const result = await db.client
        .insert(tablesTable)
        .values({
          restaurantId: data.restaurant_id,
          tableNumber: data.table_number,
          capacity: data.capacity,
        })
        .returning()
        .get()

      if (!result) {
        throw new AppError(
          'Database failed to return the new record.',
          StatusCodes.INTERNAL_SERVER_ERROR,
        )
      }

      return result
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[TableService.create] Unexpected Error: ${error}`)

      throw new AppError(
        'Could not complete the table creation.',
        StatusCodes.INTERNAL_SERVER_ERROR,
      )
    }
  }
}

export const tableService = TableService.getInstance()
