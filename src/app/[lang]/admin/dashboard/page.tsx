// src/app/[lang]/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { AdminDashboardStats } from '@/types/index';
import { adminService } from '@/services/admin.service';
import { formatCurrency } from '@/utils/currency';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmModal } from '@/components/common/ConfirmModal';

type ReasonModal = { open: boolean; propertyId: string | null; mode: 'reject' | 'suspend' };

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
  PENDING_UPDATE: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
  DRAFT: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700',
};

export default function AdminDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [reasonModal, setReasonModal] = useState<ReasonModal>({ open: false, propertyId: null, mode: 'reject' });
  const [reasonText, setReasonText] = useState('');
  const [isSubmittingReason, setIsSubmittingReason] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);

  const { confirm, ConfirmProps } = useConfirm();

  const LIMIT = 10;

  const fetchAll = useCallback(async (page: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminService.getDashboardStats().catch(() => null),
        adminService.getPendingProperties({ page, limit: LIMIT }),
      ]);
      if (statsRes) setStats(statsRes);
      const p: any = pendingRes;
      const list = Array.isArray(p) ? p
        : Array.isArray(p?.results) ? p.results
        : Array.isArray(p?.data) ? p.data : [];
      const total = p?.total ?? p?.count ?? list.length;
      setPendingProperties(list);
      setPendingTotal(total);
    } catch {
      setLoadError('Could not load dashboard data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(pendingPage); }, [fetchAll, pendingPage]);

  const setProgress = (id: string, v: boolean) =>
    setActionInProgress(p => ({ ...p, [id]: v }));

  const handleApprove = async (id: string) => {
    if (actionInProgress[id]) return;
    if (!(await confirm({ message: 'Approve this listing?', confirmLabel: 'Approve' }))) return;
    setProgress(id, true);
    try {
      await adminService.approveProperty(id);
      setPendingProperties(p => p.filter(x => x.id !== id));
      setPendingTotal(t => Math.max(0, t - 1));
    } catch (err: any) {
      alert(err?.message || 'Failed to approve.');
    } finally { setProgress(id, false); }
  };

  const openReasonModal = (id: string, mode: 'reject' | 'suspend') => {
    setReasonModal({ open: true, propertyId: id, mode });
    setReasonText('');
    setReasonError(null);
  };

  const submitReason = async () => {
    setReasonError(null);
    if (!reasonModal.propertyId) return;
    if (reasonText.trim().length < 5) {
      setReasonError('Reason must be at least 5 characters.');
      return;
    }
    setIsSubmittingReason(true);
    try {
      if (reasonModal.mode === 'reject') {
        await adminService.rejectProperty(reasonModal.propertyId, reasonText.trim());
      } else {
        await adminService.suspendProperty(reasonModal.propertyId, reasonText.trim());
      }
      setPendingProperties(p => p.filter(x => x.id !== reasonModal.propertyId));
      setPendingTotal(t => Math.max(0, t - 1));
      setReasonModal({ open: false, propertyId: null, mode: 'reject' });
    } catch (err: any) {
      setReasonError(err?.message || 'Action failed.');
    } finally { setIsSubmittingReason(false); }
  };

  const totalPages = Math.ceil(pendingTotal / LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">{lang === 'am' ? 'የፕላትፎርም አስተዳደር' : 'Platform Administration'}</p>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{lang === 'am' ? 'የአስተዳዳሪ ዳሽቦርድ' : 'Admin Dashboard'}</h1>
      </div>

      {/* Quick Nav */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: `/${lang}/admin/users`, label: 'Users', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline-block"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { href: `/${lang}/admin/agencies`, label: 'Agencies', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline-block"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> },
          { href: `/${lang}/admin/audit-logs`, label: 'Audit Logs', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline-block"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href}
            className="px-4 py-2.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition shadow-sm">
            {icon}{label}
          </Link>
        ))}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            label="Total Users"
            value={stats.users?.total ?? 0}
            sub={`${stats.users?.by_role?.find((r: any) => r.role === 'SELLER')?._count?.id ?? 0} sellers`}
          />
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>}
            label="Properties"
            value={stats.properties?.total ?? 0}
            sub={`${stats.properties?.pending ?? 0} pending`}
          />
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>}
            label="Agencies"
            value={stats.agencies?.total ?? 0}
            sub={`${stats.agencies?.pending ?? 0} pending`}
          />
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            label="Revenue (ETB)"
            value={formatCurrency(stats.revenue?.total_etb ?? 0, 'ETB', lang as 'en' | 'am')}
            sub={`${stats.revenue?.completed_count ?? 0} completed payments`}
          />
        </div>
      )}

      {/* Pending Queue */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Pending Review Queue
            {pendingTotal > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold">{pendingTotal}</span>
            )}
          </h2>
          {!isLoading && (
            <button onClick={() => fetchAll(pendingPage)}
              className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Refresh
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{loadError}</p>
            <button onClick={() => fetchAll(pendingPage)}
              className="mt-3 px-4 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
              Retry
            </button>
          </div>
        ) : pendingProperties.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{lang === 'am' ? 'ምንም የሚጠብቁ ቤቶች የሉም።' : 'All caught up! No pending properties.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {pendingProperties.map(item => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                  {item.media?.[0]?.file_url ? (
                    <img
                      src={item.media[0].file_url.startsWith('http') ? item.media[0].file_url
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.media[0].file_url}`}
                      alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=60'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-500"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{item.title_en}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[item.status] ?? STATUS_BADGE.DRAFT}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {item.sub_city}, {item.city} · {item.category} · {item.price_etb ? formatCurrency(Number(item.price_etb), 'ETB', lang as 'en' | 'am') : '—'}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Submitted: {new Date(item.created_at).toLocaleDateString('en-ET')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <Link href={`/${lang}/admin/properties/${item.id}/review`}
                    className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    Review
                  </Link>
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={!!actionInProgress[item.id]}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    Approve
                  </button>
                  <button
                    onClick={() => openReasonModal(item.id, 'reject')}
                    disabled={!!actionInProgress[item.id]}
                    className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    Reject
                  </button>
                  <button
                    onClick={() => openReasonModal(item.id, 'suspend')}
                    disabled={!!actionInProgress[item.id]}
                    className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    Suspend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">Page {pendingPage} of {totalPages} · {pendingTotal} total</span>
            <div className="flex gap-2">
              <button onClick={() => setPendingPage(p => Math.max(1, p - 1))} disabled={pendingPage <= 1}
                className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Prev
              </button>
              <button onClick={() => setPendingPage(p => Math.min(totalPages, p + 1))} disabled={pendingPage >= totalPages}
                className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1">
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reason Modal */}
      {reasonModal.open && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                {reasonModal.mode === 'reject' ? (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> Reject Listing</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> Suspend Listing</>
                )}
              </h3>
              <button onClick={() => setReasonModal({ open: false, propertyId: null, mode: 'reject' })}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-xs text-neutral-500">
              {reasonModal.mode === 'reject'
                ? 'This reason will be sent to the seller so they can fix the issues and resubmit.'
                : 'Suspended listings are hidden from buyers. Provide a clear reason.'}
            </p>
            <textarea
              rows={4}
              value={reasonText}
              onChange={e => { setReasonText(e.target.value); setReasonError(null); }}
              placeholder={lang === 'am' ? 'ግልጽ እና የተለየ ምክንያት ያቅርቡ (ቢያንስ 5 ፊደላት)...' : 'Provide a clear, specific reason (min. 5 characters)…'}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 resize-none transition"
            />
            {reasonError && (
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{reasonError}</p>
            )}
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setReasonModal({ open: false, propertyId: null, mode: 'reject' })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                Cancel
              </button>
              <button
                onClick={submitReason}
                disabled={isSubmittingReason || reasonText.trim().length < 5}
                className={`px-5 py-2 rounded-md text-white text-sm font-semibold transition disabled:opacity-50 ${
                  reasonModal.mode === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}>
                {isSubmittingReason ? 'Submitting…' : reasonModal.mode === 'reject' ? 'Send Rejection' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal {...ConfirmProps} />
    </div>
  );
}

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <div className="text-neutral-400 mb-2">{icon}</div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{value}</p>
      <p className="text-[11px] text-neutral-500 mt-1">{sub}</p>
    </div>
  );
}
