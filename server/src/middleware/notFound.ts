import type { RequestHandler } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const notFound: RequestHandler = (_req, res) => {
  sendError(res, 'INTERNAL_ERROR', 'Route not found', 404);
};

