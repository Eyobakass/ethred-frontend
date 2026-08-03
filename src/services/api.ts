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
  timeout: 15000, // 15s request timeout
});

// ── Request interceptor ─────────────────────────────────────────────────────
// Access the store lazily (inside the request callback) so it is never
// called during SSR module initialisation.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    // Dynamic import to avoid circular SSR issues
    const { useAuthStore } = require('@/store/useAuthStore');
    const token: string | null = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  // Unwrap the data envelope so callers get `res` not `res.data`
  (response) => response.data,

  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      const { useAuthStore } = require('@/store/useAuthStore');
      useAuthStore.getState().logout();
      // Preserve current language prefix in redirect
      const lang = window.location.pathname.startsWith('/am') ? 'am' : 'en';
      window.location.href = `/${lang}/auth/login`;
    }

    // Normalise the error to always expose a `message` string
    const msg =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(msg));
  }
);
