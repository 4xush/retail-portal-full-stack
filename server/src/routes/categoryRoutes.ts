import { Router } from 'express';
import { body } from 'express-validator';
import * as cat from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const r = Router();

r.get('/', asyncHandler(cat.listCategories));
r.get('/:slug', asyncHandler(cat.getCategoryBySlug));

const adminValidators = [body('name').trim().notEmpty().withMessage('Name is required')];

r.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.single('logo'),
  adminValidators,
  asyncHandler(cat.createCategory)
);
r.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  upload.single('logo'),
  asyncHandler(cat.updateCategory)
);
r.delete('/:id', authenticate, requireRole('admin'), asyncHandler(cat.deleteCategory));

export default r;
