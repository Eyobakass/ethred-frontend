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
        else setError('Agency not found.');

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
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Agency not found</h1>
        <p className="text-neutral-500 mb-6">{error || 'The agency you are looking for does not exist or has been removed.'}</p>
        <Link href={`/${lang}/agencies`} className="text-red-600 font-bold hover:underline">
          ← Back to Agencies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Profile */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="w-32 h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner border border-neutral-200 dark:border-neutral-700 relative z-10">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={agency.agency_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">🏢</span>
          )}
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {agency.agency_name}
            </h1>
            {agency.is_approved && (
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                ✅ Verified Agency
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-sm mb-4 max-w-2xl">
            A trusted real estate partner on Ethred. Browse our exclusive portfolio of properties.
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
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-20 text-center">
            <p className="text-4xl mb-4">🏠</p>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No active listings</h3>
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
