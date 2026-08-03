// src/types/auth.types.ts

export type UserRole = 'BUYER' | 'SELLER' | 'AGENCY_ADMIN' | 'AGENCY_AGENT' | 'ADMIN';

export interface User {
  id: string;
  email: string | null;
  phone_number: string;
  role: UserRole;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  profile?: Profile;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  preferred_language: 'en' | 'am';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
