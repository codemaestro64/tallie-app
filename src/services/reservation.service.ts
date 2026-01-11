import { db } from '@/db/client.js'
import {
  reservationsTable,
  tablesTable,
  restaurantsTable,
  waitlistTable,
  peakHoursTable,
} from '@/db/schema.js'
import { eq, and, lt, gt, gte, ne, sql, asc } from 'drizzle-orm'
import { AppError } from '@/utils/appError.js'
import { StatusCodes } from 'http-status-codes'
import type { CreateReservationInput, Restaurant } from '@/types/index.js'
import { dateToHM } from '@/utils/index.js'

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
  private async findBestTable(
    restaurantId: number,
    partySize: number,
    start: Date,
    end: Date,
    excludeId?: number,
  ) {
    const suitableTables = await db.client
      .select()
      .from(tablesTable)
      .where(and(eq(tablesTable.restaurantId, restaurantId), gte(tablesTable.capacity, partySize)))
      .orderBy(asc(tablesTable.capacity))

    for (const table of suitableTables) {
      const overlapConditions = [
        eq(reservationsTable.tableId, table.id),
        eq(reservationsTable.status, 'confirmed'),
        sql`${start.getTime()} < ${reservationsTable.endTime}`,
        sql`${end.getTime()} > ${reservationsTable.startTime}`,
      ]

      if (excludeId) overlapConditions.push(ne(reservationsTable.id, excludeId))

      const overlap = await db.client
        .select()
        .from(reservationsTable)
        .where(and(...overlapConditions))
        .get()
      if (!overlap) return table
    }
    return null
  }

  private async validateTimeConstraintss(
    restaurantID: number,
    start: Date,
    end: Date,
    duration: number,
  ) {
    const restaurant = await db.client
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.id, restaurantID))
      .get()

    if (!restaurant) throw new AppError('Restaurant not found', StatusCodes.NOT_FOUND)
    const startHM = dateToHM(start)
    const endHM = dateToHM(end)

    if (startHM < restaurant.openingTime || endHM > restaurant.closingTime) {
      console.log(endHM)
      throw new AppError(
        `Outside hours: ${restaurant.openingTime}-${restaurant.closingTime}`,
        StatusCodes.BAD_REQUEST,
      )
    }
  }

  /**
   * VALIDATION: Peak hours & Operating hours valiation
   */
  private async validateTimeConstraints(
    restaurantId: number,
    start: Date,
    end: Date,
    duration: number,
  ) {
    const restaurant = await db.client
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.id, restaurantId))
      .get()
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
      .where(
        and(
          eq(peakHoursTable.restaurantId, restaurantId),
          eq(peakHoursTable.dayOfWeek, start.getDay()),
        ),
      )
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

  /**
   * CREATE RESERVATION
   */
  public async createOld(data: CreateReservationInput) {
    const start = new Date(data.start_time)
    const end = new Date(start.getTime() + data.duration_minutes * 60000)

    await this.validateTimeConstraints(data.restaurant_id, start, end, data.duration_minutes)

    const table = await this.findBestTable(data.restaurant_id, data.party_size, start, end)

    if (!table) {
      const waitEntry = await db.client
        .insert(waitlistTable)
        .values({
          restaurantId: data.restaurant_id,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          partySize: data.party_size,
          requestedTime: start,
        })
        .returning()
        .get()
      return { waitlisted: true, data: waitEntry }
    }

    const reservation = await db.client
      .insert(reservationsTable)
      .values({
        restaurantId: data.restaurant_id,
        tableId: table.id,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        partySize: data.party_size,
        startTime: start,
        endTime: end,
        status: 'confirmed',
      })
      .returning()
      .get()

    return { waitlisted: false, data: reservation }
  }

  public async create(data: CreateReservationInput) {
    const start = new Date(data.start_time)
    const end = new Date(start.getTime() + data.duration_minutes * 60000)

    await this.validateTimeConstraints(data.restaurant_id, start, end, data.duration_minutes)

    const requestedTable = await db.client.query.tablesTable.findFirst({
      where: and(
        eq(tablesTable.id, data.table_id),
        eq(tablesTable.restaurantId, data.restaurant_id),
      ),
    })

    if (!requestedTable) {
      throw new AppError('Table not found.', StatusCodes.NOT_FOUND)
    }

    // Check for capacity or overlap
    const hasOverlap = await db.client.query.reservationsTable.findFirst({
      where: and(
        eq(reservationsTable.tableId, data.table_id),
        eq(reservationsTable.status, 'confirmed'),
        lt(reservationsTable.startTime, end),
        gt(reservationsTable.endTime, start),
      ),
    })

    const isTooSmall = requestedTable.capacity < data.party_size

    // If there is a problem, find a suggestion before throwing
    if (isTooSmall || hasOverlap) {
      const suggestedTable = await this.findBestTable(
        data.restaurant_id,
        data.party_size,
        start,
        end,
      )

      const reason = isTooSmall
        ? `Table ${requestedTable.tableNumber} is too small (Capacity: ${requestedTable.capacity}).`
        : `Table ${requestedTable.tableNumber} is already booked for this time.`

      const sn = suggestedTable
        ? {
            tableId: suggestedTable.id,
            tableNumber: suggestedTable.tableNumber,
            capacity: suggestedTable.capacity,
            message: `Table ${suggestedTable.tableNumber} is available and fits your party.`,
          }
        : null
      const err = JSON.stringify({
        reason: reason,
        suggestion: sn,
      })
      throw new AppError(err, StatusCodes.CONFLICT)
    }

    // If all clear, make reservation
    const reservation = await db.client
      .insert(reservationsTable)
      .values({
        restaurantId: data.restaurant_id,
        tableId: requestedTable.id,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        partySize: data.party_size,
        startTime: start,
        endTime: end,
        status: 'confirmed',
      })
      .returning()
      .get()

    return { waitlisted: false, data: reservation }
  }

  /**
   * MODIFY RESERVATION
   */
  public async modify(id: number, updates: Partial<CreateReservationInput>) {
    const current = await db.client
      .select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, id))
      .get()
    if (!current || !current.restaurantId)
      throw new AppError('Reservation not found', StatusCodes.NOT_FOUND)

    const start = updates.start_time ? new Date(updates.start_time) : current.startTime
    const duration =
      updates.duration_minutes ?? (current.endTime.getTime() - current.startTime.getTime()) / 60000
    const end = new Date(start.getTime() + duration * 60000)
    const partySize = updates.party_size ?? current.partySize

    await this.validateTimeConstraints(current.restaurantId, start, end, duration)

    const table = await this.findBestTable(current.restaurantId, partySize, start, end, id)
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
      .set({ status: 'cancelled' })
      .where(eq(reservationsTable.id, id))
      .returning()
      .get()
    if (!res) throw new AppError('Not found', StatusCodes.NOT_FOUND)
    return res
  }
}

export const reservationService = new ReservationService()
