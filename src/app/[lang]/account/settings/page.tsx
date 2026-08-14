// src/app/[lang]/account/settings/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

export default function AccountSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  const router = useRouter();
  const { user, validateSession, logout: localLogout } = useAuth();
  
  // Profile Info
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'am'>('en');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account Deletion
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name || '');
      setPreferredLanguage(user.profile.preferred_language || 'en');
      if (user.profile.avatar_url) setAvatarPreview(user.profile.avatar_url);
    }
  }, [user]);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);
    try {
      await authService.updateProfile({ full_name: fullName, preferred_language: preferredLanguage });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      validateSession(); // refresh user context
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      try {
        await authService.uploadAvatar(file);
        validateSession();
      } catch (err) {
        alert('Failed to upload avatar.');
      }
    }
  };

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
      setPasswordMsg({ type: 'error', text: err?.message || 'Failed to change password.' });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-8">
          {lang === 'am' ? 'የመለያ ቅንብሮች' : 'Account Settings'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            {/* General Profile Section */}
            <div className="bg-white dark:bg-neutral-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Profile Information
              </h2>
              
              <div className="mb-6 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-400">
                      {(fullName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                    Change Avatar
                  </button>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  <p className="text-xs text-neutral-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'am')}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                  >
                    <option value="en">English</option>
                    <option value="am">Amharic (አማርኛ)</option>
                  </select>
                </div>

                {profileMsg && (
                  <div className={`text-sm font-medium ${profileMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {profileMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-white dark:bg-neutral-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                {lang === 'am' ? 'የይለፍ ቃል ይቀይሩ' : 'Change Password'}
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">New Password</label>
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
                  className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {isChangingPassword ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/20 p-6 sm:p-8 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30">
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
                Permanently delete your account and all associated data. This cannot be undone.
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

          <div className="space-y-8">
            {/* Notification Preferences */}
            <div className="bg-white dark:bg-neutral-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifs} 
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">Email Notifications</p>
                    <p className="text-xs text-neutral-500">Receive alerts via email.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={smsNotifs} 
                    onChange={(e) => setSmsNotifs(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">SMS Notifications</p>
                    <p className="text-xs text-neutral-500">Receive alerts via text message.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
