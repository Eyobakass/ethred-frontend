'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

export default function AccountSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = React.use(params);
  const router = useRouter();
  const { user, logout: localLogout } = useAuth();
  
  // Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account Deletion
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMsg(null);
    try {
      await authService.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    if (!window.confirm('Are you absolutely sure you want to permanently delete your account? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    setDeleteMsg(null);
    try {
      await authService.deleteAccount();
      localLogout();
      router.push(`/${lang}`);
    } catch (err: any) {
      setDeleteMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to delete account.' });
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-8">
          {lang === 'am' ? 'የመለያ ቅንብሮች' : 'Account Settings'}
        </h1>

        <div className="space-y-8">
          {/* Change Password Section */}
          <div className="bg-white dark:bg-neutral-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
              {lang === 'am' ? 'የይለፍ ቃል ይቀይሩ' : 'Change Password'}
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>
              
              {passwordMsg && (
                <div className={`text-sm font-medium ${passwordMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {passwordMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {isChangingPassword ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-950/20 p-6 sm:p-8 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
              Permanently delete your account and all associated data (properties, favorites, etc). This cannot be undone.
            </p>
            
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-red-300 dark:border-red-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>

              {deleteMsg && (
                <div className="text-sm font-medium text-red-600">
                  {deleteMsg.text}
                </div>
              )}

              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
