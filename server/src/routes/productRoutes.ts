import { Router } from 'express';
import * as prod from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createProductValidators,
  patchStockValidators,
  updateProductValidators,
} from '../validators/product.validators.js';

const r = Router();

r.get('/', asyncHandler(prod.listProducts));
r.get('/:id', asyncHandler(prod.getProductById));

r.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.array('images', 12),
  createProductValidators,
  asyncHandler(prod.createProduct)
);
r.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  upload.array('images', 12),
  updateProductValidators,
  asyncHandler(prod.updateProduct)
);
r.delete('/:id', authenticate, requireRole('admin'), asyncHandler(prod.deleteProduct));
r.patch(
  '/:id/stock',
  authenticate,
  requireRole('admin'),
  patchStockValidators,
  asyncHandler(prod.patchStock)
);

export default r;
