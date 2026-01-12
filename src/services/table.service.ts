import { eq, and, notInArray, gt, lt } from 'drizzle-orm'
import { db } from '@/db/client.js'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '@/utils/appError.js'
import { tablesTable } from '@/db/schema.js'
import {
  CreateTableRequest,
  ListAvailableTablesRequest,
  TableResponse,
  toTableResponse,
} from '@/dto/index.js'
import logger from '@/utils/log.js'
import { reservationsTable } from '@/db/schema.js'
import { ReservationStatus } from '@/types/index.js'

export class TableService {
  private static instance: TableService

  private constructor() {}

  public static getInstance(): TableService {
    if (!TableService.instance) {
      TableService.instance = new TableService()
    }
    return TableService.instance
  }

  public getAvailableTablesQuery(start: Date, end: Date) {
    const occupiedSubquery = db.client
      .select({ id: reservationsTable.tableId })
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.status, ReservationStatus.Confirmed),
          gt(reservationsTable.endTime, start),
          lt(reservationsTable.startTime, end),
        ),
      )

    return db.client.select().from(tablesTable).where(notInArray(tablesTable.id, occupiedSubquery))
  }

  public async listAvailable(req: ListAvailableTablesRequest): Promise<TableResponse[]> {
    const start = new Date(req.start_time)
    const end = new Date(req.end_time)

    const rows = await this.getAvailableTablesQuery(start, end)

    return rows.map((table) => toTableResponse(table))
  }

  public async create(data: CreateTableRequest): Promise<TableResponse> {
    // ensure table does not already exist
    const existingTable = await db.client.query.tablesTable.findFirst({
      where: and(eq(tablesTable.tableNumber, data.table_number)),
    })

    if (existingTable) {
      throw new AppError(
        `A table with the number "${data.table_number}" already exists.`,
        StatusCodes.CONFLICT,
      )
    }

    try {
      const table = await db.client
        .insert(tablesTable)
        .values({
          tableNumber: data.table_number,
          capacity: data.capacity,
        })
        .returning()
        .get()

      if (!table) {
        throw new AppError(
          'Database failed to return the new record.',
          StatusCodes.INTERNAL_SERVER_ERROR,
        )
      }

      return toTableResponse(table)
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
