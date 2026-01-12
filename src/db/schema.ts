import { sqliteTable, text, integer, check } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

export const restaurantsTable = sqliteTable(
  'restaurants',
  {
    // Forced ID 1 + CHECK constraint making sure that only one restaurant ever exists
    id: integer('id').primaryKey().default(1),
    name: text('name').notNull(),
    maxNumTables: integer('max_num_tables').notNull(),
    openingTime: text('opening_time').notNull(),
    closingTime: text('closing_time').notNull(),
  },
  (table) => ({
    singleRowConstraint: check('single_row_check', sql`${table.id} = 1`),
  }),
)

export const tablesTable = sqliteTable('tables', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableNumber: integer('table_number').notNull(),
  capacity: integer('capacity').notNull(),
})

export const reservationsTable = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableId: integer('table_id')
    .notNull()
    .references(() => tablesTable.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  partySize: integer('party_size').notNull(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'completed', 'cancelled'] })
    .notNull()
    .default('confirmed'),
})

export const peakHoursTable = sqliteTable('peak_hours', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dayOfWeek: integer('day_of_week').notNull(),
  startHour: text('start_hour').notNull(),
  endHour: text('end_hour').notNull(),
  maxDuration: integer('max_duration').notNull(),
})

export const waitlistTable = sqliteTable('waitlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  partySize: integer('party_size').notNull(),
  requestedTime: integer('requested_time', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['waiting', 'notified', 'expired'] }).default('waiting'),
})

export const tableRelations = relations(tablesTable, ({ many }) => ({
  reservations: many(reservationsTable),
}))

export const reservationRelations = relations(reservationsTable, ({ one }) => ({
  table: one(tablesTable, {
    fields: [reservationsTable.tableId],
    references: [tablesTable.id],
  }),
}))
