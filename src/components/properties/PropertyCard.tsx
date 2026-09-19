// src/components/properties/PropertyCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { formatCurrency } from '@/utils/currency';
import { getImageUrl } from '@/utils/imageUrl';
import { createWhatsAppInquiryLink } from '@/utils/whatsapp';
import { Box } from 'lucide-react';

const translateLocation = (loc: string, lang: string) => {
  if (lang !== 'am' || !loc) return loc;
  const map: Record<string, string> = {
    'Addis Ababa': 'አዲስ አበባ',
    'Bole': 'ቦሌ',
    'Yeka': 'የካ',
    'CMC': 'ሲኤምሲ',
    'Kazanchis': 'ካዛንቺስ',
    'Sarbet': 'ሳርቤት',
    'Hawassa': 'ሀዋሳ',
  };
  return map[loc] || loc;
};

interface PropertyCardProps {
  property: Property;
  lang?: 'en' | 'am';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, lang = 'en' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const standardImages = property.media?.filter((m) => m.media_category === 'IMAGE' && !m.is_tour_scene).map(m => getImageUrl(m.file_url)) || [];
  const allMediaImages = property.media?.map(m => getImageUrl(m.file_url)) || [];
  let images = standardImages.length > 0 ? standardImages : (allMediaImages.length > 0 ? allMediaImages : []);

  if (images.length === 0 && (property as any).thumbnail_url) {
    images = [getImageUrl((property as any).thumbnail_url)];
  }

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
      className="block group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden transition-all duration-150 flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-800">
        <img
          src={images[currentIndex]}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-150"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap z-10">
          {images.length > 1 && (
            <div className="bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm">
              {currentIndex + 1}/{images.length}
            </div>
          )}
          {property.is_featured && (
            <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[11px] font-medium px-2 py-0.5 rounded shadow-sm uppercase">
              {lang === 'am' ? 'ልዩ' : 'FEATURED'}
            </div>
          )}
          {(property.external_tour_url || property.media?.some((m) => m.is_tour_scene)) && (
            <div className="bg-red-600 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm uppercase flex items-center gap-1">
              <Box size={12} />
              {lang === 'am' ? '3D ጉብኝት' : '3D TOUR'}
            </div>
          )}
        </div>

        {/* Quick WhatsApp Inquiry Link (SRS REQ-COMM-02) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(
              createWhatsAppInquiryLink({
                phone: (property as any).owner?.phone_number || (property as any).agency?.phone_number,
                propertyTitle: title,
                priceEtb: Number(property.price_etb),
                propertyId: property.id,
                lang,
              }),
              '_blank',
              'noopener,noreferrer'
            );
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition z-20"
          title={lang === 'am' ? 'በዋትስአፕ አነጋግር' : 'Chat on WhatsApp'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </button>

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
          <div className="text-[17px] font-bold text-neutral-900 dark:text-white tabular-nums">
            {formatCurrency(Number(property.price_etb), 'ETB', lang)}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-1">
          <span>{property.bedrooms} {lang === 'am' ? 'መኝታ' : 'beds'}</span>
          <span>{property.bathrooms} {lang === 'am' ? 'መታጠቢያ' : 'baths'}</span>
          <span>{property.area_sqm} {lang === 'am' ? 'ካሬ ሜትር' : 'm²'}</span>
        </div>

        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 truncate">
          {translateLocation(property.sub_city, lang)}, {translateLocation(property.city, lang)} {property.woreda && `• ${lang === 'am' ? 'ወረዳ' : 'Woreda'} ${property.woreda.replace(/^Woreda\s*/i, '')}`}
        </div>
      </div>
    </Link>
  );
};
