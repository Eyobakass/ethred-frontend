'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const lang = pathname?.split('/').filter(Boolean)[0] === 'am' ? 'am' : 'en';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      await authService.changePassword({ current_password: currentPassword, new_password: newPassword });
      setMsg({ type: 'success', text: lang === 'am' ? 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል።' : 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || (lang === 'am' ? 'የይለፍ ቃል መቀየር አልተሳካም።' : 'Failed to change password.') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-lg border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
          {lang === 'am' ? 'የይለፍ ቃል ቀይር' : 'Change Password'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {lang === 'am' ? 'የአሁኑ የይለፍ ቃል' : 'Current Password'}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {lang === 'am' ? 'አዲስ የይለፍ ቃል' : 'New Password'}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 dark:text-white"
            />
          </div>

          {msg && (
            <div className={`text-sm font-medium ${msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              {lang === 'am' ? 'ሰርዝ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-md font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {isLoading ? (lang === 'am' ? 'በመቀየር ላይ...' : 'Changing...') : (lang === 'am' ? 'ቀይር' : 'Change')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
