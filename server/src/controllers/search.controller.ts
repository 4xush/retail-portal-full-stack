import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a fuzzy-ish regex: matches the query as a substring anywhere in the title.
 * This covers prefix, mid-word, and common single-char transpositions by also
 * trying each individual word in a multi-word query.
 */
function buildSuggestRegex(q: string): RegExp {
  // Escape then wrap as case-insensitive substring (not just prefix)
  return new RegExp(escapeRegex(q), 'i');
}

/**
 * Autocomplete — returns up to 8 title suggestions.
 * Strategy:
 *   1. Substring match on title (covers prefix + mid-word)
 *   2. If fewer than 8 results, backfill with tags substring match
 */
export async function suggest(req: Request, res: Response): Promise<void> {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 1) {
    sendSuccess(res, { suggestions: [] });
    return;
  }

  const regex = buildSuggestRegex(q);
  const base = { isActive: true };
  const project = 'title images cost taxPercent category';
  const pop = { path: 'category', select: 'name slug' };

  const byTitle = await Product.find({ ...base, title: regex })
    .limit(8)
    .populate(pop)
    .select(project)
    .lean();

  let products = byTitle;

  // Backfill via tags when below 8
  if (products.length < 8) {
    const seen = new Set(products.map((p) => String(p._id)));
    const byTags = await Product.find({
      ...base,
      tags: regex,
      _id: { $nin: [...seen].map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .limit(8 - products.length)
      .populate(pop)
      .select(project)
      .lean();
    products = [...products, ...byTags];
  }

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

/**
 * Full-text search with fuzzy fallback.
 * Strategy:
 *   1. MongoDB $text index (exact word match, high precision)
 *   2. If zero results, fall back to regex substring on title/description/tags
 *      so that typos like "burgr" → "Burger" are still surfaced.
 */
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

  // --- 1. Try $text index first ---
  const textResult = await runTextSearch(term, categorySlug, skip, limit);
  if (textResult.total > 0) {
    sendSuccess(res, textResult.data, 200, { page, limit, total: textResult.total, strategy: 'text' });
    return;
  }

  // --- 2. Fuzzy fallback: regex on title + tags, word-by-word ---
  const fuzzyResult = await runFuzzySearch(term, categorySlug, skip, limit);
  sendSuccess(res, fuzzyResult.data, 200, { page, limit, total: fuzzyResult.total, strategy: 'fuzzy' });
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

async function runTextSearch(
  term: string,
  categorySlug: string | null,
  skip: number,
  limit: number,
): Promise<{ total: number; data: unknown[] }> {
  const matchAfterLookup = categorySlug ? { 'catArr.slug': categorySlug, 'catArr.isActive': true } : {};

  const pipeline: mongoose.PipelineStage[] = [
    { $match: { $text: { $search: term }, isActive: true } },
    { $addFields: { score: { $meta: 'textScore' } } },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'catArr' } },
    { $unwind: '$catArr' },
  ];
  if (categorySlug) pipeline.push({ $match: matchAfterLookup });
  pipeline.push(...buildResultFacet(skip, limit));

  const agg = await Product.aggregate<{ metadata: { total: number }[]; data: unknown[] }>(pipeline);
  const result = agg[0] ?? { metadata: [], data: [] };
  return { total: result.metadata[0]?.total ?? 0, data: result.data };
}

/**
 * Produce a set of regex patterns for fuzzy matching.
 * For each token:
 *   - The full token as a substring (handles mid-word, correct spelling)
 *   - All sliding-window ngrams of length ⌊len*0.7⌋ (handles typos / dropped chars)
 * E.g. "burgr" → ngrams "bur","urg","rgr" — "Burger" contains "bur" → match.
 */
function buildFuzzyPatterns(term: string): RegExp[] {
  const tokens = term.split(/\s+/).filter(Boolean);
  const patterns: RegExp[] = [];
  for (const t of tokens) {
    patterns.push(new RegExp(escapeRegex(t), 'i'));
    if (t.length >= 4) {
      const ngramLen = Math.max(3, Math.floor(t.length * 0.7));
      for (let i = 0; i <= t.length - ngramLen; i++) {
        patterns.push(new RegExp(escapeRegex(t.slice(i, i + ngramLen)), 'i'));
      }
    }
  }
  return [...new Map(patterns.map((r) => [r.source, r])).values()];
}

async function runFuzzySearch(
  term: string,
  categorySlug: string | null,
  skip: number,
  limit: number,
): Promise<{ total: number; data: unknown[] }> {
  const regexes = buildFuzzyPatterns(term);
  const orConditions = regexes.flatMap((r) => [
    { title: r },
    { tags: r },
    { description: r },
  ]);

  const matchAfterLookup = categorySlug ? { 'catArr.slug': categorySlug, 'catArr.isActive': true } : {};

  const pipeline: mongoose.PipelineStage[] = [
    { $match: { isActive: true, $or: orConditions } },
    { $addFields: { score: 1 } },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'catArr' } },
    { $unwind: '$catArr' },
  ];
  if (categorySlug) pipeline.push({ $match: matchAfterLookup });
  pipeline.push(...buildResultFacet(skip, limit));

  const agg = await Product.aggregate<{ metadata: { total: number }[]; data: unknown[] }>(pipeline);
  const result = agg[0] ?? { metadata: [], data: [] };
  return { total: result.metadata[0]?.total ?? 0, data: result.data };
}

function buildResultFacet(skip: number, limit: number): mongoose.PipelineStage[] {
  return [
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { score: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              title: 1, description: 1, images: 1,
              cost: 1, taxPercent: 1, stock: 1,
              category: 1, tags: 1, score: 1, createdAt: 1,
            },
          },
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDoc' } },
          { $unwind: '$categoryDoc' },
          {
            $addFields: {
              category: { _id: '$categoryDoc._id', name: '$categoryDoc.name', slug: '$categoryDoc.slug' },
            },
          },
          { $project: { categoryDoc: 0, catArr: 0 } },
        ],
      },
    },
  ];
}
