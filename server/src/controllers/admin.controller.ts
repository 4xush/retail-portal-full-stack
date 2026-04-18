import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { StockHistory } from '../models/StockHistory.js';
import { DiscountCode } from '../models/DiscountCode.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { validationResult } from 'express-validator';

export async function adminListProducts(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const search = req.query.search ? String(req.query.search).trim() : '';
  const categorySlug = req.query.category ? String(req.query.category) : '';
  const isActiveQ = req.query.isActive;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  if (categorySlug) {
    const cat = await Category.findOne({ slug: categorySlug });
    if (cat) filter.category = cat._id;
  }
  if (isActiveQ === 'true') filter.isActive = true;
  if (isActiveQ === 'false') filter.isActive = false;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
  sendSuccess(
    res,
    products.map((p) => ({ ...p, id: String(p._id) })),
    200,
    { page, limit, total }
  );
}

export async function adminListCategories(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const total = await Category.countDocuments({});
  const cats = await Category.find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  sendSuccess(
    res,
    cats.map((c) => ({ ...c, id: String(c._id) })),
    200,
    { page, limit, total }
  );
}

export async function adminStockHistory(req: Request, res: Response): Promise<void> {
  const productId = req.query.product ? String(req.query.product) : '';
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    sendError(res, 'VALIDATION_ERROR', 'product query param is required', 422);
    return;
  }
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const filter = { product: new mongoose.Types.ObjectId(productId) };
  const total = await StockHistory.countDocuments(filter);
  const rows = await StockHistory.find(filter)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('updatedBy', 'name email')
    .lean();
  sendSuccess(
    res,
    rows.map((r) => ({ ...r, id: String(r._id) })),
    200,
    { page, limit, total }
  );
}

export async function adminListUsers(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const total = await User.countDocuments({});
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-passwordHash -refreshToken')
    .lean();
  sendSuccess(
    res,
    users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    })),
    200,
    { page, limit, total }
  );
}

export async function adminListOrders(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const status = req.query.status ? String(req.query.status) : undefined;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name email')
    .lean();
  sendSuccess(
    res,
    orders.map((o) => ({ ...o, id: String(o._id) })),
    200,
    { page, limit, total }
  );
}

export async function adminUpdateOrderStatus(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const { status } = req.body as { status: string };
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).lean();
  if (!order) {
    sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    return;
  }
  sendSuccess(res, { ...order, id: String(order._id) });
}

export async function adminCreateDiscountCode(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const body = req.body as {
    code: string;
    discountType: 'percent' | 'flat';
    discountValue: number;
    minOrderValue?: number;
    usageLimit?: number | null;
    expiresAt?: string | null;
  };
  try {
    const doc = await DiscountCode.create({
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      minOrderValue: body.minOrderValue ?? 0,
      usageLimit: body.usageLimit ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    sendSuccess(res, { ...doc.toObject(), id: String(doc._id) }, 201);
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000) {
      sendError(res, 'DUPLICATE_CODE', 'Discount code already exists', 409);
      return;
    }
    throw e;
  }
}

export async function adminListDiscountCodes(_req: Request, res: Response): Promise<void> {
  const codes = await DiscountCode.find({}).sort({ code: 1 }).lean();
  sendSuccess(res, codes.map((c) => ({ ...c, id: String(c._id) })));
}

export async function adminDashboard(_req: Request, res: Response): Promise<void> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [productCount, categoryCount, userCount, ordersToday] = await Promise.all([
    Product.countDocuments({}),
    Category.countDocuments({}),
    User.countDocuments({}),
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
  ]);
  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'name email')
    .lean();
  sendSuccess(res, {
    stats: { productCount, categoryCount, userCount, ordersToday },
    recentOrders: recentOrders.map((o) => ({ ...o, id: String(o._id) })),
  });
}
