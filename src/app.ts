import express, { type Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './env.js'

import { errorHandlerMiddleware, requestLoggerMiddleware } from '@/middleware/index.js'

import restaurantRoutes from '@/routes/restaurant.routes.js'
import reservationRoutes from '@/routes/reservation.routes.js'
import tableRoutes from '@/routes/table.routes.js'

const app: Express = express()

app.use(helmet())
app.use(express.json())
app.use(requestLoggerMiddleware)
app.use(cors({ origin: env.CORS_ORIGINS ?? '*' }))

// Routes
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/tables', tableRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})
app.use(errorHandlerMiddleware)

export default app
