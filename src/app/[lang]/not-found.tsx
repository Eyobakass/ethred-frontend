// src/app/[lang]/not-found.tsx
import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="text-center space-y-5">
        <div className="text-8xl font-bold text-neutral-200 dark:text-neutral-800 leading-none flex justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Page Not Found / ገጹ አልተገኘም</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The page you are looking for does not exist or has been moved. <br/> የሚፈልጉት ገጽ የለም ወይም ቦታው ተቀይሯል።
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition shadow-sm mt-4"
        >
          Go to Homepage / ወደ መነሻ ገጽ ይመለሱ
        </Link>
      </div>
    </div>
  );
}
