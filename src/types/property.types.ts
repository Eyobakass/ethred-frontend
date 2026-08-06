// src/types/property.types.ts

export type PropertyCategory =
  | 'HOUSE'
  | 'APARTMENT'
  | 'LAND'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'WAREHOUSE'
  | 'VACATION';

export type TransactionType = 'SALE' | 'RENT';

export type PropertyStatus = 'DRAFT' | 'PENDING' | 'PENDING_UPDATE' | 'APPROVED' | 'SUSPENDED' | 'ARCHIVED';

export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface PropertyMedia {
  id: string;
  property_id: string;
  file_url: string;
  media_category: MediaType;
  sort_order: number;
  is_tour_scene?: boolean;
  scene_name?: string | null;
  initial_yaw?: number | null;
  needs_repair?: boolean;
  fp_x?: number | null;
  fp_y?: number | null;
  hotspots?: Hotspot[];
}

export interface Hotspot {
  id: string;
  scene_id: string;
  type: 'NAVIGATION' | 'INFO';
  yaw: number;
  pitch: number;
  target_scene_id?: string | null;
  label?: string | null;
}

export interface PropertyAmenity {
  id: string;
  property_id: string;
  amenity_name: string;
}

export interface Property {
  id: string;
  owner_id: string;
  agency_id?: string | null;
  title_en: string;
  title_am?: string | null;
  description_en: string;
  description_am?: string | null;
  price_etb: number;
  price_usd?: number | null;
  transaction_mode: TransactionType;
  category: PropertyCategory;
  region: string;
  city: string;
  sub_city: string;
  woreda: string;
  kebele?: string | null;
  nearest_landmark?: string | null;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  status: PropertyStatus;
  is_featured: boolean;
  featured_tier?: string | null;
  featured_until?: string | null;
  external_tour_url?: string | null;
  floor_plan_url?: string | null;
  media?: PropertyMedia[];
  amenities?: PropertyAmenity[];
  created_at: string;
  updated_at: string;
  latitude?: number;
  longitude?: number;
  rejection_info?: {
    reason: string;
    rejected_at: string;
    rejected_by: string;
  };
}
