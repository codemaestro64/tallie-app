import { reservationsTable, waitlistTable } from '@/db/schema.js'

export type Reservation = typeof reservationsTable.$inferSelect
export type ReservationResult =
  | typeof reservationsTable.$inferSelect
  | typeof waitlistTable.$inferSelect

export type ReservationStatuss = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export enum ReservationStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
}
