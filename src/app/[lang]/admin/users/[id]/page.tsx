// src/app/[lang]/admin/users/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmModal } from '@/components/common/ConfirmModal';

const ROLE_COLORS: Record<string, string> = {
  BUYER: 'bg-neutral-100 text-neutral-600',
  SELLER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-red-100 text-red-700',
  AGENCY_ADMIN: 'bg-purple-100 text-purple-700',
  AGENCY_AGENT: 'bg-indigo-100 text-indigo-700',
};

const ALL_ROLES = ['BUYER', 'SELLER', 'ADMIN', 'AGENCY_ADMIN', 'AGENCY_AGENT'];

export default function AdminUserDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: rawLang, id } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [globalMsg, setGlobalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [banModal, setBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [roleModal, setRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');

  const { confirm, ConfirmProps } = useConfirm();

  useEffect(() => {
    adminService.getUser(id)
      .then((data: any) => {
        setUser(data?.user ?? data);
        setNewRole((data?.user ?? data)?.role ?? '');
      })
      .catch(() => setGlobalMsg({ type: 'error', text: 'Failed to load user.' }))
      .finally(() => setIsLoading(false));
  }, [id]);

  const toast = (type: 'success' | 'error', text: string) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg(null), 4000);
  };

  const handleVerify = async () => {
    setActionLoading('verify');
    try {
      await adminService.verifyUserIdentity(id);
      setUser((u: any) => ({ ...u, is_identity_verified: true }));
      toast('success', 'Identity verified successfully.');
    } catch (err: any) {
      toast('error', err?.message || 'Verification failed.');
    } finally { setActionLoading(null); }
  };

  const handleBan = async () => {
    if (banReason.trim().length < 5) { alert('Reason must be at least 5 characters.'); return; }
    setActionLoading('ban');
    try {
      await adminService.banUser(id, banReason.trim());
      setUser((u: any) => ({ ...u, is_banned: true }));
      setBanModal(false);
      setBanReason('');
      toast('success', 'User has been banned.');
    } catch (err: any) {
      toast('error', err?.message || 'Ban failed.');
    } finally { setActionLoading(null); }
  };

  const handleUnban = async () => {
    if (!(await confirm({ message: 'Unban this user?', confirmLabel: 'Unban' }))) return;
    setActionLoading('unban');
    try {
      await adminService.unbanUser(id);
      setUser((u: any) => ({ ...u, is_banned: false }));
      toast('success', 'User has been unbanned.');
    } catch (err: any) {
      toast('error', err?.message || 'Unban failed.');
    } finally { setActionLoading(null); }
  };

  const handleChangeRole = async () => {
    if (!newRole || newRole === user?.role) { setRoleModal(false); return; }
    setActionLoading('role');
    try {
      await adminService.changeUserRole(id, newRole);
      setUser((u: any) => ({ ...u, role: newRole }));
      setRoleModal(false);
      toast('success', `Role changed to ${newRole}.`);
    } catch (err: any) {
      toast('error', err?.message || 'Role change failed.');
    } finally { setActionLoading(null); }
  };

  if (isLoading) return (
    <div className="py-32 flex justify-center">
      <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="p-10 text-center font-medium text-red-600">{lang === 'am' ? 'ተጠቃሚው አልተገኘም።' : 'User not found.'}</div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Toast */}
      {globalMsg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-xl ${
          globalMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {globalMsg.text}
        </div>
      )}

      {/* Back */}
      <Link href={`/${lang}/admin/users`} className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition flex items-center gap-1 w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Users
      </Link>

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.profile?.avatar_url
              ? <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                  {(user.profile?.full_name || user.email || '?')[0].toUpperCase()}
                </span>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {user.profile?.full_name || '(No name)'}
              </h1>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${ROLE_COLORS[user.role] ?? ROLE_COLORS.BUYER}`}>
                {user.role}
              </span>
              {user.is_banned && (
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">BANNED</span>
              )}
              {user.is_identity_verified && (
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-1">{user.email}</p>
            {user.profile?.phone && <p className="text-sm text-neutral-500">{user.profile.phone}</p>}
            <p className="text-xs text-neutral-400 mt-1">Joined: {new Date(user.created_at).toLocaleDateString('en-ET')}</p>
            {user._count?.properties !== undefined && (
              <p className="text-xs text-neutral-400">Properties: {user._count.properties}</p>
            )}
          </div>
        </div>
      </div>

      {/* Identity Document Inspection (SRS REQ-USER-02, REQ-VERI-01) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            {lang === 'am' ? 'የማንነት ማረጋገጫ ሰነድ' : 'Identity Verification Document'}
          </h2>
          {user.is_identity_verified ? (
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              Verified
            </span>
          ) : user.profile?.id_document_url ? (
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              Pending Review
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
              Not Uploaded
            </span>
          )}
        </div>

        {user.profile?.id_document_url ? (
          <div className="p-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                DOC
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  National ID / Passport Document
                </p>
                <p className="text-[11px] text-neutral-500 truncate">{user.profile.id_document_url}</p>
              </div>
            </div>
            <a
              href={user.profile.id_document_url.startsWith('http') ? user.profile.id_document_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.profile.id_document_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition text-center flex-shrink-0"
            >
              {lang === 'am' ? 'ሰነዱን ተመልከት' : 'View Document'}
            </a>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 italic">
            {lang === 'am' ? 'ተጠቃሚው የማንነት ማረጋገጫ ሰነድ ገና አላስገባም።' : 'User has not submitted a national ID or passport document yet.'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">{lang === 'am' ? 'የአስተዳዳሪ እርምጃዎች' : 'Admin Actions'}</h2>

        <div className="flex flex-wrap gap-3">
          {/* Verify Identity */}
          <button
            onClick={handleVerify}
            disabled={user.is_identity_verified || actionLoading === 'verify'}
            className="px-4 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-40 shadow-sm flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            {actionLoading === 'verify' ? 'Verifying…' : 'Verify Identity'}
          </button>

          {/* Change Role */}
          <button
            onClick={() => setRoleModal(true)}
            className="px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            {lang === 'am' ? 'የኃላፊነት ድርሻ ቀይር' : 'Change Role'}
          </button>

          {/* Ban / Unban */}
          {user.is_banned ? (
            <button
              onClick={handleUnban}
              disabled={actionLoading === 'unban'}
              className="px-4 py-2.5 rounded-md bg-neutral-600 hover:bg-neutral-700 text-white text-xs font-semibold transition disabled:opacity-40 shadow-sm flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5"/></svg>
              {actionLoading === 'unban' ? 'Processing…' : 'Unban User'}
            </button>
          ) : (
            <button
              onClick={() => setBanModal(true)}
              className="px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
              {lang === 'am' ? 'ተጠቃሚን አግድ' : 'Ban User'}
            </button>
          )}
        </div>
      </div>

      <ConfirmModal {...ConfirmProps} />

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                {lang === 'am' ? 'ተጠቃሚን አግድ' : 'Ban User'}
              </h3>
              <button onClick={() => setBanModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-xs text-neutral-500">This will prevent the user from logging in. Provide a clear reason.</p>
            <textarea
              rows={3} value={banReason} onChange={e => setBanReason(e.target.value)}
              placeholder={lang === 'am' ? 'የማገጃ ምክንያት (ቢያንስ 5 ፊደላት)...' : 'Reason for ban (min. 5 characters)…'}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 resize-none transition"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBanModal(false)}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">Cancel</button>
              <button onClick={handleBan} disabled={actionLoading === 'ban'}
                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {actionLoading === 'ban' ? 'Banning…' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                {lang === 'am' ? 'የኃላፊነት ድርሻ ቀይር' : 'Change Role'}
              </h3>
              <button onClick={() => setRoleModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-xs text-neutral-500">{lang === 'am' ? 'የአሁኑ የኃላፊነት ድርሻ፦' : 'Current role:'} <strong>{user.role}</strong></p>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition">
              {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRoleModal(false)}
                className="px-4 py-2 rounded-md text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">Cancel</button>
              <button onClick={handleChangeRole} disabled={actionLoading === 'role' || newRole === user.role}
                className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {actionLoading === 'role' ? 'Saving…' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
