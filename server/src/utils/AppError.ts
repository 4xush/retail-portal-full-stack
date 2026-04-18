export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'INVALID_TOKEN'
  | 'FORBIDDEN'
  | 'USER_NOT_FOUND'
  | 'PRODUCT_NOT_FOUND'
  | 'CATEGORY_NOT_FOUND'
  | 'ORDER_NOT_FOUND'
  | 'DUPLICATE_EMAIL'
  | 'DUPLICATE_CODE'
  | 'INSUFFICIENT_STOCK'
  | 'DISCOUNT_INVALID'
  | 'DISCOUNT_EXPIRED'
  | 'DISCOUNT_USAGE_EXCEEDED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message?: string
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}
