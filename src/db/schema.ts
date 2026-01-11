import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Tables

export const restaurantsTable = sqliteTable('restaurants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  maxNumTables: integer('max_num_tables').notNull(),
  openingTime: text('opening_time').notNull(),
  closingTime: text('closing_time').notNull(),
})

export const tablesTable = sqliteTable('tables', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  restaurantId: integer('restaurant_id').references(() => restaurantsTable.id),
  tableNumber: integer('table_number').notNull(),
  capacity: integer('capacity').notNull(),
})

export const reservationsTable = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  restaurantId: integer('restaurant_id').references(() => restaurantsTable.id),
  tableId: integer('table_id').references(() => tablesTable.id),
  customerName: text('customer_name').notNull(), // TODO customers should have their own table
  customerPhone: text('customer_phone').notNull(), // TODO customers should have their own table
  partySize: integer('party_size').notNull(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'completed', 'cancelled'] })
    .notNull()
    .default('confirmed'),
})

export const peakHoursTable = sqliteTable('peak_hours', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  restaurantId: integer('restaurant_id').references(() => restaurantsTable.id),
  dayOfWeek: integer('day_of_week').notNull(),
  startHour: text('start_hour').notNull(),
  endHour: text('end_hour').notNull(),
  maxDuration: integer('max_duration').notNull(),
})

export const waitlistTable = sqliteTable('waitlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  restaurantId: integer('restaurant_id').references(() => restaurantsTable.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  partySize: integer('party_size').notNull(),
  requestedTime: integer('requested_time', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['waiting', 'notified', 'expired'] }).default('waiting'),
})

// Relationships

export const restaurantRelations = relations(restaurantsTable, ({ many }) => ({
  tables: many(tablesTable),
  reservations: many(reservationsTable), // has many through
}))

export const tableRelations = relations(tablesTable, ({ one, many }) => ({
  restaurant: one(restaurantsTable, {
    fields: [tablesTable.restaurantId],
    references: [restaurantsTable.id],
  }),
  reservations: many(reservationsTable),
}))

export const reservationRelations = relations(reservationsTable, ({ one }) => ({
  table: one(tablesTable, {
    fields: [reservationsTable.tableId],
    references: [tablesTable.id],
  }),
}))
