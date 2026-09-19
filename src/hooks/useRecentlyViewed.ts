// src/hooks/useRecentlyViewed.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types/property.types';

export interface RecentlyViewedItem {
  id: string;
  title_en: string;
  title_am?: string;
  price_etb: number;
  price_usd?: number;
  category: string;
  transaction_mode: string;
  city: string;
  sub_city: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  thumbnail_url?: string;
  viewed_at: number;
}

const STORAGE_KEY = 'ethred_recently_viewed_properties_v1';
const MAX_ITEMS = 20;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RecentlyViewedItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Graceful fallback for quota / private browsing
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addRecentlyViewed = useCallback((property: Property) => {
    if (!property || !property.id) return;

    try {
      const rawStored = localStorage.getItem(STORAGE_KEY);
      const existing: RecentlyViewedItem[] = rawStored ? JSON.parse(rawStored) : [];

      const filtered = existing.filter((i) => i.id !== property.id);

      // Determine primary image
      const primaryImage =
        property.media?.find((m) => m.sort_order === 0)?.file_url ||
        property.media?.[0]?.file_url ||
        (property as any).thumbnail_url ||
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

      const newItem: RecentlyViewedItem = {
        id: property.id,
        title_en: property.title_en,
        title_am: property.title_am || undefined,
        price_etb: Number(property.price_etb) || 0,
        price_usd: property.price_usd ? Number(property.price_usd) : undefined,
        category: property.category || 'HOUSE',
        transaction_mode: property.transaction_mode || 'SALE',
        city: property.city || '',
        sub_city: property.sub_city || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqm: property.area_sqm ? Number(property.area_sqm) : undefined,
        thumbnail_url: primaryImage,
        viewed_at: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
    } catch (e) {
      console.warn('Failed to save to recently viewed:', e);
    }
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } catch (e) {
      console.warn('Failed to clear recently viewed:', e);
    }
  }, []);

  return {
    recentlyViewed: items,
    isLoaded,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
}
