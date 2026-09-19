// src/app/[lang]/error.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const lang = pathname?.split('/')[1] === 'am' ? 'am' : 'en';

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="text-center max-w-sm space-y-5 flex flex-col items-center">
        <div className="text-neutral-400 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            {lang === 'am' ? 'የሆነ ስህተት ተፈጥሯል' : 'Something went wrong'}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {error.message || 'An unexpected error occurred on this page.'}
          </p>
          {error.digest && (
            <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition shadow-sm"
          >
            {lang === 'am' ? 'እንደገና ይሞክሩ' : 'Try Again'}
          </button>
          <Link
            href={`/${lang}`}
            className="px-5 py-2.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
