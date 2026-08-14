// src/app/[lang]/auth/forgot-password/page.tsx
'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo / Title */}
          <div className="text-center space-y-1">
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">🔑 Ethred</div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
              {sent ? 'Check your email' : 'Reset your password'}
            </h1>
            <p className="text-xs text-neutral-500">
              {sent
                ? `We sent a password reset link to ${email}.`
                : 'Enter your email and we will send you a reset link.'}
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Mail className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
                If an account with that email exists, you will receive a link shortly. Check your spam folder too.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                Send to a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">⚠️ {error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold text-sm transition shadow-lg shadow-red-600/20"
              >
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <Link
            href={`/${lang}/auth/login`}
            className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
          >
            <ArrowLeft size={13} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
