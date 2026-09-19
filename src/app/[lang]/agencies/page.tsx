// src/app/[lang]/agencies/page.tsx
'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import { Agency } from '@/types/agency.types';
import { agencyService } from '@/services/agency.service';

const ITEMS_PER_PAGE = 12;

export default function AgenciesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    agencyService
      .listAgencies()
      .then((res) => {
        if (Array.isArray(res)) setAgencies(res);
      })
      .catch(() => {
        // Demo fallback
        setAgencies([
          {
            id: 'agency-1',
            name: 'Bole Premium Properties',
            description_en:
              'Specializing in luxury apartments and penthouses in the Bole district of Addis Ababa. 5+ years of experience.',
            logo_url: null,
            is_verified: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'agency-2',
            name: 'Yeka Hills Realty',
            description_en:
              'Expert brokers for villa houses and land plots in Yeka, CMC and surrounding areas.',
            logo_url: null,
            is_verified: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'agency-3',
            name: 'Ethio Commercial Real Estate',
            description_en:
              'Commercial spaces, warehouses, and office buildings across all major Ethiopian cities.',
            logo_url: null,
            is_verified: false,
            created_at: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(agencies.length / ITEMS_PER_PAGE);
  const paginatedAgencies = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return agencies.slice(start, start + ITEMS_PER_PAGE);
  }, [agencies, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg> Licensed Agencies
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {lang === 'am' ? 'የሪል ስቴት ኤጀንሲዎች' : 'Real Estate Agencies'}
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {lang === 'am'
            ? 'በኢትሬድ ላይ የተመዘገቡ ኦፊሴላዊ ኤጀንሲዎች'
            : 'Licensed and verified agencies operating on the Ethred platform.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAgencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 hover:border-red-600 dark:hover:border-red-600/40 transition group space-y-4 shadow-sm flex flex-col"
              >
                {/* Agency avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-gradient-to-tr from-neutral-100 to-white dark:from-neutral-800 dark:to-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                    {agency.logo_url ? (
                      <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-red-600 dark:text-red-400 transition truncate">
                      {agency.name}
                    </h2>
                    {agency.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Verified Agency
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3 flex-grow">
                  {agency.description_en}
                </p>

                <Link
                  href={`/${lang}/agencies/${agency.id}`}
                  className="block mt-auto text-center py-2.5 rounded-md bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold transition border border-neutral-300 dark:border-neutral-700"
                >
                  {lang === 'am' ? 'ዝርዝር ይመልከቱ' : 'View Agency Profile'}
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                ← Previous
              </button>
              <span className="text-sm font-semibold text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
