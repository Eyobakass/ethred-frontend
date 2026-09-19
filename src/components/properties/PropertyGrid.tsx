// src/components/properties/PropertyGrid.tsx
'use client';

import React from 'react';
import { Property } from '@/types/property.types';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  lang?: 'en' | 'am';
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, lang = 'en' }) => {
  if (properties.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 dark:text-neutral-600 mb-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
          {lang === 'am' ? 'ምንም ቤት አልተገኘም' : 'No Properties Found'}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {lang === 'am' ? 'እባክዎ የማጣሪያ መስፈርቶችዎን በመቀነስ በድጋሚ ይሞክሩ።' : 'Try broadening your search criteria or removing location filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} lang={lang} />
      ))}
    </div>
  );
};
