// src/app/[lang]/auth/verify-otp/page.tsx
'use client';

import React, { useState, use, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { MailCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4">
          <MailCheck className="text-red-600 dark:text-red-400 w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
          {lang === 'am' ? 'የኢሜል ኮድ ያስገቡ' : 'Enter Verification Code'}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {lang === 'am'
            ? 'ወደ ኢሜልዎ የተላከ 6-አሃዝ ኮድ ያስገቡ'
            : 'Enter the 6-digit code sent to your email address.'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-md text-center">
          {error}
        </div>
      )}
      {resent && (
        <div className="flex items-center gap-2 justify-center p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-sm rounded-md text-center">
          <CheckCircle2 size={16} /> A new code has been sent (demo mode).
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
            className={`w-11 h-12 text-center text-lg font-bold rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-red-600 ${
              digit
                ? 'border-red-600 dark:border-red-600/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white'
            } disabled:opacity-50`}
          />
        ))}
      </div>

      <button
        onClick={() => handleVerify(code)}
        disabled={loading || code.length !== 6}
        className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (lang === 'am' ? 'በማረጋገጥ ላይ...' : 'Verifying...') : (lang === 'am' ? 'ያረጋግጡ እና ይቀጥሉ' : 'Verify & Continue')}
      </button>

      <div className="text-center text-sm text-neutral-500">
        {lang === 'am' ? 'ኮድ አልደረሰዎትም?' : "Didn't receive the code?"}{' '}
        <button
          onClick={handleResend}
          className="text-red-600 dark:text-red-400 font-semibold hover:underline"
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
        <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl shadow-lg space-y-6 text-center">
           <div className="w-10 h-10 border-4 border-red-600 dark:border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
           <p className="text-sm text-neutral-600 dark:text-neutral-400">
             {lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}
           </p>
        </div>
      }>
        <VerifyOtpContent lang={lang} />
      </Suspense>
    </div>
  );
}
