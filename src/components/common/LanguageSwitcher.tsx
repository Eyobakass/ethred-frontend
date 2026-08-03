// src/components/common/LanguageSwitcher.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const LanguageSwitcher: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Derive current lang from the first path segment
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const currentLang: 'en' | 'am' = segments[0] === 'am' ? 'am' : 'en';

  const toggleLanguage = (newLang: 'en' | 'am') => {
    if (newLang === currentLang) return;
    // Replace the first segment with the new lang. If somehow no segment, prepend.
    const otherSegments = segments.slice(1);
    const newPath = `/${newLang}${otherSegments.length > 0 ? '/' + otherSegments.join('/') : ''}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-700/60">
      <button
        onClick={() => toggleLanguage('en')}
        aria-label="Switch to English"
        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-200 ${
          currentLang === 'en'
            ? 'bg-gold-500 text-black shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => toggleLanguage('am')}
        aria-label="Switch to Amharic"
        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-200 ${
          currentLang === 'am'
            ? 'bg-gold-500 text-black shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        አማ
      </button>
    </div>
  );
};
