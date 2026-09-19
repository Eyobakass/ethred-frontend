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
        <p className="text-neutral-500 mb-4">{lang === 'am' ? 'ማንነትዎን ለማረጋገጥ እባክዎ ይግቡ።' : 'Please log in to verify your identity.'}</p>
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
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">{lang === 'am' ? 'ደህንነት እና እምነት' : 'Trust & Safety'}</p>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{lang === 'am' ? 'የማንነት ማረጋገጫ' : 'Identity Verification'}</h1>
        <p className="text-neutral-500 text-sm">{lang === 'am' ? 'እምነትን ለመጨመር እና ሁሉንም የኢትሬድ አገልግሎቶች ለማግኘት ማንነትዎን ያረጋግጡ።' : 'Verify your identity to increase trust and unlock all features on Ethred.'}</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 md:p-8 shadow-sm">
        {/* Progress Display */}
        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${user.is_phone_verified ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
              {user.is_phone_verified ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : '1'}
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Phone/Email Verification</p>
              <p className="text-xs text-neutral-500">Contact details verified.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${user.is_identity_verified ? 'bg-emerald-500' : (submitted ? 'bg-amber-500' : 'bg-red-600')}`}>
              {user.is_identity_verified ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : (submitted ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> : '2')}
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
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-md p-6 text-center space-y-2 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            <h3 className="font-bold text-emerald-800 dark:text-emerald-400">{lang === 'am' ? 'ማንነትዎ ሙሉ በሙሉ ተረጋግጧል!' : 'You are fully verified!'}</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">Thank you for helping keep Ethred safe.</p>
          </div>
        ) : submitted ? (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md p-6 text-center space-y-2 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3 className="font-bold text-amber-800 dark:text-amber-400">{lang === 'am' ? 'ማረጋገጫ በሂደት ላይ ነው' : 'Verification in Progress'}</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500">We are reviewing your document. This usually takes 1-2 business days.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-100 dark:border-red-900/50 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> {error}
              </div>
            )}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                idFile ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-neutral-300 dark:border-neutral-700 hover:border-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-neutral-400 dark:text-neutral-500 mb-3">
                {idFile ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                )}
              </div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
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
                className="px-8 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold text-sm disabled:opacity-50 transition shadow-sm">
                {isUploading ? 'Uploading...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
