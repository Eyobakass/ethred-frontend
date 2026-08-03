// src/app/[lang]/auth/login/page.tsx
'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang === 'am' ? 'am' : 'en';
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res: any = await authService.login({ email, password });
      if (res?.jwt && res?.user) {
        setAuth(res.user, res.jwt);
        // Role-based redirect
        const role = res.user.role;
        const dest =
          role === 'SELLER' || role === 'AGENCY_ADMIN'
            ? `/${lang}/seller/dashboard`
            : role === 'ADMIN'
            ? `/${lang}/admin/dashboard`
            : `/${lang}`;
        router.push(dest);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center shadow-lg shadow-red-600 dark:shadow-red-600/20 mb-3">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'እንኳን ደህና መጡ!' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {lang === 'am'
              ? 'ወደ ኢትሬድ ለመግባት የኢሜል አድራሻዎን እና የይለፍ ቃልዎን ያስገቡ።'
              : 'Sign in with your email and password to access your account.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {lang === 'am' ? 'የኢሜል አድራሻ' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 dark:border-red-600"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {lang === 'am' ? 'የይለፍ ቃል' : 'Password'}
              </label>
              <button type="button" className="text-[10px] text-red-600 dark:text-red-400 hover:underline">
                {lang === 'am' ? 'የይለፍ ቃል ረስተዋል?' : 'Forgot password?'}
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 dark:border-red-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 dark:bg-red-600 hover:bg-red-500 dark:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600 dark:shadow-red-600/20 transition disabled:opacity-50"
          >
            {loading ? (lang === 'am' ? 'በመግባት ላይ...' : 'Signing In...') : lang === 'am' ? 'ይግቡ' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-600 dark:text-neutral-400">
          {lang === 'am' ? 'አካውንት የለዎትም? ' : "Don't have an account? "}
          <Link href={`/${lang}/auth/register`} className="text-red-600 dark:text-red-400 font-semibold hover:underline">
            {lang === 'am' ? 'እዚህ ይመዝገቡ' : 'Register Here'}
          </Link>
        </div>
      </div>
    </div>
  );
}
