// src/app/[lang]/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { formatCurrency } from '@/utils/currency';

const FALLBACK_PROPERTIES: Property[] = [
  {
    id: 'sample-1',
    owner_id: 'user-1',
    title_en: 'Luxury 3-Bedroom Apartment — Bole Edna Mall',
    title_am: 'በቦሌ ኤድና ሞል አቅራቢያ የሚገኝ የቅንጦት ባለ 3 መኝታ አፓርታማ',
    description_en: 'Modern high-rise with 3D virtual tour, jacuzzi master suite, backup generator, underground parking.',
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
    media: [{ id: 'm1', property_id: 'sample-1', file_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', media_category: 'IMAGE', sort_order: 0, is_tour_scene: true }],
  },
  {
    id: 'sample-2',
    owner_id: 'user-2',
    title_en: 'Modern Villa House — Yeka CMC',
    title_am: 'በየካ ሲኤምሲ የሚገኝ ዘመናዊ ቪላ ቤት',
    description_en: 'Spacious 5-bedroom villa with private garden, maid rooms, and solar water heater.',
    price_etb: 28000000,
    transaction_mode: 'SALE',
    category: 'HOUSE',
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    sub_city: 'Yeka',
    woreda: 'Woreda 08',
    bedrooms: 5,
    bathrooms: 4,
    area_sqm: 350,
    status: 'APPROVED',
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [{ id: 'm2', property_id: 'sample-2', file_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', media_category: 'IMAGE', sort_order: 0, is_tour_scene: true }],
  },
  {
    id: 'sample-3',
    owner_id: 'user-3',
    title_en: 'Premium Office Space — Kazanchis Business District',
    title_am: 'ካዛንችስ በቢዝነስ አካባቢ ቅሬ ቢሮ',
    description_en: 'Grade-A office space with fiber optic internet, 24/7 power backup, and building management services.',
    price_etb: 85000,
    transaction_mode: 'RENT',
    category: 'OFFICE',
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    sub_city: 'Kirkos',
    woreda: 'Woreda 02',
    bedrooms: 0,
    bathrooms: 2,
    area_sqm: 220,
    status: 'APPROVED',
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [{ id: 'm3', property_id: 'sample-3', file_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', media_category: 'IMAGE', sort_order: 0, is_tour_scene: false }],
  },
];

const STATS = [
  { value: '2,800+', labelEn: 'Verified Listings', labelAm: 'ተረጋጋጭ ቤቶች' },
  { value: '650+', labelEn: '3D Virtual Tours', labelAm: '3D ቱሮች' },
  { value: '12,000+', labelEn: 'Registered Buyers', labelAm: 'ተመዝጋቢ ገዢዎች' },
  { value: '3', labelEn: 'Payment Gateways', labelAm: 'የክፍያ ዘዴዎች' },
];

export default function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = use(params);
  const lang = (resolvedParams.lang === 'am' ? 'am' : 'en') as 'en' | 'am';
  const router = useRouter();

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'SALE' | 'RENT'>('SALE');

  useEffect(() => {
    propertyService
      .searchProperties({ limit: 6, is_featured: true })
      .then((data) => {
        if (data?.results?.length) setFeaturedProperties(data.results);
        else setFeaturedProperties(FALLBACK_PROPERTIES);
      })
      .catch(() => setFeaturedProperties(FALLBACK_PROPERTIES));
  }, []);

  const handleSearch = useCallback(() => {
    const qs = new URLSearchParams({
      ...(searchQuery && { search_query: searchQuery }),
      transaction_mode: searchMode,
    }).toString();
    router.push(`/${lang}/properties?${qs}`);
  }, [lang, router, searchQuery, searchMode]);

  return (
    <div className="space-y-20 pb-20">
      {/* ══ Hero Section ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background gradient + subtle grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 dark:from-neutral-950 via-white dark:via-neutral-900/70 to-neutral-50 dark:to-neutral-950" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #d4af37 1px, transparent 1px), linear-gradient(to bottom, #d4af37 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 dark:bg-red-600/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7 px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/30 text-red-600 dark:text-red-400 text-xs font-bold">
            <span>🏡</span>
            <span>
              {lang === 'am'
                ? 'የኢትዮጵያ ቀዳሚ የሪል ስቴት መድረክ'
                : "Ethiopia's Premier Real Estate Platform"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            {lang === 'am'
              ? <>
                  የህልም <span className="text-red-600 dark:text-red-400">ቤትዎን</span><br />
                  በኢትዮጵያ ያግኙ
                </>
              : <>
                  Find Your Perfect Home<br />
                  in <span className="text-red-600 dark:text-red-400">Ethiopia</span>
                </>
            }
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {lang === 'am'
              ? 'የተረጋገጡ አፓርታማዎች፣ ቪላዎች እና የንግድ ቦታዎች በየትኛውም የኢትዮጵያ ክፍል በቀላሉ ያግኙ። ቴሌብር፣ ሲቢኢ ብር እና ቻፓ ክፍያ ዘዴዎች የተካተተ።'
              : 'Explore verified apartments, villas & commercial spaces across Addis Ababa and major cities. Reliable listings with secure local payment options.'}
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-300 dark:border-neutral-700 p-2 rounded-2xl shadow-2xl">
            {/* Sale / Rent toggle */}
            <div className="flex gap-1 mb-2 px-1">
              {(['SALE', 'RENT'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    searchMode === mode
                      ? 'bg-red-600 dark:bg-red-600 text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white'
                  }`}
                >
                  {mode === 'SALE'
                    ? lang === 'am' ? '🏷️ ሽያጭ' : '🏷️ For Sale'
                    : lang === 'am' ? '🔑 ኪራይ' : '🔑 For Rent'}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  lang === 'am'
                    ? 'በቦሌ፣ የካ፣ ሲኤምሲ ወ.ዘ.ተ ይፈልጉ...'
                    : 'Search Bole, Yeka, CMC, Kazanchis, Hawassa...'
                }
                className="w-full bg-transparent px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto flex-shrink-0 px-6 py-3 rounded-xl bg-red-600 dark:bg-red-600 hover:bg-red-500 dark:bg-red-500 text-white font-extrabold text-xs transition shadow-lg shadow-red-600 dark:shadow-red-600/20 whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>{lang === 'am' ? 'ፈልግ' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">
            <span>{lang === 'am' ? 'ታዋቂ ቦታዎች:' : 'Popular:'}</span>
            {['Bole', 'Yeka CMC', 'Kazanchis', 'Sarbet', 'Hawassa'].map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setSearchQuery(loc);
                  router.push(`/${lang}/properties?search_query=${encodeURIComponent(loc)}&transaction_mode=${searchMode}`);
                }}
                className="px-3 py-1 rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-red-600 dark:border-red-600/40 hover:text-red-600 dark:text-red-400 transition"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Stats Bar ══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.value} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">{stat.value}</div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                {lang === 'am' ? stat.labelAm : stat.labelEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Featured Properties ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
              ⭐ Handpicked Listings
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {lang === 'am' ? 'የተመረጡ 3D ቱር ቤቶች' : 'Featured 3D Virtual Tour Properties'}
            </h2>
          </div>
          <Link
            href={`/${lang}/properties`}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-500 dark:text-red-300 flex items-center gap-1 transition"
          >
            {lang === 'am' ? 'ሁሉንም ይመልከቱ' : 'View All'}
            <span>→</span>
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} lang={lang} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-neutral-500">
            <div className="w-10 h-10 border-4 border-red-600 dark:border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        )}
      </section>

      {/* ══ How It Works ═══════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">
            🔄 Platform Workflow
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'እንዴት ይሰራል?' : 'How Ethred Works'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              iconEn: '🔍',
              titleEn: 'Search & Filter',
              titleAm: 'ፈልግ እና አጣራ',
              descEn: 'Browse verified listings by location, price range, bedrooms, and amenities.',
              descAm: 'በአካባቢ፣ ዋጋ እና የክፍል ብዛት የተረጋገጡ ቤቶችን አጣርተህ ፈልግ።',
            },
            {
              step: '02',
              iconEn: '🥽',
              titleEn: 'Take a Virtual Tour',
              titleAm: 'በቨርቹዋል ይጎብኙ',
              descEn: 'Explore properties remotely with our immersive 3D virtual tours before you visit.',
              descAm: 'በተዘጋጀው 3D ቨርቹዋል ቱር አማካኝነት ቤቶችን በአካል ከማየትዎ በፊት በርቀት ይጎብኙ።',
            },
            {
              step: '03',
              iconEn: '💳',
              titleEn: 'Pay with Local Methods',
              titleAm: 'በኢትዮጵያ ክፍያ ዘዴ ክፈል',
              descEn: 'Use Telebirr, CBE Birr, or Chapa to pay for listing promotions — no foreign cards required.',
              descAm: 'ቴሌብር፣ ሲቢኢ ብር ወይም ቻፓ ተጠቅመው ፕሮሞሽን ይክፈሉ።',
            },
          ].map((step) => (
            <div
              key={step.step}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl space-y-3 hover:border-red-600 dark:border-red-600/30 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600 dark:bg-red-600/10 border border-red-600 dark:border-red-600/20 flex items-center justify-center text-xs font-extrabold text-red-600 dark:text-red-400">
                  {step.step}
                </div>
                <span className="text-2xl">{step.iconEn}</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {lang === 'am' ? step.titleAm : step.titleEn}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {lang === 'am' ? step.descAm : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Seller CTA ═════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-white dark:from-neutral-900 to-neutral-50 dark:to-neutral-800 border border-red-600 dark:border-red-600/20 rounded-2xl p-8 sm:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 dark:from-red-600/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2">
                {lang === 'am' ? 'ቤትዎን ለሽያጭ ወይም ኪራይ ያስመዝግቡ' : 'List Your Property on Ethred'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
                {lang === 'am'
                  ? 'ሺህ ለሚቆጠሩ የተረጋገጡ ገዢዎች ቤትዎን ለማስተዋወቅ በኢትሬድ ይመዝገቡ።'
                  : 'Reach thousands of verified buyers. Add a 3D tour to stand out from the crowd.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href={`/${lang}/auth/register`}
                className="px-6 py-3 rounded-xl bg-red-600 dark:bg-red-600 hover:bg-red-500 dark:bg-red-500 text-white font-extrabold text-sm shadow-lg shadow-red-600 dark:shadow-red-600/20 transition text-center"
              >
                {lang === 'am' ? 'በነፃ ይጀምሩ' : 'Start Listing — Free'}
              </Link>
              <Link
                href={`/${lang}/agencies`}
                className="px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold text-sm transition text-center"
              >
                {lang === 'am' ? 'እንደ ኤጀንሲ ይቀላቀሉ' : 'Join as Agency'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
