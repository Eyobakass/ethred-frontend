// src/app/[lang]/me/recently-viewed/page.tsx
'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatCurrency } from '@/utils/currency';

export default function MeRecentlyViewedPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const { recentlyViewed, isLoaded, clearRecentlyViewed } = useRecentlyViewed();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {lang === 'am' ? 'የቅርብ ጊዜ ታሪክ' : 'Browsing History'}
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'በቅርብ የታዩ ቤቶች' : 'Recently Viewed Properties'}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            {lang === 'am'
              ? 'በቅርብ ጊዜ የጎበኟቸው ቤቶች ዝርዝር (ያለ ኢንተርኔትም ይሰራል)።'
              : 'Cached locally on your device for fast, offline-resilient access.'}
          </p>
        </div>

        {recentlyViewed.length > 0 && (
          <button
            onClick={clearRecentlyViewed}
            className="text-xs font-semibold text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition underline w-fit"
          >
            {lang === 'am' ? 'ታሪክ አጽዳ' : 'Clear History'}
          </button>
        )}
      </div>

      {!isLoaded ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
        </div>
      ) : recentlyViewed.length === 0 ? (
        <div className="p-16 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'ምንም የታዩ ቤቶች የሉም' : 'No Recently Viewed Properties'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            {lang === 'am'
              ? 'ቤቶችን ሲመለከቱ እዚህ በራስ-ሰር ይቀመጣሉ።'
              : 'As you browse properties across Ethiopia, they will appear here automatically.'}
          </p>
          <Link
            href={`/${lang}/properties`}
            className="px-6 py-2.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs transition hover:opacity-90"
          >
            {lang === 'am' ? 'ቤቶችን ፈልግ' : 'Browse Properties'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentlyViewed.map((item) => (
            <Link
              key={item.id}
              href={`/${lang}/properties/${item.id}`}
              className="block group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden transition-all duration-150 flex flex-col hover:border-neutral-400 dark:hover:border-neutral-600 shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={item.thumbnail_url}
                  alt={item.title_en}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:brightness-95 transition"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
                    {item.transaction_mode === 'SALE' ? 'SALE' : 'RENT'}
                  </span>
                  <span className="bg-neutral-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 font-medium">
                    {item.sub_city ? `${item.sub_city}, ` : ''}{item.city}
                  </p>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1 mt-0.5 group-hover:text-red-600 transition">
                    {lang === 'am' && item.title_am ? item.title_am : item.title_en}
                  </h3>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <span className="font-bold text-base text-neutral-900 dark:text-white tabular-nums">
                    {formatCurrency(item.price_etb, 'ETB', lang)}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    {item.bedrooms !== undefined && <span>{item.bedrooms} bds</span>}
                    {item.bathrooms !== undefined && <span>· {item.bathrooms} ba</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
