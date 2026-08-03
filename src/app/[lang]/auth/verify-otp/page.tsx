// src/app/[lang]/auth/verify-otp/page.tsx
'use client';

import React, { useState, use, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';

function VerifyOtpContent({ lang }: { lang: 'en' | 'am' }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionToken = searchParams.get('token') ?? '';
  const role = (searchParams.get('role') ?? 'BUYER') as string;

  const setAuth = useAuthStore((s) => s.setAuth);

  // 6 individual digit inputs
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  // Auto-submit when all 6 digits are entered
  const code = digits.join('');
  useEffect(() => {
    if (code.length === 6) {
      handleVerify(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    // Move to next
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...digits];
    pasted.split('').forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (verificationCode: string) => {
    if (verificationCode.length !== 6) return;
    if (!sessionToken) {
      setError('Invalid session. Please register again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyOtp(sessionToken, verificationCode) as any;
      if (res?.jwt && res?.user) {
        setAuth(res.user, res.jwt);
        const dest =
          role === 'SELLER'
            ? `/${lang}/seller/dashboard`
            : role === 'ADMIN'
            ? `/${lang}/admin/dashboard`
            : `/${lang}`;
        router.replace(dest);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Invalid or expired code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Resend is not a standard endpoint in the SRS, so we just show a message
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-gold-700 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20 mb-3">
          <span className="text-2xl">📱</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          {lang === 'am' ? 'የSMS ኮድ ያስገቡ' : 'Enter SMS Code'}
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed">
          {lang === 'am'
            ? 'ወደ ስልክዎ የተላከ 6-አሃዝ ኮድ ያስገቡ'
            : 'Enter the 6-digit code sent to your Ethiopian mobile number.'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl text-center">
          {error}
        </div>
      )}
      {resent && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl text-center">
          ✅ A new code has been sent (demo mode).
        </div>
      )}

      {/* Digit input boxes */}
      <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className={`w-11 h-12 text-center text-lg font-bold rounded-xl border transition-all focus:outline-none ${
              digit
                ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                : 'border-neutral-700 bg-neutral-800 text-white focus:border-gold-500'
            } disabled:opacity-50`}
          />
        ))}
      </div>

      <button
        onClick={() => handleVerify(code)}
        disabled={loading || code.length !== 6}
        className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-lg shadow-gold-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying...' : lang === 'am' ? 'አረጋጋጥ' : 'Verify & Continue'}
      </button>

      <div className="text-center text-xs text-neutral-500">
        {lang === 'am' ? 'ኮድ አልደረሰዎትም?' : "Didn't receive the code?"}{' '}
        <button
          onClick={handleResend}
          className="text-gold-400 font-semibold hover:underline"
        >
          {lang === 'am' ? 'እንደገና ላክ' : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtpPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6 text-center">
           <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
           <p className="text-sm text-neutral-400">Loading...</p>
        </div>
      }>
        <VerifyOtpContent lang={lang} />
      </Suspense>
    </div>
  );
}
