// src/components/common/Header.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  // Derive lang from pathname — default 'en' if no [lang] segment
  const lang = pathname?.split('/')[1] === 'am' ? 'am' : 'en';
  const { user, isAuthenticated, validateSession, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Validate token once on header mount (runs client-side only)
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const dashboardHref =
    user?.role === 'SELLER'
      ? `/${lang}/seller/dashboard`
      : user?.role === 'AGENCY_ADMIN' || user?.role === 'AGENCY_AGENT'
      ? `/${lang}/buyer/favorites`
      : user?.role === 'ADMIN'
      ? `/${lang}/admin/dashboard`
      : `/${lang}/buyer/favorites`;

  const dashboardLabel =
    user?.role === 'SELLER'
      ? lang === 'am'
        ? 'የሻጭ ገጽ'
        : 'Seller Dashboard'
      : user?.role === 'ADMIN'
      ? lang === 'am' ? 'የአስተዳዳሪ ማዕከል' : 'Admin Portal'
      : lang === 'am'
      ? 'መለያዬ'
      : 'My Account';

  return (
    <>
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-neutral-950/95 border-b border-neutral-200 dark:border-neutral-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-md bg-red-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">E</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">{lang === 'am' ? 'ኢትሬድ' : 'ETHRED'}<span className="text-neutral-400 dark:text-neutral-500 text-[11px] ml-1.5 font-semibold tracking-wide uppercase">{lang === 'am' ? 'ሪል ስቴት' : 'Real Estate'}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          <Link
            href={`/${lang}/properties`}
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >{lang === 'am' ? 'ቤቶች' : 'Properties'}</Link>
          <Link
            href={`/${lang}/agencies`}
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >{lang === 'am' ? 'ኤጀንሲዎች' : 'Agencies'}</Link>
          <Link
            href={`/${lang}/properties/compare`}
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >{lang === 'am' ? 'ያወዳድሩ' : 'Compare'}</Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle lang={lang} />
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition focus:outline-none"
              >
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md overflow-hidden py-2 z-50">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {user?.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                  
                    <div className="flex">
                      <div className="flex-1 py-2">
                        <p className="px-4 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">
                          {lang === 'am' ? 'የእኔ ኢትሬድ' : 'My Ethred'}
                        </p>
                        {user?.role === 'SELLER' && (
                          <Link href={`/${lang}/seller/dashboard`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የሻጭ ገጽ' : 'Seller Dashboard'}</Link>
                        )}
                        {user?.role === 'ADMIN' && (
                          <Link href={`/${lang}/admin/dashboard`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የአስተዳዳሪ ማዕከል' : 'Admin Portal'}</Link>
                        )}
                        {user?.role === 'AGENCY_ADMIN' && (
                          <Link href={`/${lang}/agencies/${user.agency_id || 'me'}/dashboard`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የኤጀንሲ ገጽ' : 'Agency Dashboard'}</Link>
                        )}
                        <Link href={`/${lang}/account/settings`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የአካውንት ቅንብሮች' : 'Account Settings'}</Link>
                        <Link href={`/${lang}/account/verification`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                          {lang === 'am' ? 'ማንነትዎን ያረጋግጡ' : 'Get Verified'} {!user?.is_identity_verified && <span className="ml-1 w-2 h-2 inline-block bg-red-500 rounded-full"></span>}
                        </Link>
                        <Link href={`/${lang}/account/billing`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የክፍያ ታሪክ' : 'Billing History'}</Link>
                        <Link href={`/${lang}/buyer/favorites`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የተቀመጡ ቤቶች' : 'Favorites'}</Link>
                        {user?.role === 'BUYER' && (
                          <Link href={`/${lang}/buyer/inquiries`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የእኔ ጥያቄዎች' : 'My Inquiries'}</Link>
                        )}
                        {user?.role === 'SELLER' && (
                          <Link href={`/${lang}/seller/inquiries`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የደረሱኝ ጥያቄዎች' : 'Inquiries Received'}</Link>
                        )}
                        {user?.role === 'ADMIN' && (
                          <>
                            <Link href={`/${lang}/admin/users`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'ተጠቃሚዎች' : 'Users'}</Link>
                            <Link href={`/${lang}/admin/agencies`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'ኤጀንሲዎች' : 'Agencies'}</Link>
                            <Link href={`/${lang}/admin/audit-logs`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">{lang === 'am' ? 'የኦዲት መዝገቦች' : 'Audit Logs'}</Link>
                          </>
                        )}
                        {(!user?.role || !['AGENCY_ADMIN', 'AGENCY_AGENT'].includes(user.role)) && (
                          <Link href={`/${lang}/agencies/apply`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">{lang === 'am' ? 'ኤጀንሲዎን ይመዝገቡ' : 'Register Your Agency'}</Link>
                        )}
                      </div>
                    <div className="flex-1 py-2 border-l border-neutral-100 dark:border-neutral-800">
                      <p className="px-4 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">{lang === 'am' ? 'ቅንብሮች' : 'Settings'}</p>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowPasswordModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >{lang === 'am' ? 'የይለፍ ቃል ቀይር' : 'Change password'}</button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >{lang === 'am' ? 'አካውንት ሰርዝ' : 'Delete account'}</button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >{lang === 'am' ? 'ውጣ' : 'Sign out'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={`/${lang}/auth/login`}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
              >{lang === 'am' ? 'ይግቡ' : 'Sign In'}</Link>
              <Link
                href={`/${lang}/auth/register`}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
              >{lang === 'am' ? 'ይመዝገቡ' : 'Register'}</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
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
        <div className="md:hidden bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 px-4 py-4 flex flex-col gap-1 text-sm font-medium">
          <Link href={`/${lang}/properties`} onClick={() => setMenuOpen(false)} className="py-2.5 text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400">{lang === 'am' ? 'ቤቶች' : 'Properties'}</Link>
          <Link href={`/${lang}/agencies`} onClick={() => setMenuOpen(false)} className="py-2.5 text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400">{lang === 'am' ? 'ኤጀንሲዎች' : 'Agencies'}</Link>
          <Link href={`/${lang}/properties/compare`} onClick={() => setMenuOpen(false)} className="py-2.5 text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400">{lang === 'am' ? 'ያወዳድሩ' : 'Compare'}</Link>
          {!isAuthenticated && (
            <>
              <Link href={`/${lang}/auth/login`} onClick={() => setMenuOpen(false)} className="py-2.5 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white">{lang === 'am' ? 'ይግቡ' : 'Sign In'}</Link>
              <Link
                href={`/${lang}/auth/register`}
                onClick={() => setMenuOpen(false)}
                className="mt-1 px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold text-center transition"
              >{lang === 'am' ? 'ይመዝገቡ' : 'Register'}</Link>
            </>
          )}
        </div>
      )}
    </header>

    {/* Custom Logout Confirmation Modal */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-lg border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{lang === 'am' ? 'ውጣ' : 'Sign Out'}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{lang === 'am' ? 'በእርግጠኝነት ከአካውንትዎ መውጣት ይፈልጋሉ?' : 'Are you sure you want to sign out of your account?'}</p>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 rounded-md font-medium text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >{lang === 'am' ? 'ሰርዝ' : 'Cancel'}</button>
            <button
              onClick={async () => {
                setShowLogoutConfirm(false);
                try {
                  const { authService } = await import('@/services/auth.service');
                  await authService.logout();
                } catch (e) { console.error(e); }
                logout();
                router.push(`/${lang}`);
              }}
              className="px-4 py-2 rounded-md font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition"
            >{lang === 'am' ? 'ውጣ' : 'Sign Out'}</button>
          </div>
        </div>
      </div>
    )}

    {/* Change Password Modal */}
    <ChangePasswordModal 
      isOpen={showPasswordModal} 
      onClose={() => setShowPasswordModal(false)} 
    />

    {/* Delete Account Modal */}
    <DeleteAccountModal 
      isOpen={showDeleteModal} 
      onClose={() => setShowDeleteModal(false)} 
      lang={lang}
    />
    </>
  );
};
