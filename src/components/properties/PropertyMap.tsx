// src/components/properties/PropertyMap.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { formatCurrency } from '@/utils/currency';
import { getImageUrl } from '@/utils/imageUrl';

// Addis Ababa Sub-City Centroids & Approximate Relative Grid Coordinates
const SUB_CITY_COORDINATES: Record<string, { x: number; y: number; nameAm: string }> = {
  'Gullele': { x: 38, y: 22, nameAm: 'ጉለሌ' },
  'Arada': { x: 48, y: 35, nameAm: 'አራዳ' },
  'Addis Ketema': { x: 36, y: 38, nameAm: 'አዲስ ከተማ' },
  'Lideta': { x: 40, y: 48, nameAm: 'ልደታ' },
  'Kirkos': { x: 52, y: 52, nameAm: 'ቂርቆስ' },
  'Yeka': { x: 68, y: 32, nameAm: 'የካ' },
  'Bole': { x: 74, y: 62, nameAm: 'ቦሌ' },
  'Nifas Silk-Lafto': { x: 44, y: 70, nameAm: 'ንፋስ ስልክ' },
  'Kolfe Keranio': { x: 22, y: 50, nameAm: 'ኮልፌ ቀራንዮ' },
  'Akaki Kality': { x: 60, y: 88, nameAm: 'አቃቂ ቃሊቲ' },
};

interface PropertyMapProps {
  properties: Property[];
  lang?: 'en' | 'am';
  selectedSubCity?: string;
  onSelectSubCity?: (subCity: string) => void;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  lang = 'en',
  selectedSubCity,
  onSelectSubCity,
}) => {
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [activeBoundary, setActiveBoundary] = useState<string | null>(selectedSubCity || null);

  // Group properties by sub-city
  const clusterCounts: Record<string, Property[]> = {};
  properties.forEach((p) => {
    const key = p.sub_city || 'Bole';
    if (!clusterCounts[key]) clusterCounts[key] = [];
    clusterCounts[key].push(p);
  });

  const handleSubCityClick = (name: string) => {
    const next = activeBoundary === name ? '' : name;
    setActiveBoundary(next || null);
    if (onSelectSubCity) onSelectSubCity(next);
  };

  return (
    <div className="relative w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg select-none">
      {/* Map Header Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <span className="px-3 py-1.5 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-sm flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
          {lang === 'am' ? 'የአዲስ አበባ ካርታ እና ዞኖች' : 'Addis Ababa Interactive Map'}
        </span>
        {activeBoundary && (
          <button
            onClick={() => handleSubCityClick(activeBoundary)}
            className="px-2.5 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition flex items-center gap-1 shadow-sm"
          >
            <span>{lang === 'am' ? 'ዞን አጽዳ:' : 'Zone:'} {activeBoundary}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        )}
      </div>

      <div className="absolute top-4 right-4 z-20 text-[11px] bg-black/80 backdrop-blur-md text-neutral-400 px-3 py-1.5 rounded-md border border-white/10 hidden sm:block">
        {lang === 'am' ? 'ማስታወቂያዎችን ለማጣራት ዞን ወይም ፒን ይጫኑ' : 'Click a zone cluster or pin to filter'}
      </div>

      {/* Interactive Spatial Grid / Map Canvas */}
      <div className="relative w-full h-[520px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Ring radar locator around central Addis */}
        <div className="absolute w-[360px] h-[360px] rounded-full border border-neutral-800/80 pointer-events-none" />
        <div className="absolute w-[220px] h-[220px] rounded-full border border-neutral-800/60 pointer-events-none" />

        {/* Sub-city Zones / Boundary polygons representation */}
        {Object.entries(SUB_CITY_COORDINATES).map(([name, coord]) => {
          const count = clusterCounts[name]?.length || 0;
          const isSelected = activeBoundary === name;

          return (
            <div
              key={name}
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              onClick={() => handleSubCityClick(name)}
            >
              {/* Radius / Boundary Halo */}
              <div
                className={`absolute inset-0 -m-5 rounded-full transition-all duration-300 pointer-events-none ${
                  isSelected
                    ? 'bg-red-600/30 scale-125 ring-2 ring-red-500'
                    : 'bg-white/5 group-hover:bg-white/15 scale-100'
                }`}
              />

              {/* Pin Bubble */}
              <div
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-red-600 text-white ring-2 ring-white scale-110'
                    : count > 0
                    ? 'bg-neutral-800/90 text-white border border-neutral-700 hover:scale-105 hover:bg-neutral-700'
                    : 'bg-neutral-900/60 text-neutral-500 border border-neutral-800/60'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    count > 0 ? (isSelected ? 'bg-white' : 'bg-emerald-400 animate-pulse') : 'bg-neutral-600'
                  }`}
                />
                <span>{lang === 'am' ? coord.nameAm : name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-red-800 text-white' : 'bg-neutral-950 text-neutral-300'}`}>
                    {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Floating Property Pin Markers for filtered properties */}
        {properties.slice(0, 15).map((prop, idx) => {
          const subCity = prop.sub_city || 'Bole';
          const baseCoord = SUB_CITY_COORDINATES[subCity] || { x: 50, y: 50 };
          // Slightly offset pins around sub-city center
          const angle = (idx * (360 / 15)) * (Math.PI / 180);
          const radius = 5; // percentage
          const pinX = Math.max(10, Math.min(90, baseCoord.x + Math.cos(angle) * radius));
          const pinY = Math.max(15, Math.min(85, baseCoord.y + Math.sin(angle) * radius));

          const isSelected = activeProperty?.id === prop.id;

          return (
            <button
              key={prop.id}
              type="button"
              style={{ left: `${pinX}%`, top: `${pinY}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveProperty(prop);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-15 group transition-transform ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-115'
              }`}
            >
              <div className="px-2 py-1 rounded bg-neutral-900/95 hover:bg-red-600 text-white text-[11px] font-bold border border-white/20 shadow-md tabular-nums flex items-center gap-1 transition">
                <span>{formatCurrency(Number(prop.price_etb), 'ETB', lang).split(' ')[0]}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-neutral-900 border-b border-r border-white/20 rotate-45 mx-auto -mt-0.5" />
            </button>
          );
        })}
      </div>

      {/* Selected Property Popup Card */}
      {activeProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
              <img
                src={getImageUrl(activeProperty.media?.[0]?.file_url || (activeProperty as any).thumbnail_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80')}
                alt={activeProperty.title_en}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                  {activeProperty.transaction_mode}
                </span>
                <button
                  onClick={() => setActiveProperty(null)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                </button>
              </div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                {lang === 'am' && activeProperty.title_am ? activeProperty.title_am : activeProperty.title_en}
              </h4>
              <p className="text-[11px] font-bold text-neutral-900 dark:text-white tabular-nums mt-1">
                {formatCurrency(Number(activeProperty.price_etb), 'ETB', lang)}
              </p>
              <Link
                href={`/${lang}/properties/${activeProperty.id}`}
                className="block text-center mt-2 px-3 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-semibold hover:opacity-90 transition"
              >
                {lang === 'am' ? 'ዝርዝሩን እይ' : 'View Property'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
