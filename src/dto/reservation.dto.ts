import { z } from 'zod'
import { Reservation, ReservationStatus, Table } from '@/types/index.js'
import { createReservationSchema, listReservationsSchema } from '@/utils/validators.js'
import { TableResponse, toTableResponse } from './index.js'

export type CreateReservationRequest = z.infer<typeof createReservationSchema>['body']
export type ListReservationsRequest = z.infer<typeof listReservationsSchema>['query']

export interface ReservationResponse {
  id: number
  table_id: number
  customer_name: string
  customer_phone: string
  party_size: number
  start_time: Date
  end_time: Date
  status: ReservationStatus
  table: TableResponse
}
export type ReservationWithTable = Reservation & { table: Table }

export interface ReservationSuggestionResponse {
  waitlisted: boolean
  message: string
  suggested_table?: TableResponse | undefined
}

export const toReservationResponse = (row: ReservationWithTable): ReservationResponse => ({
  id: row.id,
  table_id: row.tableId,
  customer_name: row.customerName,
  customer_phone: row.customerPhone,
  party_size: row.partySize,
  start_time: row.startTime,
  end_time: row.endTime,
  status: row.status as ReservationStatus,
  table: toTableResponse(row.table),
})

export const toReservationSuggestionResponse = (
  message: string,
  waitlisted: boolean,
  suggestedTable?: Table,
) => ({
  waitlisted: waitlisted,
  message: message,
  suggested_table: suggestedTable ? toTableResponse(suggestedTable) : undefined,
})
