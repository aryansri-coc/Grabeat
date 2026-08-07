import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error encountered:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.errors, err.statusCode);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', formattedErrors, 400);
  }

  // Handle Prisma errors
  if (err.code) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return sendError(
        res,
        `Duplicate field value: ${err.meta?.target || 'unknown field'}`,
        [],
        400
      );
    }
    // Foreign key violation
    if (err.code === 'P2003') {
      return sendError(res, 'Foreign key constraint failed', [], 400);
    }
    // Record not found
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found', [], 404);
    }
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    process.env.NODE_ENV === 'development' ? [err.stack] : [],
    statusCode
  );
};
