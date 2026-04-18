import { api } from './axiosInstance';
import type { User } from '../types';

export async function signup(body: { name: string; email: string; password: string }) {
  const { data } = await api.post<{
    success: boolean;
    data: { user: User; accessToken: string; refreshToken: string; apiKey: string };
  }>('/api/auth/signup', body);
  return data;
}

export async function login(body: { email: string; password: string }) {
  const { data } = await api.post<{
    success: boolean;
    data: { user: User; accessToken: string; refreshToken: string };
  }>('/api/auth/login', body);
  return data;
}

export async function logout(refreshToken: string) {
  await api.post('/api/auth/logout', { refreshToken });
}
