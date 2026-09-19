// src/app/[lang]/agencies/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { agencyService } from '@/services/agency.service';
import { propertyService } from '@/services/property.service';
import { Agency } from '@/types/index';
import { Property } from '@/types/property.types';
import { PropertyCard } from '@/components/properties/PropertyCard';

export default function AgencyDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: rawLang, id } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [agency, setAgency] = useState<Agency | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      agencyService.getAgency(id).catch(() => null),
      propertyService.searchProperties({ agency_id: id, limit: 12 }).catch(() => null)
    ])
      .then(([agencyRes, propsRes]) => {
        if (agencyRes) setAgency(agencyRes as Agency);
        else setError(lang === 'am' ? 'ኤጀንሲው አልተገኘም.' : 'Agency not found.');

        const list = Array.isArray(propsRes) ? propsRes
          : Array.isArray((propsRes as any)?.results) ? (propsRes as any).results
          : Array.isArray((propsRes as any)?.data) ? (propsRes as any).data : [];
        setListings(list);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center">
        <div className="w-10 h-10 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{lang === 'am' ? 'ኤጀንሲው አልተገኘም' : 'Agency not found'}</h1>
        <p className="text-neutral-500 mb-6">{error || 'The agency you are looking for does not exist or has been removed.'}</p>
        <Link href={`/${lang}/agencies`} className="text-red-600 font-semibold hover:underline flex items-center gap-1 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Back to Agencies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Profile */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="w-32 h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700 relative z-10 text-neutral-400">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={agency.agency_name} className="w-full h-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          )}
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {agency.agency_name}
            </h1>
            {agency.is_approved && (
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-md border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Verified Agency
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-sm mb-4 max-w-2xl">
            {lang === 'am' ? 'በኢትሬድ ላይ የታመነ የሪል ስቴት አጋር። ልዩ የሆኑ ቤቶቻችንን ያስሱ።' : 'A trusted real estate partner on Ethred. Browse our exclusive portfolio of properties.'}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
            <div>
              <p className="font-bold text-neutral-900 dark:text-white text-lg">{listings.length}</p>
              <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Active Listings</p>
            </div>
            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
            <div>
              <p className="font-bold text-neutral-900 dark:text-white text-lg">
                {new Date(agency.created_at).getFullYear()}
              </p>
              <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Joined</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            Properties by {agency.agency_name}
          </h2>
        </div>

        {listings.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg py-20 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 dark:text-neutral-600 mb-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{lang === 'am' ? 'ምንም ገቢር ንብረቶች የሉም' : 'No active listings'}</h3>
            <p className="text-neutral-500 text-sm">This agency currently has no properties available for sale or rent.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(property => (
              <PropertyCard key={property.id} property={property} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
