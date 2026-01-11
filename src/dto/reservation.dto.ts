import { Reservation, ReservationStatus } from '@/types/index.js'

export type ReservationDTO = {
  id: number
  restaurant_id: number | null
  table_id: number | null
  customer_name: string
  customer_phone: string
  party_size: number
  start_time: Date
  end_time: Date
  status: ReservationStatus
}

export const toReservationDTO = (row: Reservation): ReservationDTO => ({
  id: row.id,
  restaurant_id: row.restaurantId,
  table_id: row.tableId,
  customer_name: row.customerName,
  customer_phone: row.customerPhone,
  party_size: row.partySize,
  start_time: row.startTime,
  end_time: row.endTime,
  status: row.status,
})
