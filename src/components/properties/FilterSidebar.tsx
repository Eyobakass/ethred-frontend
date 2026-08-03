// src/components/properties/FilterSidebar.tsx
'use client';

import React from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { ETHIOPIAN_LOCATIONS } from '@/utils/location';

interface FilterSidebarProps {
  lang?: 'en' | 'am';
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ lang = 'en' }) => {
  const {
    region,
    sub_city,
    category,
    price_min,
    price_max,
    bedrooms,
    has_virtual_tour,
    setFilter,
    resetFilters,
  } = useFilterStore();

  const selectedRegionData = ETHIOPIAN_LOCATIONS[region || 'Addis Ababa'];

  return (
    <aside className="w-full bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>🎛️</span> {lang === 'am' ? 'ማጣሪያ' : 'Filter Properties'}
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs text-gold-400 hover:underline font-medium"
        >
          Reset All
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-2">City / Region</label>
        <select
          value={region}
          onChange={(e) => {
            setFilter('region', e.target.value);
            setFilter('sub_city', '');
          }}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
        >
          <option value="">All Regions</option>
          {Object.keys(ETHIOPIAN_LOCATIONS).map((reg) => (
            <option key={reg} value={reg}>
              {lang === 'am' ? ETHIOPIAN_LOCATIONS[reg].am : ETHIOPIAN_LOCATIONS[reg].en}
            </option>
          ))}
        </select>
      </div>

      {selectedRegionData && (
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-2">Sub-City</label>
          <select
            value={sub_city}
            onChange={(e) => setFilter('sub_city', e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
          >
            <option value="">All Sub-Cities</option>
            {selectedRegionData.subCities.map((sc) => (
              <option key={sc.en} value={sc.en}>
                {lang === 'am' ? sc.am : sc.en}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-2">Property Category</label>
        <select
          value={category}
          onChange={(e) => setFilter('category', e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
        >
          <option value="">All Categories</option>
          <option value="APARTMENT">Apartment</option>
          <option value="HOUSE">House / Villa</option>
          <option value="COMMERCIAL">Commercial Space</option>
          <option value="OFFICE">Office</option>
          <option value="LAND">Land Plot</option>
          <option value="WAREHOUSE">Warehouse</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-2">Price Range (ETB)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ETB"
            value={price_min}
            onChange={(e) => setFilter('price_min', e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
          />
          <input
            type="number"
            placeholder="Max ETB"
            value={price_max}
            onChange={(e) => setFilter('price_max', e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-2">Min Bedrooms</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setFilter('bedrooms', bedrooms === num ? '' : num)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                bedrooms === num
                  ? 'bg-gold-500 text-black border-gold-500'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              {num}+
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-800">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={has_virtual_tour}
            onChange={(e) => setFilter('has_virtual_tour', e.target.checked)}
            className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 accent-gold-500"
          />
          <span className="text-xs font-semibold text-gold-400">
            🥽 {lang === 'am' ? '3D ቨርቹዋል ጉብኝት ያላቸው ብቻ' : '3D Virtual Tour Only'}
          </span>
        </label>
      </div>
    </aside>
  );
};
