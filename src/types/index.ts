// src/types/index.ts
// Shared cross-feature types for Ethred platform

export type PropertyInquiry = {
  id: string;
  property_id: string;
  buyer_id: string;
  message: string;
  status: 'NEW' | 'SEEN' | 'RESOLVED';
  created_at: string;
  updated_at?: string;
  property?: { id: string; title_en: string; title_am?: string | null };
  buyer?: {
    id: string;
    email?: string;
    profile?: { full_name?: string; avatar_url?: string };
  };
  seller?: {
    id: string;
    email?: string;
    profile?: { full_name?: string; avatar_url?: string };
  };
};

export type Agency = {
  id: string;
  admin_id: string;
  agency_name: string;
  logo_url?: string | null;
  business_license_url: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
};

export type AgencyEmployee = {
  id: string;
  agency_id: string;
  user_id: string;
  assigned_role: string;
  created_at: string;
  user?: { id: string; profile?: { full_name?: string; avatar_url?: string } };
};

export type BillingInvoice = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  tx_ref: string;
  payment_processor: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  created_at: string;
  property?: { id: string; title_en: string };
};

export type AuditLog = {
  id: string;
  actor_id?: string | null;
  action: string;
  target_table: string;
  target_id?: string | null;
  old_values?: any;
  new_values?: any;
  created_at: string;
  actor?: { id: string; email: string; role: string };
};

export type AdminDashboardStats = {
  users: {
    total: number;
    by_role: { role: string; _count: { id: number } }[];
  };
  properties: {
    total: number;
    pending: number;
    by_category: { category: string; _count: { id: number } }[];
  };
  agencies: { total: number; pending: number };
  revenue: {
    total_invoices: number;
    completed_count: number;
    total_etb: number;
  };
};

export type AdminUser = {
  id: string;
  email: string;
  phone?: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | 'AGENCY_ADMIN' | 'AGENCY_AGENT';
  is_email_verified: boolean;
  is_identity_verified: boolean;
  is_banned: boolean;
  created_at: string;
  profile?: {
    full_name?: string;
    avatar_url?: string;
    preferred_language?: string;
  };
  _count?: { properties: number };
};
