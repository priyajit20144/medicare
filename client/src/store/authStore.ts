import { create } from 'zustand';
import { User } from '../types';
import { api } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('medicare_token'),
  isAuthenticated: !!localStorage.getItem('medicare_token'),
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('medicare_token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('medicare_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('medicare_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await api.get<User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (e) {
      localStorage.removeItem('medicare_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updated) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updated } });
    }
  },
}));
