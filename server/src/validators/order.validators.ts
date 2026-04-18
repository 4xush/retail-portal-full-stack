import { body } from 'express-validator';

export const createOrderValidators = [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isMongoId(),
  body('items.*.qty').isInt({ min: 1 }),
  body('discountCode').optional().isString(),
];

export const adminOrderStatusValidators = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
];
