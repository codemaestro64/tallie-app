import type { Request, Response, NextFunction } from "express"
import logger from "../utils/log"

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint()

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000

    logger.info(
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration: durationMs.toFixed(2) + "ms",
      },
      "HTTP request"
    )
  })

  next();
}

