// src/types/agency.types.ts
// Mirrors backend Prisma Agency model

export interface Agency {
  id: string;
  admin_id?: string; // optional on frontend — not always returned by list API
  name: string; // renamed from agency_name to match Prisma schema 'name'
  description_en?: string | null;
  description_am?: string | null;
  logo_url?: string | null;
  business_license_url?: string | null;
  is_verified: boolean; // renamed from is_approved to match SRS language
  created_at: string;
  updated_at?: string;
  admin?: {
    id: string;
    phone_number: string;
    email?: string | null;
  };
  employees?: AgencyEmployee[];
  properties_count?: number;
}

export interface AgencyEmployee {
  id: string;
  agency_id: string;
  user_id: string;
  assigned_role: 'AGENT' | 'MANAGER';
  created_at: string;
  user?: {
    id: string;
    phone_number: string;
    email?: string | null;
    profile?: {
      full_name: string;
      avatar_url?: string | null;
    };
  };
}
