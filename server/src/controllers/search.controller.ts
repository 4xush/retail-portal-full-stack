import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function suggest(req: Request, res: Response): Promise<void> {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 1) {
    sendSuccess(res, { suggestions: [] });
    return;
  }
  const regex = new RegExp(`^${escapeRegex(q)}`, 'i');
  const products = await Product.find({ title: regex, isActive: true })
    .limit(8)
    .populate('category', 'name slug')
    .select('title images cost taxPercent category')
    .lean();
  const suggestions = products.map((p) => {
    const cat = p.category as { name?: string; slug?: string } | null | undefined;
    return {
      _id: p._id,
      title: p.title,
      cost: p.cost,
      taxPercent: p.taxPercent,
      images: p.images,
      category: cat && typeof cat === 'object' && 'name' in cat ? { name: cat.name, slug: cat.slug } : null,
    };
  });
  sendSuccess(res, { suggestions });
}

export async function fullSearch(req: Request, res: Response): Promise<void> {
  const term = String(req.query.q ?? '').trim();
  if (!term) {
    sendError(res, 'VALIDATION_ERROR', 'Query q is required', 422);
    return;
  }
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const skip = (page - 1) * limit;
  const categorySlug = req.query.category ? String(req.query.category) : null;

  const matchAfterLookup = categorySlug
    ? { 'catArr.slug': categorySlug, 'catArr.isActive': true }
    : {};

  const pipeline: mongoose.PipelineStage[] = [
    { $match: { $text: { $search: term }, isActive: true } },
    { $addFields: { score: { $meta: 'textScore' } } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'catArr',
      },
    },
    { $unwind: '$catArr' },
  ];
  if (categorySlug) {
    pipeline.push({ $match: matchAfterLookup });
  }
  pipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [
        { $sort: { score: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            title: 1,
            description: 1,
            images: 1,
            cost: 1,
            taxPercent: 1,
            stock: 1,
            category: 1,
            tags: 1,
            score: 1,
            createdAt: 1,
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDoc',
          },
        },
        { $unwind: '$categoryDoc' },
        {
          $addFields: {
            category: {
              _id: '$categoryDoc._id',
              name: '$categoryDoc.name',
              slug: '$categoryDoc.slug',
            },
          },
        },
        { $project: { categoryDoc: 0 } },
      ],
    },
  });

  const agg = await Product.aggregate<{ metadata: { total: number }[]; data: unknown[] }>(pipeline);
  const result = agg[0] ?? { metadata: [], data: [] };
  const total = result.metadata[0]?.total ?? 0;
  sendSuccess(res, result.data, 200, { page, limit, total });
}
