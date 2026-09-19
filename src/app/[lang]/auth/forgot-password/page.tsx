// src/app/[lang]/auth/forgot-password/page.tsx
'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="text-red-600 dark:text-red-400 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              {sent ? (lang === 'am' ? 'ኢሜልዎን ያረጋግጡ' : 'Check your email') : (lang === 'am' ? 'የይለፍ ቃልዎን ይቀይሩ' : 'Reset your password')}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {sent
                ? (lang === 'am' ? `ሊንክ ወደ ${email} ልከናል::` : `We sent a password reset link to ${email}.`)
                : (lang === 'am' ? 'ኢሜልዎን ያስገቡ፤ መለወጫ ሊንክ እንልክልዎታለን።' : 'Enter your email and we will send you a reset link.')}
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
                {lang === 'am' ? 'በዚህ ኢሜል የተመዘገበ አካውንት ካለ፣ በቅርቡ ሊንክ ይደርስዎታል። የስፓም ማህደርዎንም ያረጋግጡ።' : 'If an account with that email exists, you will receive a link shortly. Check your spam folder too.'}
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full py-2.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                {lang === 'am' ? 'ወደ ሌላ ኢሜል ላክ' : 'Send to a different email'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  {lang === 'am' ? 'የኢሜል አድራሻ' : 'Email Address'}
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
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm transition"
              >
                {isLoading ? (lang === 'am' ? 'በመላክ ላይ...' : 'Sending…') : (lang === 'am' ? 'ሊንክ ላክ' : 'Send Reset Link')}
              </button>
            </form>
          )}

          <Link
            href={`/${lang}/auth/login`}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <ArrowLeft size={16} />
            {lang === 'am' ? 'ወደ መግቢያ ይመለሱ' : 'Back to Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}
