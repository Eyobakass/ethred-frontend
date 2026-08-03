// src/components/common/Header.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const pathname = usePathname();
  // Derive lang from pathname — default 'en' if no [lang] segment
  const lang = pathname?.split('/')[1] === 'am' ? 'am' : 'en';
  const { user, isAuthenticated, validateSession } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Validate token once on header mount (runs client-side only)
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const dashboardHref =
    user?.role === 'SELLER'
      ? `/${lang}/seller/dashboard`
      : user?.role === 'AGENCY_ADMIN' || user?.role === 'AGENCY_AGENT'
      ? `/${lang}/agency-portal/dashboard`
      : user?.role === 'ADMIN'
      ? `/${lang}/admin/dashboard`
      : `/${lang}/buyer/favorites`;

  const dashboardLabel =
    user?.role === 'SELLER'
      ? lang === 'am'
        ? 'የሻጭ ገጽ'
        : 'Seller Dashboard'
      : user?.role === 'ADMIN'
      ? 'Admin Portal'
      : lang === 'am'
      ? 'መለያዬ'
      : 'My Account';

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold-700 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <span className="text-black font-extrabold text-lg leading-none">E</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            ETHRED
            <span className="text-gold-400 text-[10px] ml-1.5 font-semibold tracking-widest uppercase">
              Real Estate
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <Link
            href={`/${lang}/properties`}
            className="hover:text-white hover:text-gold-400 transition-colors"
          >
            {lang === 'am' ? 'ቤቶች' : 'Properties'}
          </Link>
          <Link
            href={`/${lang}/agencies`}
            className="hover:text-gold-400 transition-colors"
          >
            {lang === 'am' ? 'ኤጀንሲዎች' : 'Agencies'}
          </Link>
          <Link
            href={`/${lang}/properties/compare`}
            className="hover:text-gold-400 transition-colors"
          >
            {lang === 'am' ? 'ማወዳደሪያ' : 'Compare'}
          </Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <Link
              href={dashboardHref}
              className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold transition shadow-lg shadow-gold-500/20"
            >
              {dashboardLabel}
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={`/${lang}/auth/login`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition"
              >
                {lang === 'am' ? 'ግባ' : 'Sign In'}
              </Link>
              <Link
                href={`/${lang}/auth/register`}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
              >
                {lang === 'am' ? 'ተመዝገብ' : 'Register'}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-neutral-950 border-t border-neutral-800 px-4 py-4 flex flex-col gap-3 text-sm font-medium">
          <Link href={`/${lang}/properties`} onClick={() => setMenuOpen(false)} className="text-neutral-300 hover:text-gold-400">
            {lang === 'am' ? 'ቤቶች' : 'Properties'}
          </Link>
          <Link href={`/${lang}/agencies`} onClick={() => setMenuOpen(false)} className="text-neutral-300 hover:text-gold-400">
            {lang === 'am' ? 'ኤጀንሲዎች' : 'Agencies'}
          </Link>
          <Link href={`/${lang}/properties/compare`} onClick={() => setMenuOpen(false)} className="text-neutral-300 hover:text-gold-400">
            {lang === 'am' ? 'ማወዳደሪያ' : 'Compare'}
          </Link>
          {!isAuthenticated && (
            <>
              <Link href={`/${lang}/auth/login`} onClick={() => setMenuOpen(false)} className="text-neutral-300 hover:text-white">
                {lang === 'am' ? 'ግባ' : 'Sign In'}
              </Link>
              <Link
                href={`/${lang}/auth/register`}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center"
              >
                {lang === 'am' ? 'ተመዝገብ' : 'Register'}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
