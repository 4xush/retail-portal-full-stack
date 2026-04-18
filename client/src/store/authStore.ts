import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('retailportal-refresh', refreshToken);
        set({ user, accessToken });
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => {
        localStorage.removeItem('retailportal-refresh');
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'retailportal-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);
