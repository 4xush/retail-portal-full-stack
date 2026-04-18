import { api } from './axiosInstance';

export async function fetchAdminDashboard() {
  const { data } = await api.get<{ success: boolean; data: unknown }>('/api/admin/dashboard');
  return data.data;
}

export async function fetchAdminProducts(params: Record<string, string | number | undefined>) {
  const { data } = await api.get('/api/admin/products', { params });
  return data as { success: boolean; data: unknown[]; meta?: { page: number; limit: number; total: number } };
}

export async function fetchAdminCategories(params?: { page?: number; limit?: number }) {
  const { data } = await api.get('/api/admin/categories', { params });
  return data as { success: boolean; data: unknown[]; meta?: { page: number; limit: number; total: number } };
}

export async function fetchStockHistory(productId: string, page = 1) {
  const { data } = await api.get('/api/admin/stock-history', { params: { product: productId, page } });
  return data as { success: boolean; data: unknown[]; meta?: { page: number; limit: number; total: number } };
}

export async function fetchAdminUsers(page = 1) {
  const { data } = await api.get('/api/admin/users', { params: { page } });
  return data as { success: boolean; data: unknown[]; meta?: { page: number; limit: number; total: number } };
}

export async function fetchAdminOrders(params?: { page?: number; limit?: number; status?: string }) {
  const { data } = await api.get('/api/admin/orders', { params });
  return data as { success: boolean; data: unknown[]; meta?: { page: number; limit: number; total: number } };
}

export async function updateAdminOrderStatus(id: string, status: string) {
  const { data } = await api.put(`/api/admin/orders/${id}`, { status });
  return data;
}

export async function fetchDiscountCodes() {
  const { data } = await api.get('/api/admin/discount-codes');
  return data as { success: boolean; data: unknown[] };
}

export async function createDiscountCode(body: Record<string, unknown>) {
  const { data } = await api.post('/api/admin/discount-codes', body);
  return data;
}

export async function createCategory(formData: FormData) {
  const { data } = await api.post('/api/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateCategory(id: string, formData: FormData) {
  const { data } = await api.put(`/api/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/api/categories/${id}`);
}

export async function createProduct(formData: FormData) {
  const { data } = await api.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProduct(id: string, formData: FormData) {
  const { data } = await api.put(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProduct(id: string) {
  await api.delete(`/api/products/${id}`);
}

export async function patchProductStock(id: string, body: { delta: number; reason: string }) {
  const { data } = await api.patch(`/api/products/${id}/stock`, body);
  return data;
}
