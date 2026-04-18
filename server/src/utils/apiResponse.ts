import type { Response } from 'express';
import type { ErrorCode } from './AppError.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: { page: number; limit: number; total: number }
): void {
  const body: Record<string, unknown> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  code: ErrorCode,
  message: string,
  status: number
): void {
  res.status(status).json({
    success: false,
    error: { code, message, status },
  });
}
