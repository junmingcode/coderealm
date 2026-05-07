import { create } from 'zustand';
import { authApi } from '../api/auth';

interface AuthState {
  isAuthenticated: boolean;
  initialized: boolean;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  initialized: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  checkAuth: async () => {
    try {
      await authApi.me();
      set({ isAuthenticated: true, initialized: true });
    } catch {
      set({ isAuthenticated: false, initialized: true });
    }
  },
}));
