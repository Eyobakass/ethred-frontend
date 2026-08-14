// src/app/[lang]/admin/agencies/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';

export default function AdminAgenciesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; agencyId: string | null }>({ open: false, agencyId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [globalMsg, setGlobalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAgencies = () => {
    setIsLoading(true);
    setError(null);
    adminService.getPendingAgencies()
      .then((res: any) => {
        const list = Array.isArray(res) ? res
          : Array.isArray(res?.results) ? res.results
          : Array.isArray(res?.data) ? res.data : [];
        setAgencies(list);
      })
      .catch(() => setError('Failed to load pending agencies.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchAgencies(); }, []);

  const toast = (type: 'success' | 'error', text: string) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg(null), 4000);
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Approve this agency?')) return;
    setActionLoading(id + '-approve');
    try {
      await adminService.approveAgency(id);
      setAgencies(a => a.filter(x => x.id !== id));
      toast('success', 'Agency approved.');
    } catch (err: any) {
      toast('error', err?.message || 'Approval failed.');
    } finally { setActionLoading(null); }
  };

  const submitReject = async () => {
    if (!rejectModal.agencyId) return;
    if (rejectReason.trim().length < 5) { alert('Reason must be at least 5 characters.'); return; }
    setActionLoading(rejectModal.agencyId + '-reject');
    try {
      await adminService.rejectAgency(rejectModal.agencyId, rejectReason.trim());
      setAgencies(a => a.filter(x => x.id !== rejectModal.agencyId));
      setRejectModal({ open: false, agencyId: null });
      setRejectReason('');
      toast('success', 'Agency rejected.');
    } catch (err: any) {
      toast('error', err?.message || 'Rejection failed.');
    } finally { setActionLoading(null); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Toast */}
      {globalMsg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-xl ${
          globalMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>{globalMsg.text}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Admin</p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-0.5">Agency Applications</h1>
        </div>
        <Link href={`/${lang}/admin/dashboard`}
          className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition">← Dashboard</Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchAgencies}
            className="mt-3 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">Retry</button>
        </div>
      ) : agencies.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">No pending agency applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agencies.map(agency => (
            <div key={agency.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Logo */}
              <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {agency.logo_url
                  ? <img src={agency.logo_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl">🏢</span>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{agency.name}</h3>
                <p className="text-xs text-neutral-500">
                  Admin: {agency.admin?.email ?? 'N/A'} · Applied: {new Date(agency.created_at).toLocaleDateString('en-ET')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {agency.business_license_url && (
                  <a href={agency.business_license_url} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                    📄 License
                  </a>
                )}
                <button
                  onClick={() => handleApprove(agency.id)}
                  disabled={actionLoading === agency.id + '-approve'}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50">
                  ✓ Approve
                </button>
                <button
                  onClick={() => { setRejectModal({ open: true, agencyId: agency.id }); setRejectReason(''); }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition">
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white">✗ Reject Agency Application</h3>
              <button onClick={() => setRejectModal({ open: false, agencyId: null })} className="text-neutral-400 hover:text-neutral-600 text-xl">×</button>
            </div>
            <p className="text-xs text-neutral-500">Provide a reason that will be sent to the agency admin.</p>
            <textarea
              rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Business license is expired or invalid…"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 resize-none transition"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal({ open: false, agencyId: null })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">Cancel</button>
              <button onClick={submitReject} disabled={!!actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition disabled:opacity-50">
                {actionLoading ? 'Rejecting…' : 'Send Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
