import express, { type Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './env.js'

import { errorHandlerMiddleware, requestLoggerMiddleware } from '@/middleware/index.js'

import restaurantRoutes from '@/routes/restaurant.routes.js'
import reservationRoutes from '@/routes/reservation.routes.js'

const app: Express = express()

// Security headers
app.use(helmet())

// Parse JSON bodies
app.use(express.json())

// Register custom middleware
app.use(errorHandlerMiddleware)
app.use(requestLoggerMiddleware)

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGINS ?? '*', // fallback to "*" if undefined
  }),
)

// Routes
app.use('/restaurants', restaurantRoutes)
app.use('/reservations', reservationRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
