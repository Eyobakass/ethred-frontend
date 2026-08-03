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
      await propertyService.toggleFavorite(propertyId);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    } catch {
      // silent fail
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-800 pb-6">
        <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-1">
          ❤️ Saved Properties
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {lang === 'am' ? 'የተቀመጡ ቤቶቼ' : 'My Favorite Properties'}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === 'am'
            ? 'ያዳኗቸውን ቤቶች ዝርዝር'
            : 'Properties you have saved for later review.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm">Loading your saved properties...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="py-20 text-center space-y-4">
          <span className="text-5xl block">🔐</span>
          <h2 className="text-xl font-bold text-white">Sign In Required</h2>
          <p className="text-sm text-neutral-400">You need to be logged in to view saved favorites.</p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex px-6 py-3 rounded-xl bg-gold-500 text-black font-bold text-sm"
          >
            Sign In
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <span className="text-5xl block">💔</span>
          <h2 className="text-xl font-bold text-white">
            {lang === 'am' ? 'ምንም ቤቶች አልተቀመጡም' : 'No Saved Properties Yet'}
          </h2>
          <p className="text-sm text-neutral-400">
            {lang === 'am'
              ? 'ቤቶችን ሲያስሱ ❤️ ቁልፍ ተጫኑ'
              : 'Click the ❤️ heart button on any property to save it here.'}
          </p>
          <Link
            href={`/${lang}/properties`}
            className="inline-flex px-6 py-3 rounded-xl bg-gold-500 text-black font-bold text-sm"
          >
            {lang === 'am' ? 'ቤቶችን ይፈልጉ' : 'Browse Properties'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} lang={lang} />
              <button
                onClick={() => handleRemoveFavorite(property.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/80 text-red-400 hover:text-red-300 hover:bg-black transition flex items-center justify-center text-sm"
                title="Remove from favorites"
              >
                ❤️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
