import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import { db } from '../src/db/client.js'
import { restaurantsTable, tablesTable, reservationsTable } from '@/db/schema.js'

describe('Restaurant API', () => {
  beforeEach(async () => {
    await db.client.delete(reservationsTable)
    await db.client.delete(tablesTable)
    await db.client.delete(restaurantsTable)
  })
  describe('POST /api/restaurant', () => {
    it('should create a new restaurant', async () => {
      const response = await request(app).post('/api/restaurant').send({
        name: 'Test Bistro',
        num_tables: 10,
        opening_time: '09:00',
        closing_time: '22:00',
      })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.name).toBe('Test Bistro')
    })

    it('should return 409 when restaurant already exists', async () => {
      // Create first restaurant
      await request(app).post('/api/restaurant').send({
        name: 'Test Bistro',
        num_tables: 10,
        opening_time: '09:00',
        closing_time: '22:00',
      })

      // Try to create duplicate
      const response = await request(app).post('/api/restaurant').send({
        name: 'Another Bistro',
        num_tables: 5,
        opening_time: '10:00',
        closing_time: '21:00',
      })

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('fail')
    })

    it('should return 400 for invalid input', async () => {
      const response = await request(app).post('/api/restaurant').send({
        name: 'Test',
      })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
    })
  })

  describe('POST /api/tables', () => {
    beforeEach(async () => {
      // Create restaurant before creating tables
      await request(app).post('/api/restaurant').send({
        name: 'Test Bistro',
        num_tables: 10,
        opening_time: '09:00',
        closing_time: '22:00',
      })
    })

    it('should create a new table', async () => {
      const response = await request(app).post('/api/tables').send({
        table_number: 1,
        capacity: 4,
      })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.table_number).toBe(1)
      expect(response.body.data.capacity).toBe(4)
    })

    it('should return 409 for duplicate table number', async () => {
      // Create first table
      await request(app).post('/api/tables').send({
        table_number: 1,
        capacity: 4,
      })

      // Try to create duplicate
      const response = await request(app).post('/api/tables').send({
        table_number: 1,
        capacity: 6,
      })

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('fail')
    })
  })

  describe('POST /api/reservation', () => {
    let tableId: number

    beforeEach(async () => {
      await request(app).post('/api/restaurant').send({
        name: 'Test Bistro',
        num_tables: 10,
        opening_time: '09:00',
        closing_time: '22:00',
      })

      const tableResponse = await request(app).post('/api/tables').send({
        table_number: 1,
        capacity: 4,
      })

      tableId = tableResponse.body.data.id
    })

    it('should create a reservation successfully', async () => {
      const response = await request(app).post('/api/reservations').send({
        table_id: tableId,
        customer_name: 'John Doe',
        customer_phone: '5551234567',
        party_size: 2,
        start_time: '2024-05-01T19:00:00Z',
        duration_minutes: 90,
      })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.customer_name).toBe('John Doe')
    })

    it('should return 409 for conflicting reservation', async () => {
      const d = new Date('2024-05-01T19:00:00Z')
      const setupRes = await request(app).post('/api/reservations').send({
        table_id: tableId,
        customer_name: 'John Doe',
        customer_phone: '5551234567',
        party_size: 2,
        start_time: d.toISOString(),
        duration_minutes: 90,
      })
      expect(setupRes.status).toBe(201)

      // Try to create overlapping reservation
      const d1 = new Date('2024-05-01T19:30:00Z')
      const response = await request(app).post('/api/reservations').send({
        table_id: tableId,
        customer_name: 'Jane Smith',
        customer_phone: '5559876543',
        party_size: 3,
        start_time: d1.toISOString(),
        duration_minutes: 60,
      })

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('success') // waitlisted
    })

    it('should return 404 for non-existent table', async () => {
      const response = await request(app).post('/api/reservations').send({
        table_id: 99999,
        customer_name: 'John Doe',
        customer_phone: '5551234567',
        party_size: 2,
        start_time: '2024-05-01T19:00:00Z',
        duration_minutes: 90,
      })

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('fail')
    })
  })

  describe('GET /api/reservations', () => {
    let tableId: number

    beforeEach(async () => {
      // Setup restaurant, table, and reservations
      await request(app).post('/api/restaurant').send({
        name: 'Test Bistro',
        num_tables: 10,
        opening_time: '09:00',
        closing_time: '22:00',
      })

      const tableResponse = await request(app).post('/api/tables').send({
        table_number: 19,
        capacity: 4,
      })

      tableId = tableResponse.body.data.id
      await request(app).post('/api/reservations').send({
        table_id: tableId,
        customer_name: 'John Doe',
        customer_phone: '5551234567',
        party_size: 2,
        start_time: '2024-05-01T19:00:00Z',
        duration_minutes: 90,
      })
    })

    it('should retrieve all reservations', async () => {
      const response = await request(app).get('/api/reservations')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('should filter reservations by date', async () => {
      const response = await request(app).get('/api/reservations').query({ date: '2024-05-01' })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })
})
