// src/app/[lang]/admin/users/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';

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
    if (!window.confirm('Unban this user?')) return;
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
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="p-10 text-center text-red-600">User not found.</div>
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
      <Link href={`/${lang}/admin/users`} className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition">← Back to Users</Link>

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
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
              <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                {user.profile?.full_name || '(No name)'}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[user.role] ?? ROLE_COLORS.BUYER}`}>
                {user.role}
              </span>
              {user.is_banned && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">🚫 BANNED</span>
              )}
              {user.is_identity_verified && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✅ Verified</span>
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

      {/* Actions */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Admin Actions</h2>

        <div className="flex flex-wrap gap-3">
          {/* Verify Identity */}
          <button
            onClick={handleVerify}
            disabled={user.is_identity_verified || actionLoading === 'verify'}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-40 shadow-sm">
            ✅ {actionLoading === 'verify' ? 'Verifying…' : 'Verify Identity'}
          </button>

          {/* Change Role */}
          <button
            onClick={() => setRoleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm">
            🔄 Change Role
          </button>

          {/* Ban / Unban */}
          {user.is_banned ? (
            <button
              onClick={handleUnban}
              disabled={actionLoading === 'unban'}
              className="px-4 py-2.5 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-bold transition disabled:opacity-40 shadow-sm">
              {actionLoading === 'unban' ? 'Processing…' : '🔓 Unban User'}
            </button>
          ) : (
            <button
              onClick={() => setBanModal(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm">
              🚫 Ban User
            </button>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white">🚫 Ban User</h3>
              <button onClick={() => setBanModal(false)} className="text-neutral-400 hover:text-neutral-600 text-xl">×</button>
            </div>
            <p className="text-xs text-neutral-500">This will prevent the user from logging in. Provide a clear reason.</p>
            <textarea
              rows={3} value={banReason} onChange={e => setBanReason(e.target.value)}
              placeholder="Reason for ban (min. 5 characters)…"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 resize-none transition"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBanModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">Cancel</button>
              <button onClick={handleBan} disabled={actionLoading === 'ban'}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition disabled:opacity-50">
                {actionLoading === 'ban' ? 'Banning…' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white">🔄 Change Role</h3>
              <button onClick={() => setRoleModal(false)} className="text-neutral-400 hover:text-neutral-600 text-xl">×</button>
            </div>
            <p className="text-xs text-neutral-500">Current role: <strong>{user.role}</strong></p>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition">
              {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRoleModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">Cancel</button>
              <button onClick={handleChangeRole} disabled={actionLoading === 'role' || newRole === user.role}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition disabled:opacity-50">
                {actionLoading === 'role' ? 'Saving…' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
