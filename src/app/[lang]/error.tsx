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
      <div className="text-center max-w-sm space-y-5">
        <div className="text-6xl">🔥</div>
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-2">
            Something went wrong
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
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition shadow-lg shadow-red-600/20"
          >
            Try Again
          </button>
          <Link
            href={`/${lang}`}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
