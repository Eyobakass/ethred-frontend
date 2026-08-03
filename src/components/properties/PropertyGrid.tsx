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
      <div className="w-full py-16 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8">
        <span className="text-4xl mb-3 block">🔍</span>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No Properties Found</h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Try broadening your search criteria or removing location filters.
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
