import { Request, Response, NextFunction, RequestHandler } from 'express'
import { z, ZodError } from 'zod'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '@/utils/appError.js'

export const validateRequestMiddleware = <T extends z.ZodObject>(schema: T): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as z.infer<T>

      // pass validated data to controller/handler
      if (validated.body) Object.assign(req.body, validated.body)
      if (validated.params) Object.assign(req.params, validated.params)
      if (validated.query) Object.assign(req.query, validated.query)

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        return next(new AppError(message, StatusCodes.BAD_REQUEST))
      }
      next(error)
    }
  }
}
