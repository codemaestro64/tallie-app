import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async Express middleare/controller to catch rejections
 * and forward them to the global error handler.
 */
export const catchAsync = <P, ResB, ReqB, ReqQ>(
  fn: (
    req: Request<P, ResB, ReqB, ReqQ>,
    res: Response<ResB>,
    next: NextFunction,
  ) => Promise<unknown>,
): RequestHandler<P, ResB, ReqB, ReqQ> => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
