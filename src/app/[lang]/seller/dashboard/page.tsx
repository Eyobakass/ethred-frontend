// src/app/[lang]/seller/dashboard/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { formatCurrency } from '@/utils/currency';

export default function SellerDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang === 'am' ? 'am' : 'en';
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    propertyService
      .getMyListings()
      .then((res) => {
        setProperties(res || []);
      })
      .catch(() => {
        setProperties([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'የሻጭ ዳሽቦርድ' : 'Seller Dashboard'}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your property listings, 3D virtual tours, and buyer inquiries.
          </p>
        </div>
        <Link
          href={`/${lang}/seller/listings/create`}
          className="px-5 py-2.5 rounded-xl bg-red-600 dark:bg-red-600 hover:bg-red-500 dark:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600 dark:shadow-red-600/20 transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>{lang === 'am' ? 'አዲስ ቤት መዝግብ' : 'Add New Listing'}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 font-bold text-sm text-neutral-900 dark:text-white">
          My Listed Properties ({properties.length})
        </div>
        <div className="divide-y divide-neutral-800">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading...</div>
          ) : properties.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-3xl">
                🏠
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                {lang === 'am' ? 'ምንም ቤቶች የሉም' : 'No Properties Yet'}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
                {lang === 'am' 
                  ? 'እስካሁን ምንም አይነት ቤት አልመዘገቡም። አዲስ ቤት በመመዝገብ ይጀምሩ!'
                  : "You haven't listed any properties yet. Get started by adding your first listing!"}
              </p>
              <Link
                href={`/${lang}/seller/listings/create`}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition"
              >
                {lang === 'am' ? 'አዲስ ቤት መዝግብ' : 'Add New Listing'}
              </Link>
            </div>
          ) : (
            properties.map((prop) => (
              <div key={prop.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {lang === 'am' && prop.title_am ? prop.title_am : prop.title_en}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    <span>📍 {prop.sub_city}, {prop.city}</span>
                    <span>💰 {formatCurrency(Number(prop.price_etb), 'ETB', lang)}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                      {prop.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${lang}/seller/listings/${prop.id}/tour-editor`}
                    className="px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-600 dark:border-red-600/30 transition flex items-center gap-1"
                  >
                    <span>🥽</span>
                    <span>Edit 3D Tour</span>
                  </Link>
                  <Link
                    href={`/${lang}/seller/promotions`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition"
                  >
                    ⭐ Promote
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
