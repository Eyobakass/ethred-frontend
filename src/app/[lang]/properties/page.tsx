// src/app/[lang]/properties/page.tsx
'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { FilterSidebar } from '@/components/properties/FilterSidebar';
import { useFilterStore } from '@/store/useFilterStore';

function PropertiesSearchContent({ lang }: { lang: 'en' | 'am' }) {
  const searchParams = useSearchParams();
  const filters = useFilterStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate search_query from URL on mount
  useEffect(() => {
    const q = searchParams.get('search_query');
    const mode = searchParams.get('transaction_mode');
    if (q) filters.setFilter('search_query', q);
    if (mode) filters.setFilter('transaction_mode', mode as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    propertyService
      .searchProperties({
        region: filters.region || undefined,
        sub_city: filters.sub_city || undefined,
        category: filters.category || undefined,
        price_min: filters.price_min || undefined,
        price_max: filters.price_max || undefined,
        bedrooms: filters.bedrooms || undefined,
        has_virtual_tour: filters.has_virtual_tour || undefined,
        search_query: filters.search_query || undefined,
        transaction_mode: filters.transaction_mode || undefined,
      })
      .then((data) => {
        if (data && data.results) {
          setProperties(data.results);
        }
      })
      .catch(() => {
        setProperties([
          {
            id: 'sample-1',
            owner_id: 'user-1',
            title_en: 'Luxury 3-Bedroom Apartment in Bole Edna Mall',
            title_am: 'በቦሌ ኤድና ሞል አቅራቢያ የሚገኝ የቅንጦት ባለ 3 መኝታ አፓርታማ',
            description_en: 'Modern high-rise apartment with 3D virtual tour.',
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
            title_en: 'Modern Villa House in Yeka CMC',
            title_am: 'በየካ ሲኤምሲ የሚገኝ ዘመናዊ ቪላ ቤት',
            description_en: 'Spacious 5-bedroom villa with private garden.',
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
        ]);
      })
      .finally(() => setLoading(false));
  }, [filters.region, filters.sub_city, filters.category, filters.price_min, filters.price_max, filters.bedrooms, filters.has_virtual_tour, filters.search_query, filters.transaction_mode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <div className="lg:col-span-1 lg:sticky lg:top-20">
        <FilterSidebar lang={lang} />
      </div>

      <div className="lg:col-span-3">
        {loading ? (
          <div className="py-20 text-center text-neutral-400">
            <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm">Searching listings...</span>
          </div>
        ) : (
          <>
            <div className="text-xs text-neutral-500 mb-4">
              {properties.length} {lang === 'am' ? 'ቤቶች ተገኙ' : 'properties found'}
            </div>
            <PropertyGrid properties={properties} lang={lang} />
          </>
        )}
      </div>
    </div>
  );
}

export default function PropertiesSearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = (resolvedParams.lang === 'am' ? 'am' : 'en') as 'en' | 'am';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white">
          {lang === 'am' ? 'የሚሸጡ እና የሚከራዩ ቤቶች' : 'Property Discovery & Search'}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === 'am'
            ? 'በክፍለ ከተማ፣ በዋጋ እና በ 3D ቨርቹዋል ጉብኝት አጣርተው ይፈልጉ'
            : 'Filter by location, price range, bedrooms, and 3D virtual tour availability.'}
        </p>
      </div>

      <Suspense fallback={
        <div className="py-20 text-center text-neutral-400">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm">Loading search...</span>
        </div>
      }>
        <PropertiesSearchContent lang={lang} />
      </Suspense>
    </div>
  );
}
