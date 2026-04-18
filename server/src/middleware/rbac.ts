import type { RequestHandler } from 'express';
import { sendError } from '../utils/apiResponse.js';

export function requireRole(...roles: string[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      sendError(res, 'INVALID_TOKEN', 'Authentication required', 401);
      return;
    }
    if (roles.includes(req.user.role)) {
      next();
      return;
    }
    sendError(res, 'FORBIDDEN', 'Insufficient permissions', 403);
  };
}
