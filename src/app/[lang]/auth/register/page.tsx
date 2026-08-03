// src/app/[lang]/auth/register/page.tsx
'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang === 'am' ? 'am' : 'en';
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER' | 'AGENCY_ADMIN'>('BUYER');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register({
        email,
        password,
        full_name: fullName,
        preferred_language: lang,
        role: role
      });
      // After successful registration, we need to send an OTP and redirect to verification
      const otpRes: any = await authService.sendOtp(email);
      if (otpRes?.session_token || otpRes?.sessionToken) {
        const token = otpRes.session_token || otpRes.sessionToken;
        router.push(`/${lang}/auth/verify-otp?token=${token}&role=${role}`);
      } else {
        router.push(`/${lang}/auth/login?registered=true`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'አካውንት ይፍጠሩ' : 'Create an Account'}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {lang === 'am' 
              ? 'ንብረቶችን ለማየት ወይም ለማስተዋወቅ በኢሜልዎ ይመዝገቡ።' 
              : 'Sign up with your email to start browsing or listing properties.'}
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
              {lang === 'am' ? 'የአካውንት አይነት' : 'Account Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['BUYER', 'SELLER', 'AGENCY_ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    role === r
                      ? 'bg-red-600 dark:bg-red-600 text-white border-red-600 dark:border-red-600 shadow-lg shadow-red-600 dark:shadow-red-600/20'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  {r === 'BUYER' ? (lang === 'am' ? 'ገዢ' : 'Buyer') : 
                   r === 'SELLER' ? (lang === 'am' ? 'ሻጭ' : 'Seller') : 
                   (lang === 'am' ? 'ኤጀንሲ' : 'Agency')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {lang === 'am' ? 'ሙሉ ስም' : 'Full Name'}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={lang === 'am' ? 'አበበ በሶበላ' : 'John Doe'}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 dark:border-red-600"
              required
            />
          </div>

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
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {lang === 'am' ? 'የይለፍ ቃል' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 dark:border-red-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 dark:bg-red-600 hover:bg-red-500 dark:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600 dark:shadow-red-600/20 transition disabled:opacity-50"
          >
            {loading 
              ? (lang === 'am' ? 'በመመዝገብ ላይ...' : 'Creating account...') 
              : (lang === 'am' ? 'ይመዝገቡ' : 'Create Account')}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-600 dark:text-neutral-400">
          {lang === 'am' ? 'አካውንት አለዎት? ' : 'Already have an account? '}
          <Link href={`/${lang}/auth/login`} className="text-red-600 dark:text-red-400 font-semibold hover:underline">
            {lang === 'am' ? 'ይግቡ' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  );
}
