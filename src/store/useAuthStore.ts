// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth.types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  tokenExpiresAt: number | null; // Unix timestamp in ms
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  isTokenExpired: () => boolean;
}

// Use zustand/middleware persist for SSR-safe localStorage. This eliminates
// the direct `localStorage.getItem` call at module evaluation time that crashed
// during server-side rendering.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      tokenExpiresAt: null,

      setAuth: (user, token) => {
        // Decode exp from JWT payload (base64 middle segment)
        let expiresAt: number | null = null;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          expiresAt = payload.exp ? payload.exp * 1000 : null; // convert seconds → ms
        } catch {
          // Invalid JWT format — ignore expiry tracking
        }
        set({ user, token, isAuthenticated: true, tokenExpiresAt: expiresAt });
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, tokenExpiresAt: null });
      },

      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return false; // no expiry info — assume valid
        return Date.now() > tokenExpiresAt - 60_000; // expire 60s early for safety
      },
    }),
    {
      name: 'ethred_auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist token, user, and expiry
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
      // Re-hydrate isAuthenticated from persisted token, but check expiry
      onRehydrateStorage: () => (state) => {
        if (state && state.token && state.user) {
          // If token is already expired, clear auth immediately
          if (state.tokenExpiresAt && Date.now() > state.tokenExpiresAt - 60_000) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiresAt = null;
          } else {
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
);
