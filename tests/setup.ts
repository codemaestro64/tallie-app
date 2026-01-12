import { beforeAll, afterAll } from 'vitest'
import { db } from '../src/db/client.js'
import { restaurantsTable, tablesTable, reservationsTable } from '@/db/schema.js'

beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  await db.initialize()
  await db.applySchema()
})

afterAll(async () => {
  await db.client.delete(reservationsTable)
  await db.client.delete(tablesTable)
  await db.client.delete(restaurantsTable)
})
