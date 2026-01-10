import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/utils/appError.js'
import logger from '@/utils/log.js'
import { NodeEnv } from '@/types/general.types.js'

export const errorHandlerMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500
  let status = 'error'
  let message = 'Something went very wrong!'

  // Check if it's custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode
    status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    message = err.message
  }

  // Leak everything for easier debugging
  if (process.env.NODE_ENV === NodeEnv.Development) {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
      error: err,
    })
  }

  // If it's a known operational error, send the message
  if (err instanceof AppError && err.isOperational) {
    return res.status(statusCode).json({
      status,
      message,
    })
  }

  // Unexpected/Generic crash
  const errObj = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
  }
  logger.error(JSON.stringify(errObj))

  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  })
}
