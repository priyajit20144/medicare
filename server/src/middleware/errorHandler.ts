import { Request, Response, NextFunction } from 'express';
import { isDev } from '../config/env';
import { sendError } from '../utils/response';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isDev) {
    console.error('[Error Handler]', err);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File size exceeds the allowed limit (max 10MB)', 400);
      return;
    }
    sendError(res, `File upload error: ${err.message}`, 400);
    return;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendError(res, `A record with this ${field} already exists.`, 409);
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, `Invalid resource identifier: ${err.value}`, 400);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Validation error on database operation', 422, messages);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = isDev
    ? err.message || 'Internal Server Error'
    : statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : err.message;

  sendError(res, message, statusCode, isDev ? [err.stack] : []);
}
