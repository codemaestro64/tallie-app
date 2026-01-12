import { waitlistTable } from '@/db/schema.js'
import { WaitlistStatus } from '@/types/index.js'

export type WaitlistDTO = {
  id: number
  customer_name: string
  customer_phone: string
  party_size: number
  requested_time: Date
  status: WaitlistStatus | null
}

export const toWaitlistDTO = (row: typeof waitlistTable.$inferSelect): WaitlistDTO => ({
  id: row.id,
  customer_name: row.customerName,
  customer_phone: row.customerPhone,
  party_size: row.partySize,
  requested_time: row.requestedTime,
  status: row.status,
})
