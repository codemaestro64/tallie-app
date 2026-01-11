import { z } from 'zod'

export const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
export const getRestaurantSchema = z.object({
  params: z.object({
    id: z
      .string()
      .transform((val) => Number(val))
      .refine((n) => !isNaN(n), {
        message: 'ID must be a valid number',
      }),
  }),
})

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Restaurant name is too short'),
    num_tables: z.int().min(1, 'Restaurant must have at least one table'),
    opening_time: z.string().regex(timeRegex, 'Invalid opening time format (HH:MM)'),
    closing_time: z.string().regex(timeRegex, 'Invalid closing time format (HH:MM)'),
  }),
})

export const createReservationSchema = z.object({
  body: z.object({
    restaurant_id: z.int('Restaurant ID is required'),
    table_id: z.int('Table ID is required'),
    customer_name: z.string().min(3, 'Customer name is too short'),
    customer_phone: z.string().min(10, 'Customer phone number is too short'),
    party_size: z.number().int().positive().min(1),
    start_time: z.string().datetime({ message: 'Invalid ISO date string' }).pipe(z.coerce.date()),
    duration_minutes: z.number().int().min(30).max(180),
  }),
})

export const createTableSchema = z.object({
  body: z.object({
    restaurant_id: z.int(),
    table_number: z.number().min(1, 'Table number is required').positive(),
    capacity: z.number().min(1, 'Table capacity must be a positive number'),
  }),
})

export const getAvailabilitySchema = z.object({
  query: z.object({
    restaurant_id: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    party_size: z.string().transform(Number),
  }),
})

export const getRestaurantAvailabilitySchema = z.object({
  params: z.object({
    restaurant_id: z.coerce.number().positive('Invalid restaurant ID'),
  }),

  query: z
    .object({
      start_time: z
        .string()
        .datetime({ message: 'start_time must be a valid ISO string' })
        .default(''),
      duration: z.coerce.number().min(15, 'Duration must be at least 15 minutes').default(0),
      party_size: z.coerce.number().positive().default(0),
    })
    .default({ start_time: '', duration: 0, party_size: 0 }),
})
