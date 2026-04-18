import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { DiscountCode } from '../models/DiscountCode.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

async function deductStock(productId: mongoose.Types.ObjectId, qty: number): Promise<boolean> {
  const updated = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: qty }, isActive: true },
    { $inc: { stock: -qty } },
    { new: true }
  );
  return !!updated;
}

async function restoreStock(productId: mongoose.Types.ObjectId, qty: number): Promise<void> {
  await Product.updateOne({ _id: productId }, { $inc: { stock: qty } });
}

export async function listOrders(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
  const status = req.query.status ? String(req.query.status) : undefined;
  const filter: Record<string, unknown> = { user: new mongoose.Types.ObjectId(userId) };
  if (status) filter.status = status;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  sendSuccess(
    res,
    orders.map((o) => ({ ...o, id: String(o._id) })),
    200,
    { page, limit, total }
  );
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const order = await Order.findOne({
    _id: req.params.id,
    user: new mongoose.Types.ObjectId(userId),
  }).lean();
  if (!order) {
    sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    return;
  }
  sendSuccess(res, { ...order, id: String(order._id) });
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const userId = req.user!.id;
  const { items, discountCode } = req.body as {
    items: { productId: string; qty: number }[];
    discountCode?: string;
  };

  if (!items?.length) {
    sendError(res, 'VALIDATION_ERROR', 'items is required', 422);
    return;
  }

  const productIds = items.map((i) => new mongoose.Types.ObjectId(i.productId));
  const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let subtotalPreTax = 0;
  let taxTotal = 0;
  const lineSnapshots: {
    product: mongoose.Types.ObjectId;
    qty: number;
    snapshot: { title: string; cost: number; taxPercent: number; image: string };
  }[] = [];

  for (const line of items) {
    const p = productMap.get(line.productId);
    if (!p) {
      sendError(res, 'PRODUCT_NOT_FOUND', `Product ${line.productId} not found`, 404);
      return;
    }
    if (line.qty < 1) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid quantity', 422);
      return;
    }
    if (p.stock < line.qty) {
      sendError(res, 'INSUFFICIENT_STOCK', `Insufficient stock for ${p.title}`, 400);
      return;
    }
    subtotalPreTax += p.cost * line.qty;
    taxTotal += (p.cost * line.qty * p.taxPercent) / 100;
    lineSnapshots.push({
      product: p._id,
      qty: line.qty,
      snapshot: {
        title: p.title,
        cost: p.cost,
        taxPercent: p.taxPercent,
        image: p.images?.[0] ?? '',
      },
    });
  }

  const preDiscount = subtotalPreTax + taxTotal;

  let discountAmount = 0;
  let appliedCode: string | undefined;
  let discountDocId: mongoose.Types.ObjectId | null = null;

  if (discountCode?.trim()) {
    const code = discountCode.trim().toUpperCase();
    const dc = await DiscountCode.findOne({ code, isActive: true });
    if (!dc) {
      sendError(res, 'DISCOUNT_INVALID', 'Invalid discount code', 400);
      return;
    }
    if (dc.expiresAt && dc.expiresAt < new Date()) {
      sendError(res, 'DISCOUNT_EXPIRED', 'Discount code has expired', 400);
      return;
    }
    if (dc.usageLimit != null && dc.usedCount >= dc.usageLimit) {
      sendError(res, 'DISCOUNT_USAGE_EXCEEDED', 'Discount usage limit exceeded', 400);
      return;
    }
    if (preDiscount < dc.minOrderValue) {
      sendError(res, 'DISCOUNT_INVALID', 'Order does not meet minimum value for this code', 400);
      return;
    }
    if (dc.discountType === 'percent') {
      discountAmount = Math.min(preDiscount, (preDiscount * dc.discountValue) / 100);
    } else {
      discountAmount = Math.min(preDiscount, dc.discountValue);
    }
    appliedCode = dc.code;
    discountDocId = dc._id;
  }

  const total = Math.max(0, preDiscount - discountAmount);

  const deducted: { id: mongoose.Types.ObjectId; qty: number }[] = [];
  try {
    for (const line of items) {
      const ok = await deductStock(new mongoose.Types.ObjectId(line.productId), line.qty);
      if (!ok) {
        throw new AppError('INSUFFICIENT_STOCK', 400, 'Insufficient stock');
      }
      deducted.push({ id: new mongoose.Types.ObjectId(line.productId), qty: line.qty });
    }

    const order = await Order.create({
      user: new mongoose.Types.ObjectId(userId),
      items: lineSnapshots,
      discountCode: appliedCode,
      discountAmount,
      subtotal: subtotalPreTax,
      tax: taxTotal,
      total,
      status: 'pending',
    });

    if (discountDocId) {
      await DiscountCode.updateOne({ _id: discountDocId }, { $inc: { usedCount: 1 } });
    }

    sendSuccess(res, { ...order.toObject(), id: String(order._id) }, 201);
  } catch (e) {
    for (const d of deducted.reverse()) {
      await restoreStock(d.id, d.qty);
    }
    throw e;
  }
}

export async function reorder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const order = await Order.findOne({
    _id: req.params.id,
    user: new mongoose.Types.ObjectId(userId),
  }).lean();
  if (!order) {
    sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    return;
  }
  const cartItems = order.items.map((it) => {
    const snap = it.snapshot ?? { title: '', cost: 0, taxPercent: 0, image: '' };
    return {
      productId: String(it.product),
      title: snap.title,
      image: snap.image,
      cost: snap.cost,
      taxPercent: snap.taxPercent,
      qty: it.qty,
      addOns: [] as unknown[],
    };
  });
  sendSuccess(res, { cartItems });
}
