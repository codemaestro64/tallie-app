import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validateRequestMiddleware = (schema: ZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validates body, query, and params against the provided schema
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Optional: Replace req objects with validated/stripped data
      req.body = validated.body;
      //req.query = validated.query;
      //req.params = validated.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };