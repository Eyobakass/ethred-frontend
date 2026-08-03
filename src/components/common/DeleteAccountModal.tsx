'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export const DeleteAccountModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const router = useRouter();
  const { logout: localLogout } = useAuth();
  
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    setMsg(null);
    try {
      await authService.deleteAccount();
      localLogout();
      router.push(`/${lang}`);
      onClose();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to delete account.' });
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
          Delete Account
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-red-300 dark:border-red-800/50 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 dark:text-white"
            />
          </div>

          {msg && (
            <div className={`text-sm font-medium ${msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || isDeleting}
              className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
