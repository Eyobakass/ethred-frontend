// src/components/common/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const lang = pathname?.split('/').filter(Boolean)[0] === 'am' ? 'am' : 'en';
  const { user, isAuthenticated } = useAuth();

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800/60 text-neutral-600 dark:text-neutral-400 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center shadow-lg shadow-red-600 dark:shadow-red-600/20">
              <span className="text-black font-extrabold text-lg">E</span>
            </div>
            <span className="text-neutral-900 dark:text-white font-extrabold text-lg tracking-tight">ETHRED</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-[220px]">
            {lang === 'am'
              ? 'የኢትዮጵያ ዘመናዊ የሪል ስቴት ምህዳር — ከ 3D ቨርቹዋል ጉብኝት ጋር።'
              : 'The modern Ethiopian real estate ecosystem — verified listings with 3D virtual tours.'}
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-neutral-900 dark:text-white font-semibold text-sm mb-3">
            {lang === 'am' ? 'ቤቶች' : 'Explore'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link href={`/${lang}/properties?category=APARTMENT`} className="hover:text-red-600 dark:text-red-400 transition">Apartments for Sale</Link></li>
            <li><Link href={`/${lang}/properties?category=HOUSE`} className="hover:text-red-600 dark:text-red-400 transition">Villa Houses</Link></li>
            <li><Link href={`/${lang}/properties?category=COMMERCIAL`} className="hover:text-red-600 dark:text-red-400 transition">Commercial Spaces</Link></li>
            <li><Link href={`/${lang}/properties?transaction_mode=RENT`} className="hover:text-red-600 dark:text-red-400 transition">For Rent</Link></li>
            <li><Link href={`/${lang}/properties/compare`} className="hover:text-red-600 dark:text-red-400 transition">Compare Properties</Link></li>
          </ul>
        </div>

        {/* Payment Partners */}
        <div>
          <h4 className="text-neutral-900 dark:text-white font-semibold text-sm mb-3">
            {lang === 'am' ? 'የክፍያ አጋሮች' : 'Payment Partners'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2"><span>📱</span> Telebirr (Ethio Telecom)</li>
            <li className="flex items-center gap-2"><span>🏦</span> CBE Birr</li>
            <li className="flex items-center gap-2"><span>💳</span> Chapa Payment Gateway</li>
            <li className="flex items-center gap-2"><span>💰</span> SantimPay</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-neutral-900 dark:text-white font-semibold text-sm mb-3">
            {lang === 'am' ? 'ድጋፍ' : 'Contact & Support'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>📍 Addis Ababa, Ethiopia</li>
            <li>📞 +251 911 000 000</li>
            <li>✉️ support@ethred.com</li>
            <li>
              <Link
                href={
                  isAuthenticated && user?.role === 'SELLER'
                    ? `/${lang}/seller/listings/create`
                    : `/${lang}/auth/register`
                }
                className="hover:text-red-600 dark:text-red-400 transition"
              >
                List your property
              </Link>
            </li>
            <li><Link href={`/${lang}/agencies`} className="hover:text-red-600 dark:text-red-400 transition">Agency registration</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-600">
        <p>© {new Date().getFullYear()} Ethred Real Estate Ecosystem. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <span>Built for 🇪🇹 Ethiopia</span>
          <span className="mx-2">·</span>
          <span>3D by Pannellum WebGL</span>
        </div>
      </div>
    </footer>
  );
};
