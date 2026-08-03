// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // Use stable selector references so useEffect deps don't change on every render
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  // Validate session on first mount if token exists but user is not loaded
  // We use useCallback so it's stable across renders
  const validateSession = useCallback(async () => {
    if (!token || user) return;
    try {
      const res = await authService.getMe() as any;
      if (res?.user) {
        setAuth(res.user, token);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [token, user, setAuth, logout]);

  // Run session validation once on mount
  // The component using this hook should call validateSession in a useEffect
  return {
    user,
    token,
    isAuthenticated,
    role: user?.role ?? null,
    isSeller: user?.role === 'SELLER',
    isAgencyAdmin: user?.role === 'AGENCY_ADMIN',
    isAgencyAgent: user?.role === 'AGENCY_AGENT',
    isAdmin: user?.role === 'ADMIN',
    isBuyer: user?.role === 'BUYER' || !user?.role,
    validateSession,
    setAuth,
    logout,
  };
};
