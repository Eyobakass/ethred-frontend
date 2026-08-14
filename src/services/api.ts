// src/services/api.ts
// NOTE: axios is imported lazily-initialized; the auth store is accessed only
// at request time (not at module evaluation), making this fully SSR-compatible.
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60000, // 60s request timeout to accommodate Render cold starts/deployments
});

// ── Token refresh state ──────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processRefreshQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// ── Request interceptor ─────────────────────────────────────────────────────
// Access the store lazily (inside the request callback) so it is never
// called during SSR module initialisation.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    // Dynamic import to avoid circular SSR issues
    const { useAuthStore } = require('@/store/useAuthStore');
    const token: string | null = useAuthStore.getState().token;
    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// ── Response interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  // Unwrap the data envelope so callers get `res` not `res.data`
  (response) => response.data,

  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // ── Token refresh on 401 ────────────────────────────────────────────────
    if (status === 401 && typeof window !== 'undefined' && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is in flight — queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest._retry = true;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh using httpOnly refresh token cookie
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken: string = (refreshResponse.data as any)?.token || (refreshResponse as any)?.token;

        if (newToken) {
          const { useAuthStore } = require('@/store/useAuthStore');
          const { user } = useAuthStore.getState();
          if (user) {
            useAuthStore.getState().setAuth(user, newToken);
          }
          processRefreshQueue(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — log out and redirect
        processRefreshQueue(null);
        isRefreshing = false;
      }

      // Refresh failed or no token — logout
      const { useAuthStore } = require('@/store/useAuthStore');
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes('/auth/login')) {
        const lang = window.location.pathname.startsWith('/am') ? 'am' : 'en';
        window.location.href = `/${lang}/auth/login`;
      }
    }

    // Normalise the error to always expose a `message` string
    const msg =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(msg));
  }
);
