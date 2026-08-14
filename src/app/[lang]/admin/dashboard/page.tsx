// src/app/[lang]/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { AdminDashboardStats } from '@/types/index';
import { adminService } from '@/services/admin.service';
import { formatCurrency } from '@/utils/currency';

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
    if (!window.confirm('Approve this listing?')) return;
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
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">🛡️ Platform Administration</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">Admin Dashboard</h1>
      </div>

      {/* Quick Nav */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: `/${lang}/admin/users`, label: '👥 Users' },
          { href: `/${lang}/admin/agencies`, label: '🏢 Agencies' },
          { href: `/${lang}/admin/audit-logs`, label: '📋 Audit Logs' },
        ].map(({ href, label }) => (
          <Link key={href} href={href}
            className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition shadow-sm">
            {label}
          </Link>
        ))}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            emoji="👥"
            label="Total Users"
            value={stats.users?.total ?? 0}
            sub={`${stats.users?.by_role?.find((r: any) => r.role === 'SELLER')?._count?.id ?? 0} sellers`}
            color="blue"
          />
          <StatCard
            emoji="🏠"
            label="Properties"
            value={stats.properties?.total ?? 0}
            sub={`${stats.properties?.pending ?? 0} pending`}
            color="amber"
          />
          <StatCard
            emoji="🏢"
            label="Agencies"
            value={stats.agencies?.total ?? 0}
            sub={`${stats.agencies?.pending ?? 0} pending`}
            color="purple"
          />
          <StatCard
            emoji="💰"
            label="Revenue (ETB)"
            value={formatCurrency(stats.revenue?.total_etb ?? 0, 'ETB', lang as 'en' | 'am')}
            sub={`${stats.revenue?.completed_count ?? 0} completed payments`}
            color="emerald"
          />
        </div>
      )}

      {/* Pending Queue */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm">
            📥 Pending Review Queue
            {pendingTotal > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold">{pendingTotal}</span>
            )}
          </h2>
          {!isLoading && (
            <button onClick={() => fetchAll(pendingPage)}
              className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition">🔄 Refresh</button>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">⚠️ {loadError}</p>
            <button onClick={() => fetchAll(pendingPage)}
              className="mt-3 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
              Retry
            </button>
          </div>
        ) : pendingProperties.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">All caught up! No pending properties.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {pendingProperties.map(item => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                  {item.media?.[0]?.file_url ? (
                    <img
                      src={item.media[0].file_url.startsWith('http') ? item.media[0].file_url
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.media[0].file_url}`}
                      alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=60'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
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
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                    👁 Review
                  </Link>
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={!!actionInProgress[item.id]}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50">
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => openReasonModal(item.id, 'reject')}
                    disabled={!!actionInProgress[item.id]}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition disabled:opacity-50">
                    ✗ Reject
                  </button>
                  <button
                    onClick={() => openReasonModal(item.id, 'suspend')}
                    disabled={!!actionInProgress[item.id]}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition disabled:opacity-50">
                    ⚠ Suspend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Page {pendingPage} of {totalPages} · {pendingTotal} total</span>
            <div className="flex gap-2">
              <button onClick={() => setPendingPage(p => Math.max(1, p - 1))} disabled={pendingPage <= 1}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                ← Prev
              </button>
              <button onClick={() => setPendingPage(p => Math.min(totalPages, p + 1))} disabled={pendingPage >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reason Modal */}
      {reasonModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {reasonModal.mode === 'reject' ? '✗ Reject Listing' : '⚠ Suspend Listing'}
              </h3>
              <button onClick={() => setReasonModal({ open: false, propertyId: null, mode: 'reject' })}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xl">×</button>
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
              placeholder="Provide a clear, specific reason (min. 5 characters)…"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 resize-none transition"
            />
            {reasonError && (
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{reasonError}</p>
            )}
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setReasonModal({ open: false, propertyId: null, mode: 'reject' })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                Cancel
              </button>
              <button
                onClick={submitReason}
                disabled={isSubmittingReason || reasonText.trim().length < 5}
                className={`px-5 py-2 rounded-xl text-white text-sm font-bold transition disabled:opacity-50 ${
                  reasonModal.mode === 'reject' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-500 hover:bg-amber-400'
                }`}>
                {isSubmittingReason ? 'Submitting…' : reasonModal.mode === 'reject' ? 'Send Rejection' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ emoji, label, value, sub, color }: {
  emoji: string; label: string; value: string | number; sub: string;
  color: 'blue' | 'amber' | 'purple' | 'emerald';
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50',
    purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-xl font-extrabold text-neutral-900 dark:text-white mt-0.5">{value}</p>
      <p className="text-[11px] text-neutral-500 mt-0.5">{sub}</p>
    </div>
  );
}
