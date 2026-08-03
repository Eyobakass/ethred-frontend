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

  useEffect(() => {
    propertyService
      .searchProperties({ limit: 10 })
      .then((res) => {
        if (res && res.results) setProperties(res.results);
      })
      .catch(() => {
        setProperties([
          {
            id: 'sample-1',
            owner_id: 'user-1',
            title_en: 'Luxury 3-Bedroom Apartment in Bole Edna Mall',
            title_am: 'በቦሌ ኤድና ሞል አቅራቢያ የሚገኝ የቅንጦት ባለ 3 መኝታ አፓርታማ',
            description_en: 'Modern high-rise apartment.',
            price_etb: 14500000,
            transaction_mode: 'SALE',
            category: 'APARTMENT',
            region: 'Addis Ababa',
            city: 'Addis Ababa',
            sub_city: 'Bole',
            woreda: 'Woreda 03',
            bedrooms: 3,
            bathrooms: 2,
            area_sqm: 165,
            status: 'APPROVED',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {lang === 'am' ? 'የሻጭ ዳሽቦርድ' : 'Seller Dashboard'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your property listings, 3D virtual tours, and buyer inquiries.
          </p>
        </div>
        <Link
          href={`/${lang}/seller/listings/create`}
          className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-lg shadow-gold-500/20 transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>{lang === 'am' ? 'አዲስ ቤት መዝግብ' : 'Add New Listing'}</span>
        </Link>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 font-bold text-sm text-white">
          My Listed Properties ({properties.length})
        </div>
        <div className="divide-y divide-neutral-800">
          {properties.map((prop) => (
            <div key={prop.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-800/50 transition">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'am' && prop.title_am ? prop.title_am : prop.title_en}
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
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
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gold-400 text-xs font-semibold border border-gold-500/30 transition flex items-center gap-1"
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
          ))}
        </div>
      </div>
    </div>
  );
}
