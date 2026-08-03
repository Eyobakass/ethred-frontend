// src/components/properties/PropertyCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { formatCurrency } from '@/utils/currency';

interface PropertyCardProps {
  property: Property;
  lang?: 'en' | 'am';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, lang = 'en' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = property.media?.filter((m) => m.media_category === 'IMAGE').map(m => m.file_url) || [];
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80');
  }

  const title = lang === 'am' && property.title_am ? property.title_am : property.title_en;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      href={`/${lang}/properties/${property.id}`}
      className="block group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-800">
        <img
          src={images[currentIndex]}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap z-10">
          {images.length > 1 && (
            <div className="bg-black/70 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm tracking-wider">
              {currentIndex + 1}/{images.length}
            </div>
          )}
          {property.is_featured && (
            <div className="bg-red-600 dark:bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm tracking-wider uppercase">
              ⭐ FEATURED
            </div>
          )}
          {(property.external_tour_url || property.media?.some((m) => m.is_tour_scene)) && (
            <div className="bg-[#8b5cf6] dark:bg-[#7c3aed] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm tracking-wider uppercase">
              3D WALKTHROUGH
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <div
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-20 cursor-pointer shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-20 cursor-pointer shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-start">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xl font-extrabold text-neutral-900 dark:text-white">
            {formatCurrency(Number(property.price_etb), 'ETB', lang)}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold text-neutral-900 dark:text-white mt-1">
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
          <span>{property.area_sqm} m²</span>
        </div>

        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 truncate">
          {property.sub_city}, {property.city} {property.woreda && `• Woreda ${property.woreda}`}
        </div>
      </div>
    </Link>
  );
};
