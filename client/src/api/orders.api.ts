import { api } from './axiosInstance';
import type { Order } from '../types';

export async function fetchOrders(params?: { page?: number; limit?: number; status?: string }) {
  const { data } = await api.get<{
    success: boolean;
    data: Order[];
    meta?: { page: number; limit: number; total: number };
  }>('/api/orders', { params });
  return data;
}

export async function fetchOrderById(id: string) {
  const { data } = await api.get<{ success: boolean; data: Order }>(`/api/orders/${id}`);
  return data.data;
}

export async function placeOrder(body: {
  items: { productId: string; qty: number }[];
  discountCode?: string;
}) {
  const { data } = await api.post<{ success: boolean; data: Order }>('/api/orders', body);
  return data;
}

export async function reorder(orderId: string) {
  const { data } = await api.post<{
    success: boolean;
    data: { cartItems: unknown[] };
  }>(`/api/orders/${orderId}/reorder`);
  return data.data as { cartItems: unknown[] };
}
