// src/store/useFilterStore.ts
import { create } from 'zustand';
import { PropertyCategory, TransactionType } from '@/types/property.types';

export interface FilterState {
  region: string;
  city: string;
  sub_city: string;
  woreda: string;
  category: PropertyCategory | '';
  transaction_mode: TransactionType | '';
  price_min: number | string;
  price_max: number | string;
  bedrooms: number | string;
  search_query: string;
  has_virtual_tour: boolean;
  setFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
}

const initialFilters = {
  region: '',
  city: '',
  sub_city: '',
  woreda: '',
  category: '' as PropertyCategory | '',
  transaction_mode: '' as TransactionType | '',
  price_min: '',
  price_max: '',
  bedrooms: '',
  search_query: '',
  has_virtual_tour: false,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  resetFilters: () => set(initialFilters),
}));
