import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Tables

export const restaurants = sqliteTable('restaurants', {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  maxNumTables: integer('max_num_tables').notNull(),
  openingTime: text('opening_time').notNull(), 
  closingTime: text('closing_time').notNull(),
});

export const tables = sqliteTable('tables', {
  id: integer("id").primaryKey({ autoIncrement: true }),
  restaurantId: integer('restaurant_id').references(() => restaurants.id),
  tableNumber: integer('table_number').notNull(),
  capacity: integer('capacity').notNull(),
});

export const reservations = sqliteTable('reservations', {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tableId: integer('table_id').references(() => tables.id), 
  customerName: text('customer_name').notNull(), // customers should have their own table
  customerPhone: text('customer_phone').notNull(), // customers should have their own table
  partySize: integer('party_size').notNull(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
});

// Relationships 

export const restaurantRelations = relations(restaurants, ({ many }) => ({
  tables: many(tables),
  reservations: many(reservations),   // has many through
}));

export const tableRelations = relations(tables, ({ one, many }) => ({
  restaurant: one(restaurants, { 
    fields: [tables.restaurantId], 
    references: [restaurants.id] 
  }),
  reservations: many(reservations),
}));

export const reservationRelations = relations(reservations, ({ one }) => ({
  table: one(tables, { 
    fields: [reservations.tableId], 
    references: [tables.id] 
  }),
}));