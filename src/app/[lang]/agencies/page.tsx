// src/app/[lang]/agencies/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Agency } from '@/types/agency.types';
import { agencyService } from '@/services/agency.service';

export default function AgenciesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
          🏢 Licensed Agencies
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
          {lang === 'am' ? 'የሪል ስቴት ኤጀንሲዎች' : 'Real Estate Agencies'}
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {lang === 'am'
            ? 'በኢትሬድ ላይ የተመዘገቡ ኦፊሴላዊ ኤጀንሲዎች'
            : 'Licensed and verified agencies operating on the Ethred platform.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-red-600 dark:border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-red-600 dark:border-red-600/40 transition group space-y-4 shadow-xl"
            >
              {/* Agency avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-2xl flex-shrink-0">
                  {agency.logo_url ? (
                    <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    '🏢'
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-red-600 dark:text-red-400 transition truncate">
                    {agency.name}
                  </h2>
                  {agency.is_verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded-md mt-1">
                      ✅ Verified Agency
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                {agency.description_en}
              </p>

              <Link
                href={`/${lang}/agencies/${agency.id}`}
                className="block text-center py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold transition border border-neutral-300 dark:border-neutral-700"
              >
                {lang === 'am' ? 'ዝርዝር ይመልከቱ' : 'View Agency Profile'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
