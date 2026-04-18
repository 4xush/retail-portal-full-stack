import type { ErrorRequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.status);
    return;
  }
  if (err instanceof jwt.TokenExpiredError) {
    sendError(res, 'TOKEN_EXPIRED', 'Token expired', 401);
    return;
  }
  if (err instanceof jwt.JsonWebTokenError) {
    sendError(res, 'INVALID_TOKEN', 'Invalid token', 401);
    return;
  }
  console.error(err);
  sendError(res, 'INTERNAL_ERROR', 'Internal server error', 500);
};
