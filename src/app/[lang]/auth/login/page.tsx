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
  const setAuth = useAuthStore((state) => state.setAuth);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res: any = await authService.loginWithPassword(phone, password);
      if (res.jwt && res.user) {
        setAuth(res.user, res.jwt);
        router.push(`/${lang}`);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <span className="text-black font-extrabold text-xl">E</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {lang === 'am' ? 'ወደ መለያዎ ይግቡ' : 'Sign In to Ethred'}
          </h1>
          <p className="text-xs text-neutral-400">
            Enter your registered Ethiopian phone number to continue.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Phone Number (+251...)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251911223344"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-lg shadow-gold-500/20 transition"
          >
            {loading ? 'Authenticating...' : lang === 'am' ? 'ግባ' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-400">
          Don't have an account?{' '}
          <Link href={`/${lang}/auth/register`} className="text-gold-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
