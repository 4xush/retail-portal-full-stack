import { Router } from 'express';
import * as orders from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrderValidators } from '../validators/order.validators.js';

const r = Router();

r.use(authenticate, requireRole('user'));

r.get('/', asyncHandler(orders.listOrders));
r.get('/:id', asyncHandler(orders.getOrderById));
r.post('/', createOrderValidators, asyncHandler(orders.createOrder));
r.post('/:id/reorder', asyncHandler(orders.reorder));

export default r;
