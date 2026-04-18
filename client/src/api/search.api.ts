import { api } from './axiosInstance';
import type { Product } from '../types';

export async function fetchSuggestions(q: string) {
  const { data } = await api.get<{
    success: boolean;
    data: { suggestions: Product[] };
  }>('/api/search/suggest', { params: { q } });
  return data.data.suggestions;
}

export async function fetchSearch(params: {
  q: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<{
    success: boolean;
    data: Product[];
    meta?: { page: number; limit: number; total: number };
  }>('/api/search', { params });
  return data;
}
