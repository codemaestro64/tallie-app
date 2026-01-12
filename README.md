# Tallie App

Production-ready restaurant reservation management system built with Node.js, Express, and Drizzle ORM.

## Features

- Restaurant & table management
- Smart reservation engine with conflict detection
- Automatic waitlisting (HTTP 202)
- Type-safe database access with Drizzle ORM
- Strong request validation with Zod
- SQLite/LibSQL persistence

## Prerequisites

- Node.js ≥ 18
- pnpm 10.20.0

## Quick Start

### 1. Install Dependencies

```bash
git clone https://github.com/codemaestro64/tallie-app
cd tallie-app
pnpm install
```

### 2. Environment Setup

Copy `.env.sample` to `.env.development` for development or `.env` for production:

**Development**: `.env.development`
```env
PORT=3000
DATABASE_URL=file:local.db
NODE_ENV=development
```

**Production**: `.env`
```env
PORT=3000
DATABASE_URL=file:production.db
NODE_ENV=production
```

### 3. Run

**Development**
```bash
pnpm dev
```

**Production**
```bash
pnpm build
pnpm start
```

Database migrations are automatically applied in both environments.

**The app runs on the port configured in your `.env` file.**

## Database Management

View and manage your database:
```bash
pnpm run db:studio
```

## Testing

```bash
pnpm test
```

## API Endpoints

All endpoints return responses in the following `ApiResponse` format:

```typescript
{
  "status": "success" | "error",
  "data": {},           // Response payload
  "message": "...",     // Optional message
  "meta": {             // Optional metadata (pagination, etc.)
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Restaurant

**Create Restaurant**
```http
POST /api/restaurant
Content-Type: application/json

{
  "name": "Tallie Bistro",
  "num_tables": 15,
  "opening_time": "08:00",
  "closing_time": "22:00"
}
```

Returns:
- `201 Created` - Restaurant created successfully
- `409 Conflict` - Restaurant already exists
- `400 Bad Request` - Invalid input data

**Get Restaurant**
```http
GET /api/restaurant
```

Optional query parameters:
- `get_available_tables=true` - Include all currently available tables
- `start_time` & `end_time` - When both provided, returns available tables for that specific time slot (ISO 8601 format)

Example:
```http
GET /api/restaurant?get_available_tables=true&start_time=2024-05-01T19:00:00Z&end_time=2024-05-01T21:00:00Z
```

### Tables

**Create Table**
```http
POST /api/tables
Content-Type: application/json

{
  "table_number": 10,
  "capacity": 4
}
```

**List Available Tables For Time Slot**
```http
GET /api/tables
```

Require Query parameters:
- `start_time` & `end_time` - When both provided, returns available tables for that specific time slot (ISO 8601 format)

Example:
```http
GET /api/tables?start_time=2024-05-01T19:00:00Z&end_time=2024-05-01T21:00:00Z
```

Returns:
- `200 OK` - List of available tables
- `404 Not Found` - Restaurant does not exist
- `400 Bad Request` - Invalid query parameters

### Reservations

**Create Reservation**
```http
POST /api/reservations
Content-Type: application/json

{
  "table_id": 1,
  "customer_name": "Michael Eze",
  "customer_phone": "5550123456",
  "party_size": 2,
  "start_time": "2024-05-01T19:30:00Z",
  "duration_minutes": 90
}
```

Returns:
- `201 Created` - Reservation confirmed
- `202 Accepted` - Waitlisted (no available tables)
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Table does not exist

**List Reservations**
```http
GET /api/reservations
```

Optional query parameters:
- `date` - When provided, returns reservations for that specific day (YYYY-MM-DD format). If omitted, returns all reservations.

Example:
```http
GET /api/reservations?date=2024-05-01
```

Returns:
- `200 OK` - List of reservations
- `400 Bad Request` - Invalid query parameters

**Update Reservation**
```http
PATCH /api/reservation
Content-Type: application/json

{
  "reservation_id": 1,
  "table_id": 2,
  "customer_name": "Alice Smith",
  "customer_phone": "5550123456",
  "party_size": 4,
  "start_time": "2024-05-01T20:00:00Z",
  "duration_minutes": 120
}
```

Returns:
- `200 OK` - Reservation updated successfully
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Reservation not found
- `409 Conflict` - Time slot conflicts with existing reservation

## Known Limitations

- **Single Restaurant Support**: Currently supports only one restaurant per deployment. Multi-tenant support would require schema changes.
- **No Authentication**: All endpoints are publicly accessible. Production deployments should implement authentication/authorization.
- **SQLite Concurrency**: SQLite has limited write concurrency. High-traffic deployments should migrate to PostgreSQL.
- **No Notification System**: Waitlisted reservations lack automated notifications when tables become available.

## Future Improvements

- **Authentication & Authorization**: Implement JWT-based auth with role-based access control (admin, staff, customer).
- **Real-time Updates**: Add WebSocket support for live table availability and reservation status updates.
- **Notification System**: Email/SMS notifications for confirmations, reminders, and waitlist updates.
- **Enhanced Reservation Management**: Support for cancellations, modifications, no-show tracking, and recurring bookings.

## Scaling for Multiple Restaurants

To support multiple restaurants, implement a multi-tenant architecture:

**Database Schema Changes**
- Add a `restaurants` table as the parent entity with unique identifiers
- Add `restaurant_id` foreign key to `tables` and `reservations` tables
- Create composite indexes on `(restaurant_id, table_number)` and `(restaurant_id, date)`

**API Changes**
- Introduce restaurant context via subdomain (`bistro.tallie.app`) or path prefix (`/api/restaurants/:id/tables`)
- Add middleware to extract and validate `restaurant_id` from request context
- Scope all queries to include `WHERE restaurant_id = ?` for data isolation

**Access Control**
- Implement role-based permissions (super admin, restaurant owner, staff)
- Ensure users can only access data for restaurants they're authorized to manage
- Add tenant-level API keys or JWT claims containing `restaurant_id`

**Performance Considerations**
- Migrate from SQLite to PostgreSQL for better concurrent write handling
- Add database connection pooling per tenant
- Implement caching layer (Redis) with tenant-aware cache keys
- Consider database sharding or separate schemas per restaurant for very large scales

## Docker Deployment

```bash
docker compose up --build -d
```

Ensure your `.env` file is configured before running.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production server |
| `pnpm test` | Run tests |
| `pnpm db:studio` | Open database UI |
| `pnpm lint` | Lint code |
| `pnpm format` | Format code |

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **ORM**: Drizzle ORM
- **Database**: SQLite/LibSQL
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Language**: TypeScript

## License

ISC