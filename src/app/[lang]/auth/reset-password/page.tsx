// src/app/[lang]/auth/reset-password/page.tsx
'use client';

import React, { useState, use, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function ResetPasswordContent({ lang }: { lang: 'en' | 'am' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => router.push(`/${lang}/auth/login`), 2500);
      return () => clearTimeout(t);
    }
  }, [success, router, lang]);

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-base font-bold text-neutral-900 dark:text-white">Invalid or expired link</p>
        <p className="text-xs text-neutral-500">This password reset link is invalid or has expired.</p>
        <Link
          href={`/${lang}/auth/forgot-password`}
          className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
      <div className="text-center space-y-1">
        <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">🔑 Ethred</div>
        <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
          {success ? 'Password reset!' : 'Set a new password'}
        </h1>
      </div>

      {success ? (
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Your password has been reset successfully. Redirecting to login…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New password */}
          <div>
            <label htmlFor="new-password" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                autoFocus
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirm-password" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
            {isLoading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      )}

      {!success && (
        <Link
          href={`/${lang}/auth/forgot-password`}
          className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
        >
          <ArrowLeft size={13} />
          Request a different link
        </Link>
      )}
    </div>
  );
}

export default function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-500">Loading...</p>
          </div>
        }>
          <ResetPasswordContent lang={lang} />
        </Suspense>
      </div>
    </div>
  );
}
