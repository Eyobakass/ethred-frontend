import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({}),
}));

import { useAuthStore } from '@/store/useAuthStore';

const mockUser = { id: 'u1', email: 'test@example.com', role: 'BUYER' } as any;

const makeJwt = (expSeconds: number) => {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const payload = btoa(JSON.stringify({ sub: 'u1', exp: expSeconds }));
  return `${header}.${payload}.sig`;
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    tokenExpiresAt: null,
  });
});

describe('useAuthStore — setAuth', () => {
  it('sets user, token, and isAuthenticated to true', () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) + 3600);
    useAuthStore.getState().setAuth(mockUser, token);
    const s = useAuthStore.getState();
    expect(s.user).toEqual(mockUser);
    expect(s.token).toBe(token);
    expect(s.isAuthenticated).toBe(true);
  });

  it('extracts tokenExpiresAt from JWT exp claim', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt(futureExp);
    useAuthStore.getState().setAuth(mockUser, token);
    expect(useAuthStore.getState().tokenExpiresAt).toBe(futureExp * 1000);
  });

  it('handles malformed JWT without crashing', () => {
    expect(() => useAuthStore.getState().setAuth(mockUser, 'not.a.jwt')).not.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().tokenExpiresAt).toBeNull();
  });
});

describe('useAuthStore — logout', () => {
  it('clears all auth state on logout', () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) + 3600);
    useAuthStore.getState().setAuth(mockUser, token);
    useAuthStore.getState().logout();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
    expect(s.isAuthenticated).toBe(false);
    expect(s.tokenExpiresAt).toBeNull();
  });
});

describe('useAuthStore — updateUser', () => {
  it('merges partial fields into existing user', () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) + 3600);
    useAuthStore.getState().setAuth(mockUser, token);
    useAuthStore.getState().updateUser({ email: 'new@example.com' } as any);
    const s = useAuthStore.getState();
    expect(s.user?.email).toBe('new@example.com');
    expect(s.user?.id).toBe('u1');
  });

  it('does nothing when user is null', () => {
    useAuthStore.getState().updateUser({ email: 'x@y.com' } as any);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('useAuthStore — isTokenExpired', () => {
  it('returns false for a valid future token (>60s away)', () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) + 7200);
    useAuthStore.getState().setAuth(mockUser, token);
    expect(useAuthStore.getState().isTokenExpired()).toBe(false);
  });

  it('returns true for an already-expired token', () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) - 100);
    useAuthStore.getState().setAuth(mockUser, token);
    expect(useAuthStore.getState().isTokenExpired()).toBe(true);
  });

  it('returns true when token expires within 60s (safety buffer)', () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) + 30);
    useAuthStore.getState().setAuth(mockUser, token);
    expect(useAuthStore.getState().isTokenExpired()).toBe(true);
  });

  it('returns false when tokenExpiresAt is null (no expiry info — assume valid)', () => {
    useAuthStore.setState({ tokenExpiresAt: null });
    expect(useAuthStore.getState().isTokenExpired()).toBe(false);
  });
});
