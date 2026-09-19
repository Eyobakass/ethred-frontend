// src/app/[lang]/admin/agencies/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmModal } from '@/components/common/ConfirmModal';

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

  const { confirm, ConfirmProps } = useConfirm();

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
    if (!(await confirm({ message: 'Approve this agency?', confirmLabel: 'Approve' }))) return;
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
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-md font-semibold text-sm shadow-xl ${
          globalMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>{globalMsg.text}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Admin</p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{lang === 'am' ? 'የኤጀንሲ ማመልከቻዎች' : 'Agency Applications'}</h1>
        </div>
        <Link href={`/${lang}/admin/dashboard`}
          className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition flex items-center gap-1 w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Dashboard
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button onClick={fetchAgencies}
            className="mt-3 px-4 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">Retry</button>
        </div>
      ) : agencies.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 dark:text-neutral-700 mb-3"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{lang === 'am' ? 'የሚጠብቅ የኤጀንሲ ማመልከቻ የለም።' : 'No pending agency applications.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agencies.map(agency => (
            <div key={agency.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Logo */}
              <div className="w-14 h-14 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {agency.logo_url
                  ? <img src={agency.logo_url} alt="" className="w-full h-full object-cover" />
                  : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    License
                  </a>
                )}
                <button
                  onClick={() => handleApprove(agency.id)}
                  disabled={actionLoading === agency.id + '-approve'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  Approve
                </button>
                <button
                  onClick={() => { setRejectModal({ open: true, agencyId: agency.id }); setRejectReason(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal {...ConfirmProps} />

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                Reject Agency
              </h3>
              <button onClick={() => setRejectModal({ open: false, agencyId: null })} className="text-neutral-400 hover:text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-xs text-neutral-500">Provide a clear reason for rejection (this will be emailed to the applicant).</p>
            <textarea
              rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (min. 5 characters)…"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-red-500 resize-none transition"
            />
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setRejectModal({ open: false, agencyId: null })}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                Cancel
              </button>
              <button onClick={submitReject} disabled={actionLoading === rejectModal.agencyId + '-reject'}
                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {actionLoading === rejectModal.agencyId + '-reject' ? 'Submitting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
