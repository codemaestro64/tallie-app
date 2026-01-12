import { db } from '@/db/client.js'
import { reservationsTable, tablesTable, waitlistTable, peakHoursTable } from '@/db/schema.js'
import { eq, and, lt, lte, gt, gte, ne, notExists, asc } from 'drizzle-orm'
import { AppError } from '@/utils/appError.js'
import { StatusCodes } from 'http-status-codes'
import {
  CreateReservationRequest,
  ReservationResponse,
  ReservationSuggestionResponse,
  toReservationResponse,
  toReservationSuggestionResponse,
  ReservationWithTable,
} from '@/dto/index.js'
import { ReservationStatus } from '@/types/index.js'
import { Waitlist } from '@/types/waitlist.types.js'

export class ReservationService {
  /**
   * Helper: Convert Date to minutes from midnight for time comparison
   */
  private getMinutesFromDate(date: Date): number {
    return date.getHours() * 60 + date.getMinutes()
  }

  /**
   * SEATING OPTIMIZATION
   * Finds smallest table for party size, excluding specific reservation if modifying.
   */
  private async findBestTable(partySize: number, start: Date, end: Date, excludeId?: number) {
    const results = await db.client
      .select()
      .from(tablesTable)
      .where(
        and(
          gte(tablesTable.capacity, partySize),
          notExists(
            db.client
              .select()
              .from(reservationsTable)
              .where(
                and(
                  eq(reservationsTable.tableId, tablesTable.id),
                  eq(reservationsTable.status, 'confirmed'),
                  lt(reservationsTable.startTime, end),
                  gt(reservationsTable.endTime, start),
                  excludeId ? ne(reservationsTable.id, excludeId) : undefined,
                ),
              ),
          ),
        ),
      )
      .orderBy(asc(tablesTable.capacity))
      .limit(1)

    // Return the first table found, or null
    return results[0] ?? null
  }

  private async addToWaitlist(req: CreateReservationRequest, reqDate: Date): Promise<Waitlist> {
    return await db.client
      .insert(waitlistTable)
      .values({
        customerName: req.customer_name,
        customerPhone: req.customer_phone,
        partySize: req.party_size,
        requestedTime: reqDate,
      })
      .returning()
      .get()
  }

  /**
   * VALIDATION: Peak hours & Operating hours valiation
   */
  private async validateTimeConstraints(start: Date, end: Date, duration: number) {
    const restaurant = await db.client.query.restaurantsTable.findFirst()
    if (!restaurant) throw new AppError('Restaurant not found', StatusCodes.NOT_FOUND)

    // Check operating hours
    const toMins = (t: string) => t.split(':').reduce((h, m) => +h * 60 + +m, 0)
    const [sMins, eMins] = [this.getMinutesFromDate(start), this.getMinutesFromDate(end)]

    if (sMins < toMins(restaurant.openingTime) || eMins > toMins(restaurant.closingTime)) {
      throw new AppError(
        `Outside hours: ${restaurant.openingTime}-${restaurant.closingTime}`,
        StatusCodes.BAD_REQUEST,
      )
    }

    // Check peak hours
    const peakRule = await db.client
      .select()
      .from(peakHoursTable)
      .where(and(eq(peakHoursTable.dayOfWeek, start.getDay())))
      .all()

    for (const rule of peakRule) {
      if (sMins >= toMins(rule.startHour) && sMins <= toMins(rule.endHour)) {
        if (duration > rule.maxDuration) {
          throw new AppError(
            `Peak limit (${rule.startHour}-${rule.endHour}): ${rule.maxDuration}m`,
            StatusCodes.BAD_REQUEST,
          )
        }
      }
    }
  }

  public async create(
    req: CreateReservationRequest,
  ): Promise<ReservationResponse | ReservationSuggestionResponse> {
    const start = new Date(req.start_time)
    const end = new Date(start.getTime() + req.duration_minutes * 60000)

    await this.validateTimeConstraints(start, end, req.duration_minutes)

    const reqTable = await db.client.query.tablesTable.findFirst({
      where: and(eq(tablesTable.id, req.table_id)),
      with: {
        reservations: {
          where: and(
            eq(reservationsTable.status, ReservationStatus.Confirmed),
            lt(reservationsTable.startTime, end),
            gt(reservationsTable.endTime, start),
          ),
          limit: 1,
        },
      },
    })

    if (!reqTable) {
      throw new AppError('Table Not Found', StatusCodes.NOT_FOUND)
    }

    const hasOverlap = reqTable.reservations.length > 0
    const isTooSmall = reqTable.capacity < req.party_size

    if (hasOverlap || isTooSmall) {
      const suggestedTable = await this.findBestTable(req.party_size, start, end)
      if (!suggestedTable) {
        await this.addToWaitlist(req, start)
        return toReservationSuggestionResponse(
          "Table unavailable. You've been added to the waitlist",
          true,
        )
      }

      const message = isTooSmall
        ? `Table ${reqTable.tableNumber} is too small (Capacity: ${reqTable.capacity}).`
        : `Table ${reqTable.tableNumber} is already booked for this time.`

      return toReservationSuggestionResponse(message, false, suggestedTable)
    }

    // If all clear, make reservation
    const reservation = await db.client
      .insert(reservationsTable)
      .values({
        tableId: reqTable.id,
        customerName: req.customer_name,
        customerPhone: req.customer_phone,
        partySize: req.party_size,
        startTime: start,
        endTime: end,
        status: 'confirmed',
      })
      .returning()
      .get()

    const res: ReservationWithTable = {
      ...reservation,
      table: reqTable,
    }

    return toReservationResponse(res)
  }

  public async getReservations(date?: Date): Promise<ReservationResponse[]> {
    const conditions = []
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      conditions.push(
        gte(reservationsTable.startTime, startOfDay),
        lte(reservationsTable.startTime, endOfDay),
      )
    }

    const rows = await db.client.query.reservationsTable.findMany({
      where: and(...conditions),
      with: {
        table: true,
      },
    })

    return rows.map(toReservationResponse)
  }

  /**
   * MODIFY RESERVATION
   */
  public async modify(id: number, updates: Partial<CreateReservationRequest>) {
    const current = await db.client
      .select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, id))
      .get()
    if (!current) {
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND)
    }

    const start = updates.start_time ? new Date(updates.start_time) : current.startTime
    const duration =
      updates.duration_minutes ?? (current.endTime.getTime() - current.startTime.getTime()) / 60000
    const end = new Date(start.getTime() + duration * 60000)
    const partySize = updates.party_size ?? current.partySize

    await this.validateTimeConstraints(start, end, duration)

    const table = await this.findBestTable(partySize, start, end, id)
    if (!table) throw new AppError('Table unavailable for modified details', StatusCodes.CONFLICT)

    return await db.client
      .update(reservationsTable)
      .set({
        startTime: start,
        endTime: end,
        partySize,
        tableId: table.id,
      })
      .where(eq(reservationsTable.id, id))
      .returning()
      .get()
  }

  /**
   * CANCEL RESERVATION
   */
  public async cancel(id: number) {
    const res = await db.client
      .update(reservationsTable)
      .set({ status: ReservationStatus.Cancelled })
      .where(eq(reservationsTable.id, id))
      .returning()
      .get()
    if (!res) throw new AppError('Not found', StatusCodes.NOT_FOUND)
    return res
  }
}

export const reservationService = new ReservationService()
