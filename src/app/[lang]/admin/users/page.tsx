// src/app/[lang]/admin/users/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';

const ROLE_COLORS: Record<string, string> = {
  BUYER: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
  SELLER: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  ADMIN: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  AGENCY_ADMIN: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
  AGENCY_AGENT: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400',
};

export default function AdminUsersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await adminService.listUsers({
        page, limit: LIMIT,
        role: roleFilter || undefined,
        search: search.trim() || undefined,
      });
      const list = Array.isArray(res) ? res
        : Array.isArray(res?.results) ? res.results
        : Array.isArray(res?.data) ? res.data : [];
      setUsers(list);
      setTotal(res?.total ?? res?.count ?? list.length);
    } catch {
      setError('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Admin</p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{lang === 'am' ? 'የተጠቃሚዎች አስተዳደር' : 'User Management'}</h1>
        </div>
        <Link href={`/${lang}/admin/dashboard`}
          className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder={lang === 'am' ? 'በስም ወይም በኢሜል ይፈልጉ...' : 'Search by name or email…'}
          className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition"
        />
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-red-500 transition"
        >
          <option value="">{lang === 'am' ? 'ሁሉም የኃላፊነት ድርሻዎች' : 'All Roles'}</option>
          {['BUYER', 'SELLER', 'ADMIN', 'AGENCY_ADMIN', 'AGENCY_AGENT'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button onClick={fetchUsers}
          className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm font-medium text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 dark:text-neutral-700 mb-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{lang === 'am' ? 'ምንም ተጠቃሚ አልተገኘም።' : 'No users found.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                    {['User', 'Email', 'Role', 'Verified', 'Joined', ''].map(h => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {user.profile?.avatar_url
                              ? <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                              : <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                                  {(user.profile?.full_name || user.email || '?')[0].toUpperCase()}
                                </span>
                            }
                          </div>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {user.profile?.full_name || '(No name)'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${ROLE_COLORS[user.role] ?? ROLE_COLORS.BUYER}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 ${user.is_identity_verified ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-400'}`}>
                          {user.is_identity_verified ? (
                            <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Verified</>
                          ) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString('en-ET')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/${lang}/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          {lang === 'am' ? 'ተመልከት' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Page {page} of {totalPages} · {total} total</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1">
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
