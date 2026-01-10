import { z } from 'zod'
import { createReservationSchema } from '@/utils/validators.js'

export type CreateReservationInput = z.infer<typeof createReservationSchema>['body']

export interface ReservationResponse {
  id: string
  customerName: string
  startTime: Date
  tableNumber: number
}
