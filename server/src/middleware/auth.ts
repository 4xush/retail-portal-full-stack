import type { RequestHandler } from 'express';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      req.user = verifyAccessToken(token);
      next();
    } catch (e) {
      next(e);
    }
    return;
  }

  if (apiKey) {
    try {
      const user = await User.findOne({ apiKey, isActive: true }).lean();
      if (!user) {
        sendError(res, 'INVALID_TOKEN', 'Invalid API key', 401);
        return;
      }
      req.user = { id: String(user._id), role: user.role as 'admin' | 'user' };
      next();
    } catch (e) {
      next(e);
    }
    return;
  }

  sendError(res, 'INVALID_TOKEN', 'Authentication required', 401);
};
