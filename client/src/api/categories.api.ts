import { api } from './axiosInstance';
import type { Category, Product } from '../types';

export async function fetchCategories() {
  const { data } = await api.get<{ success: boolean; data: Category[] }>('/api/categories');
  return data.data;
}

export async function fetchCategoryBySlug(slug: string) {
  const { data } = await api.get<{
    success: boolean;
    data: { category: Category; products: Product[] };
  }>(`/api/categories/${slug}`);
  return data.data;
}
