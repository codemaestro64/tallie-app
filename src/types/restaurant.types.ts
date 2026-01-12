import { restaurantsTable } from '@/db/schema.js'

export type Restaurant = typeof restaurantsTable.$inferSelect
