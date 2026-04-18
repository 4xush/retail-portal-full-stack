import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { validationResult } from 'express-validator';
import path from 'path';

export async function listCategories(_req: Request, res: Response): Promise<void> {
  const cats = await Category.find({ isActive: true }).sort({ createdAt: 1 }).lean();
  const counts = await Product.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const data = cats.map((c) => ({
    ...c,
    id: String(c._id),
    productCount: countMap.get(String(c._id)) ?? 0,
  }));
  sendSuccess(res, data);
}

export async function getCategoryBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) {
    sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found', 404);
    return;
  }
  const products = await Product.find({
    category: category._id,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  sendSuccess(res, {
    category: { ...category, id: String(category._id) },
    products: products.map((p) => ({ ...p, id: String(p._id) })),
  });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const { name, description } = req.body as { name: string; description?: string };
  const logoFile = req.file;
  const logo = logoFile ? `/uploads/${path.basename(logoFile.path)}` : undefined;
  const cat = await Category.create({ name, description, logo });
  sendSuccess(res, { ...cat.toObject(), id: String(cat._id) }, 201);
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cat = await Category.findById(id);
  if (!cat) {
    sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found', 404);
    return;
  }
  const { name, description } = req.body as { name?: string; description?: string };
  if (name) cat.name = name;
  if (description !== undefined) cat.description = description;
  if (req.file) {
    cat.logo = `/uploads/${path.basename(req.file.path)}`;
  }
  await cat.save();
  sendSuccess(res, { ...cat.toObject(), id: String(cat._id) });
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cat = await Category.findById(id);
  if (!cat) {
    sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found', 404);
    return;
  }
  cat.isActive = false;
  await cat.save();
  sendSuccess(res, { ok: true });
}
