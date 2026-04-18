import { Router } from 'express';
import { body } from 'express-validator';
import * as admin from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminOrderStatusValidators } from '../validators/order.validators.js';

const r = Router();

r.use(authenticate, requireRole('admin'));

r.get('/dashboard', asyncHandler(admin.adminDashboard));
r.get('/products', asyncHandler(admin.adminListProducts));
r.get('/categories', asyncHandler(admin.adminListCategories));
r.get('/stock-history', asyncHandler(admin.adminStockHistory));
r.get('/users', asyncHandler(admin.adminListUsers));
r.get('/orders', asyncHandler(admin.adminListOrders));
r.put(
  '/orders/:id',
  adminOrderStatusValidators,
  asyncHandler(admin.adminUpdateOrderStatus)
);
r.post(
  '/discount-codes',
  [
    body('code').trim().notEmpty(),
    body('discountType').isIn(['percent', 'flat']),
    body('discountValue').isFloat({ min: 0 }),
    body('minOrderValue').optional().isFloat({ min: 0 }),
    body('usageLimit').optional({ nullable: true }).isInt({ min: 1 }),
    body('expiresAt').optional({ nullable: true }).isISO8601(),
  ],
  asyncHandler(admin.adminCreateDiscountCode)
);
r.get('/discount-codes', asyncHandler(admin.adminListDiscountCodes));

export default r;
