import { z } from 'zod'

import { timeRegex } from './'

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Restaurant name is too short"),
    openingTime: z.string().regex(timeRegex, "Invalid opening time format (HH:MM)"),
    closingTime: z.string().regex(timeRegex, "Invalid closing time format (HH:MM)"),
  })
})

export const createReservationSchema = z.object({
  body: z.object({
    restaurantId: z.int(),
    customerName: z.string().min(3, "Customer name is too short"),
    customerPhone: z.string().min(10, "Customer phone number is too short"),
    partySize: z.number().int().positive().max(20),
    startTime: z.string().datetime({ message: "Invalid ISO date string" }),
    durationMinutes: z.number().int().min(30).max(180),
  }),
})

export const getAvailabilitySchema = z.object({
  query: z.object({
    restaurantId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    partySize: z.string().transform(Number),
  }),
})