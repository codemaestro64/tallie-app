import { z } from 'zod'

export const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const getRestaurantSchema = z.object({
  query: z
    .object({
      get_available_tables: z
        .preprocess(
          (val) => (typeof val === 'string' ? val.toLowerCase() === 'true' : !!val),
          z.boolean(),
        )
        .optional(),
      start_time: z
        .string()
        .datetime({ message: 'start_time must be a valid ISO string' })
        .optional(),
      end_time: z.string().datetime({ message: 'end_time must be a valid ISO string' }).optional(),
    })
    .refine(
      (data) => {
        // If one is present, both must be present
        const hasStart = !!data.start_time
        const hasEnd = !!data.end_time
        return hasStart === hasEnd
      },
      {
        message: "Both 'start_time' and 'end_time' must be provided together",
        path: ['start_time'],
      },
    ),
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
    table_id: z.int('Table ID is required'),
    customer_name: z.string().min(3, 'Customer name is too short'),
    customer_phone: z.string().min(10, 'Customer phone number is too short'),
    party_size: z.number().int().positive().min(1),
    start_time: z.string().datetime({ message: 'Invalid ISO date string' }).pipe(z.coerce.date()),
    duration_minutes: z.number().int().min(30).max(180),
  }),
})

export const listReservationsSchema = z.object({
  query: z.object({
    date: z.string().date({ message: 'Invalid date string' }).pipe(z.coerce.date()).optional(),
  }),
})

export const createTableSchema = z.object({
  body: z.object({
    table_number: z.number().min(1, 'Table number is required').positive(),
    capacity: z.number().min(1, 'Table capacity must be a positive number').positive(),
  }),
})

export const getAvailableTablesSchema = z.object({
  query: z.object({
    start_time: z.string().datetime({ message: 'start_time must be a valid ISO string' }),
    end_time: z.string().datetime({ message: 'end_time must be a valid ISO string' }),
  }),
})
