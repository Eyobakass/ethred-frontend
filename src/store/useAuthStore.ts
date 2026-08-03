// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth.types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

// Use zustand/middleware persist for SSR-safe localStorage. This eliminates
// the direct `localStorage.getItem` call at module evaluation time that crashed
// during server-side rendering.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'ethred_auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist token & user, not derived isAuthenticated
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-hydrate isAuthenticated from persisted token
      onRehydrateStorage: () => (state) => {
        if (state && state.token && state.user) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
