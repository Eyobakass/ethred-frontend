// src/components/properties/PropertyCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { formatCurrency } from '@/utils/currency';

interface PropertyCardProps {
  property: Property;
  lang?: 'en' | 'am';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, lang = 'en' }) => {
  const thumbnail =
    property.media?.find((m) => m.media_category === 'IMAGE')?.file_url ||
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';

  const title = lang === 'am' && property.title_am ? property.title_am : property.title_en;

  return (
    <div className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-gold-500/50 transition-all duration-300 flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-800">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {property.is_featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-gold-500 to-amber-500 text-black text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-lg tracking-wider uppercase">
            ⭐ FEATURED
          </div>
        )}

        {property.external_tour_url || property.media?.some((m) => m.is_tour_scene) ? (
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-gold-400 border border-gold-500/40 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <span>🥽 3D TOUR</span>
          </div>
        ) : null}

        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white font-extrabold text-sm px-3 py-1.5 rounded-lg border border-neutral-700">
          {formatCurrency(Number(property.price_etb), 'ETB', lang)}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>📍 {property.sub_city}, {property.city}</span>
            {property.woreda && <span>• {property.woreda}</span>}
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-gold-400 transition line-clamp-1">
            {title}
          </h3>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span>🛏️ {property.bedrooms} Beds</span>
            <span>🚿 {property.bathrooms} Baths</span>
            <span>📐 {property.area_sqm} m²</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/${lang}/properties/${property.id}`}
            className="flex-1 text-center py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
          >
            View Details
          </Link>
          <Link
            href={`/${lang}/properties/${property.id}/tour`}
            className="py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold transition shadow-lg shadow-gold-500/10 flex items-center justify-center gap-1"
          >
            <span>🥽 3D Tour</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
