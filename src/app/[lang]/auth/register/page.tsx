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

  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER' | 'AGENCY_ADMIN'>('BUYER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res: any = await authService.registerPhone(phone, lang);
      if (res.session_token) {
        router.push(`/${lang}/auth/verify-otp?token=${res.session_token}&role=${role}`);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white">
            {lang === 'am' ? 'በኢትሬድ ይተመዝገቡ' : 'Create an Account'}
          </h1>
          <p className="text-xs text-neutral-400">
            Sign up with your Ethiopian phone number to start browsing or listing properties.
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
              Account Type / Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`py-2 text-xs font-bold rounded-lg border ${
                  role === 'BUYER'
                    ? 'bg-gold-500 text-black border-gold-500'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`py-2 text-xs font-bold rounded-lg border ${
                  role === 'SELLER'
                    ? 'bg-gold-500 text-black border-gold-500'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                Seller
              </button>
              <button
                type="button"
                onClick={() => setRole('AGENCY_ADMIN')}
                className={`py-2 text-xs font-bold rounded-lg border ${
                  role === 'AGENCY_ADMIN'
                    ? 'bg-gold-500 text-black border-gold-500'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                Agency
              </button>
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-lg shadow-gold-500/20 transition"
          >
            {loading ? 'Sending OTP Code...' : 'Send SMS Verification Code'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-400">
          Already have an account?{' '}
          <Link href={`/${lang}/auth/login`} className="text-gold-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
