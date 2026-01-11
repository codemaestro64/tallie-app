import { z } from 'zod'
import { reservationsTable, waitlistTable } from '@/db/schema.js'
import { createReservationSchema } from '@/utils/validators.js'

export type CreateReservationInput = z.infer<typeof createReservationSchema>['body']
export type Reservation = typeof reservationsTable.$inferSelect
export type ReservationResult =
  | typeof reservationsTable.$inferSelect
  | typeof waitlistTable.$inferSelect

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
