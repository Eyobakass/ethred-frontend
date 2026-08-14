// src/app/[lang]/account/verification/page.tsx
'use client';

import React, { useState, useRef, use } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';

export default function VerificationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  
  const { user, isAuthenticated } = useAuthStore();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-500 mb-4">Please log in to verify your identity.</p>
        <Link href={`/${lang}/auth/login`} className="text-red-600 font-bold hover:underline">Sign In</Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!idFile) return;
    setIsUploading(true);
    setError(null);
    try {
      await authService.uploadIdDocument(idFile);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit verification. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Trust & Safety</p>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Identity Verification</h1>
        <p className="text-neutral-500 text-sm">Verify your identity to increase trust and unlock all features on Ethred.</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Progress Display */}
        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${user.is_phone_verified ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
              {user.is_phone_verified ? '✓' : '1'}
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Phone/Email Verification</p>
              <p className="text-xs text-neutral-500">Contact details verified.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${user.is_identity_verified ? 'bg-emerald-500' : (submitted ? 'bg-amber-500' : 'bg-red-600')}`}>
              {user.is_identity_verified ? '✓' : (submitted ? '⏳' : '2')}
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Government ID</p>
              <p className="text-xs text-neutral-500">
                {user.is_identity_verified ? 'Identity verified successfully.' : (submitted ? 'Pending admin review.' : 'Upload a valid ID document.')}
              </p>
            </div>
          </div>
        </div>

        {user.is_identity_verified ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-6 text-center space-y-2">
            <div className="text-4xl">✅</div>
            <h3 className="font-bold text-emerald-800 dark:text-emerald-400">You are fully verified!</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">Thank you for helping keep Ethred safe.</p>
          </div>
        ) : submitted ? (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 text-center space-y-2">
            <div className="text-4xl">⏳</div>
            <h3 className="font-bold text-amber-800 dark:text-amber-400">Verification in Progress</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500">We are reviewing your document. This usually takes 1-2 business days.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-100 dark:border-red-900/50">
                ⚠ {error}
              </div>
            )}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                idFile ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-neutral-300 dark:border-neutral-700 hover:border-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-4xl mb-3">{idFile ? '🪪' : '📤'}</div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                {idFile ? idFile.name : 'Click to upload passport or national ID'}
              </p>
              {idFile && (
                <p className="text-xs text-neutral-500 mt-1">{(idFile.size / 1024 / 1024).toFixed(2)} MB</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={!idFile || isUploading}
                className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm disabled:opacity-50 transition shadow-lg shadow-red-600/20">
                {isUploading ? 'Uploading...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
