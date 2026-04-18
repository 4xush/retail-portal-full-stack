import { api } from './axiosInstance';
import type { Product } from '../types';

export async function fetchProducts(params: {
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}) {
  const { data } = await api.get<{
    success: boolean;
    data: Product[];
    meta?: { page: number; limit: number; total: number };
  }>('/api/products', { params });
  return data;
}

export async function fetchProductById(id: string) {
  const { data } = await api.get<{ success: boolean; data: Product }>(`/api/products/${id}`);
  return data.data;
}
