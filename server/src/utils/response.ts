import { Response } from 'express';

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message = 'Request successful',
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message = 'Something went wrong',
  statusCode = 400,
  errors: any[] = []
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
