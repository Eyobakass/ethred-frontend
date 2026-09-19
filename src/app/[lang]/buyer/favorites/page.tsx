// src/app/[lang]/buyer/favorites/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function BuyerFavoritesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const { isAuthenticated, validateSession } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  useEffect(() => {
    if (!isAuthenticated) return;
    propertyService
      .getFavorites()
      .then((res) => {
        if (Array.isArray(res)) setFavorites(res);
      })
      .catch(() => {
        // Demo data when backend not available
        setFavorites([]);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await propertyService.removeFavorite(propertyId);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err: any) {
      console.error('Failed to remove favorite:', err?.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> Saved Properties
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {lang === 'am' ? 'የተቀመጡ ቤቶቼ' : 'My Favorite Properties'}
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {lang === 'am'
            ? 'ያዳኗቸውን ቤቶች ዝርዝር'
            : 'Properties you have saved for later review.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">{lang === 'am' ? 'የተቀመጡ ቤቶችዎን በማምጣት ላይ...' : 'Loading your saved properties...'}</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="py-20 text-center space-y-4 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 dark:text-neutral-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{lang === 'am' ? 'መግባት ያስፈልጋል' : 'Sign In Required'}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{lang === 'am' ? 'የተቀመጡ ቤቶችን ለማየት ወደ ሲስተም መግባት አለብዎት።' : 'You need to be logged in to view saved favorites.'}</p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
          >
            Sign In
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center space-y-4 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 dark:text-neutral-600"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'ምንም ቤቶች አልተቀመጡም' : 'No Saved Properties Yet'}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 justify-center">
            {lang === 'am'
              ? <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> ቤቶችን ሲያስሱ ቁልፍ ተጫኑ</>
              : <>Click the <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> heart button on any property to save it here.</>}
          </p>
          <Link
            href={`/${lang}/properties`}
            className="inline-flex px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
          >
            {lang === 'am' ? 'ቤቶችን ይፈልጉ' : 'Browse Properties'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <div key={property.id} className="relative group">
              <PropertyCard property={property} lang={lang} />
              <button
                onClick={() => handleRemoveFavorite(property.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-red-500 hover:text-red-400 hover:bg-black transition flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-md"
                title="Remove from favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
