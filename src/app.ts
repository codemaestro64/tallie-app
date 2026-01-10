import express, { type Express, Request, Response, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import { env } from "./env"

import { errorHandlerMiddleware, requestLoggerMiddleware } from "./middleware"

import restaurantRoutes from "./routes/restaurant.routes"
import reservationRoutes from "./routes/reservation.routes"


const app: Express = express();

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
    origin: env.CORS_ORIGINS ?? "*", // fallback to "*" if undefined
  })
)

// Routes
app.use("/restaurants", restaurantRoutes)
app.use("/reservations", reservationRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" })
})

export default app;
