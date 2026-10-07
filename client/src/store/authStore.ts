import { create } from 'zustand';
import { User } from '../types';
import { api, registerUnauthorizedHandler } from '../api/client';

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

function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem('medicare_token');
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      if (token) localStorage.removeItem('medicare_token');
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getStoredToken(),
  isAuthenticated: false,
  isLoading: !!getStoredToken(),

  setAuth: (user, token) => {
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      localStorage.removeItem('medicare_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }
    localStorage.setItem('medicare_token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('medicare_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await api.get<User>('/auth/me');
      set({ user, token, isAuthenticated: true, isLoading: false });
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

registerUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

