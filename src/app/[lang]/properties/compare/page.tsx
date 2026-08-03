// src/app/[lang]/properties/compare/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { formatCurrency } from '@/utils/currency';

export default function ComparePropertiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  // Up to 3 comparison slots
  const [compareSlots, setCompareSlots] = useState<(Property | null)[]>([null, null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await propertyService.searchProperties({ search_query: searchQuery, limit: 8 });
      setSearchResults(res?.results ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const assignToSlot = (property: Property) => {
    if (activeSlot === null) return;
    const updated = [...compareSlots];
    updated[activeSlot] = property;
    setCompareSlots(updated);
    setActiveSlot(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  const clearSlot = (index: number) => {
    const updated = [...compareSlots];
    updated[index] = null;
    setCompareSlots(updated);
  };

  const filledSlots = compareSlots.filter(Boolean) as Property[];

  const rowDef = [
    { label: lang === 'am' ? 'ዋጋ' : 'Price (ETB)', render: (p: Property) => formatCurrency(Number(p.price_etb), 'ETB', lang) },
    { label: lang === 'am' ? 'ምድብ' : 'Category', render: (p: Property) => p.category },
    { label: lang === 'am' ? 'ሽያጭ / ኪራይ' : 'Sale / Rent', render: (p: Property) => p.transaction_mode },
    { label: lang === 'am' ? 'ክፍለ ከተማ' : 'Sub-City', render: (p: Property) => `${p.sub_city}, ${p.city}` },
    { label: lang === 'am' ? 'መኝታ ቤቶች' : 'Bedrooms', render: (p: Property) => `🛏️ ${p.bedrooms}` },
    { label: lang === 'am' ? 'መታጠቢያ ቤቶች' : 'Bathrooms', render: (p: Property) => `🚿 ${p.bathrooms}` },
    { label: lang === 'am' ? 'ስፋት' : 'Area', render: (p: Property) => `${p.area_sqm} m²` },
    { label: '3D Tour', render: (p: Property) => p.media?.some((m) => m.is_tour_scene) ? '✅ Yes' : '❌ No' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-800 pb-6">
        <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-1">
          ⚖️ Side-by-Side Comparison
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {lang === 'am' ? 'ቤቶችን ያወዳድሩ' : 'Compare Properties'}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === 'am'
            ? 'እስከ 3 ቤቶች ምርጫቸውን ለማወዳደር'
            : 'Select up to 3 properties to compare side-by-side.'}
        </p>
      </div>

      {/* Slot selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {compareSlots.map((prop, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-4 min-h-[120px] flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
              prop
                ? 'bg-neutral-900 border-gold-500/40'
                : activeSlot === i
                ? 'bg-gold-500/10 border-gold-500 border-dashed'
                : 'bg-neutral-900/50 border-neutral-800 border-dashed hover:border-neutral-600'
            }`}
            onClick={() => !prop && setActiveSlot(i)}
          >
            {prop ? (
              <>
                <img
                  src={prop.media?.[0]?.file_url ?? 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=60'}
                  alt={prop.title_en}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <p className="text-xs font-bold text-white text-center line-clamp-1">{prop.title_en}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); clearSlot(i); }}
                  className="text-[10px] text-red-400 hover:text-red-300"
                >
                  Remove ✕
                </button>
              </>
            ) : (
              <>
                <span className="text-2xl">{activeSlot === i ? '🔍' : '➕'}</span>
                <p className="text-xs text-neutral-500">
                  {activeSlot === i ? 'Search below and click a result' : `Add Property ${i + 1}`}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Search panel (shown when a slot is active) */}
      {activeSlot !== null && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={lang === 'am' ? 'ቤት ፈልግ...' : 'Search for a property...'}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 rounded-xl bg-gold-500 text-black text-xs font-bold"
            >
              {searching ? '...' : 'Search'}
            </button>
            <button
              onClick={() => { setActiveSlot(null); setSearchResults([]); }}
              className="px-3 py-2 rounded-xl bg-neutral-800 text-neutral-400 text-xs"
            >
              Cancel
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="divide-y divide-neutral-800 max-h-64 overflow-y-auto">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => assignToSlot(p)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-800 transition rounded-lg"
                >
                  <img src={p.media?.[0]?.file_url ?? ''} alt="" className="w-12 h-10 object-cover rounded-lg" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.title_en}</p>
                    <p className="text-[10px] text-neutral-400">{p.sub_city} · {formatCurrency(Number(p.price_etb), 'ETB', lang)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparison table */}
      {filledSlots.length >= 2 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left p-4 text-neutral-400 font-semibold w-1/4">Feature</th>
                {compareSlots.map((prop, i) => prop ? (
                  <th key={i} className="p-4 text-center">
                    <Link
                      href={`/${lang}/properties/${prop.id}`}
                      className="text-white font-bold hover:text-gold-400 transition text-xs line-clamp-2 block"
                    >
                      {lang === 'am' && prop.title_am ? prop.title_am : prop.title_en}
                    </Link>
                  </th>
                ) : (
                  <th key={i} className="p-4 text-center text-neutral-600">—</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowDef.map((row) => (
                <tr key={row.label} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition">
                  <td className="p-4 text-neutral-400 font-semibold">{row.label}</td>
                  {compareSlots.map((prop, i) => (
                    <td key={i} className="p-4 text-center text-white font-medium">
                      {prop ? row.render(prop) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4"></td>
                {compareSlots.map((prop, i) => (
                  <td key={i} className="p-4 text-center">
                    {prop && (
                      <Link
                        href={`/${lang}/properties/${prop.id}/tour`}
                        className="inline-flex px-3 py-1.5 rounded-lg bg-gold-500 text-black text-xs font-bold"
                      >
                        🥽 3D Tour
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
