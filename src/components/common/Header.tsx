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
    <>
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center shadow-lg shadow-red-600 dark:shadow-red-600/20">
            <span className="text-white font-extrabold text-lg leading-none">E</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            ETHRED
            <span className="text-red-600 dark:text-red-400 text-[10px] ml-1.5 font-semibold tracking-widest uppercase">
              Real Estate
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <Link
            href={`/${lang}/properties`}
            className="hover:text-neutral-900 dark:text-white hover:text-red-600 dark:text-red-400 transition-colors"
          >
            {lang === 'am' ? 'ቤቶች' : 'Properties'}
          </Link>
          <Link
            href={`/${lang}/agencies`}
            className="hover:text-red-600 dark:text-red-400 transition-colors"
          >
            {lang === 'am' ? 'ኤጀንሲዎች' : 'Agencies'}
          </Link>
          <Link
            href={`/${lang}/properties/compare`}
            className="hover:text-red-600 dark:text-red-400 transition-colors"
          >
            {lang === 'am' ? 'ማወዳደሪያ' : 'Compare'}
          </Link>
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
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {user?.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-1 py-2">
                      <p className="px-4 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                        My Ethred
                      </p>
                      <Link
                        href={dashboardHref}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        {dashboardLabel}
                      </Link>
                      <Link
                        href={`/${lang}/buyer/favorites`}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        {lang === 'am' ? 'ተወዳጆች' : 'Favorites'}
                      </Link>
                    </div>
                    <div className="flex-1 py-2 border-l border-neutral-100 dark:border-neutral-800">
                      <p className="px-4 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                        Settings
                      </p>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowPasswordModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        Change password
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        Delete account
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={`/${lang}/auth/login`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white transition"
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
            className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-50 dark:bg-neutral-800 transition"
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
        <div className="md:hidden bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 px-4 py-4 flex flex-col gap-3 text-sm font-medium">
          <Link href={`/${lang}/properties`} onClick={() => setMenuOpen(false)} className="text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:text-red-400">
            {lang === 'am' ? 'ቤቶች' : 'Properties'}
          </Link>
          <Link href={`/${lang}/agencies`} onClick={() => setMenuOpen(false)} className="text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:text-red-400">
            {lang === 'am' ? 'ኤጀንሲዎች' : 'Agencies'}
          </Link>
          <Link href={`/${lang}/properties/compare`} onClick={() => setMenuOpen(false)} className="text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:text-red-400">
            {lang === 'am' ? 'ማወዳደሪያ' : 'Compare'}
          </Link>
          {!isAuthenticated && (
            <>
              <Link href={`/${lang}/auth/login`} onClick={() => setMenuOpen(false)} className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:text-white">
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

    {/* Custom Logout Confirmation Modal */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 transform transition-all">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Sign Out
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-5 py-2.5 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
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
              className="px-5 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition"
            >
              Sign Out
            </button>
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
