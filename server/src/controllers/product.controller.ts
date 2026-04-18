import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { StockHistory } from '../models/StockHistory.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { validationResult } from 'express-validator';
import path from 'path';

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function parseObjectIds(raw: unknown): mongoose.Types.ObjectId[] {
  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map((id) => new mongoose.Types.ObjectId(String(id)));
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(id));
  }
  return [];
}

export async function listProducts(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 8));
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortField = sortBy === 'cost' ? 'cost' : 'createdAt';
  const sortOrder = sortField === 'createdAt' ? -1 : 1;
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.category) {
    const cat = await Category.findOne({ slug: String(req.query.category), isActive: true });
    if (!cat) {
      sendSuccess(res, [], 200, { page, limit, total: 0 });
      return;
    }
    filter.category = cat._id;
  }
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name slug logo')
    .lean();
  sendSuccess(
    res,
    products.map((p) => ({ ...p, id: String(p._id) })),
    200,
    { page, limit, total }
  );
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const p = await Product.findById(req.params.id)
    .populate('category', 'name slug logo')
    .populate('addOns')
    .populate('combos')
    .lean();
  if (!p || !p.isActive) {
    sendError(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
    return;
  }
  sendSuccess(res, { ...p, id: String(p._id) });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const body = req.body as Record<string, string>;
  const files = (req.files as Express.Multer.File[]) ?? [];
  const images = files.map((f) => `/uploads/${path.basename(f.path)}`);
  const category = await Category.findById(body.category);
  if (!category) {
    sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found', 404);
    return;
  }
  const product = await Product.create({
    title: body.title,
    description: body.description ?? '',
    cost: Number(body.cost),
    taxPercent: Number(body.taxPercent ?? 0),
    category: category._id,
    stock: Number(body.stock ?? 0),
    tags: parseTags(body.tags),
    images,
    addOns: parseObjectIds(body.addOns),
    combos: parseObjectIds(body.combos),
  });
  const populated = await Product.findById(product._id)
    .populate('category')
    .populate('addOns')
    .populate('combos')
    .lean();
  sendSuccess(res, { ...populated, id: String(populated!._id) }, 201);
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    sendError(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
    return;
  }
  const body = req.body as Record<string, string>;
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (body.title) product.title = body.title;
  if (body.description !== undefined) product.description = body.description;
  if (body.cost !== undefined) product.cost = Number(body.cost);
  if (body.taxPercent !== undefined) product.taxPercent = Number(body.taxPercent);
  if (body.stock !== undefined) product.stock = Number(body.stock);
  if (body.category) {
    const cat = await Category.findById(body.category);
    if (!cat) {
      sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found', 404);
      return;
    }
    product.category = cat._id;
  }
  if (body.tags !== undefined) product.tags = parseTags(body.tags);
  if (body.addOns !== undefined) product.addOns = parseObjectIds(body.addOns);
  if (body.combos !== undefined) product.combos = parseObjectIds(body.combos);
  if (files.length > 0) {
    product.images = files.map((f) => `/uploads/${path.basename(f.path)}`);
  }
  await product.save();
  const populated = await Product.findById(product._id)
    .populate('category')
    .populate('addOns')
    .populate('combos')
    .lean();
  sendSuccess(res, { ...populated, id: String(populated!._id) });
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const product = await Product.findById(req.params.id);
  if (!product) {
    sendError(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
    return;
  }
  product.isActive = false;
  await product.save();
  sendSuccess(res, { ok: true });
}

export async function patchStock(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const { delta, reason } = req.body as { delta: number; reason: string };
  const userId = req.user!.id;
  const product = await Product.findById(req.params.id);
  if (!product) {
    sendError(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
    return;
  }
  const stockBefore = product.stock;
  const stockAfter = stockBefore + delta;
  if (stockAfter < 0) {
    sendError(res, 'INSUFFICIENT_STOCK', 'Stock cannot go below zero', 400);
    return;
  }
  product.stock = stockAfter;
  await product.save();
  await StockHistory.create({
    product: product._id,
    delta,
    reason,
    updatedBy: new mongoose.Types.ObjectId(userId),
    stockBefore,
    stockAfter,
  });
  sendSuccess(res, { ...product.toObject(), id: String(product._id) });
}
