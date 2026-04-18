import { body, param } from 'express-validator';

export const createProductValidators = [
  body('title').trim().notEmpty(),
  body('cost').isFloat({ min: 0 }),
  body('taxPercent').optional().isFloat({ min: 0, max: 100 }),
  body('category').notEmpty().isMongoId(),
  body('stock').optional().isInt({ min: 0 }),
];

export const updateProductValidators = [
  param('id').isMongoId(),
  body('title').optional().trim().notEmpty(),
  body('cost').optional().isFloat({ min: 0 }),
  body('taxPercent').optional().isFloat({ min: 0, max: 100 }),
  body('category').optional().isMongoId(),
  body('stock').optional().isInt({ min: 0 }),
];

export const patchStockValidators = [
  param('id').isMongoId(),
  body('delta').isNumeric(),
  body('reason').trim().notEmpty(),
];
