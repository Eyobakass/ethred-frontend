// src/app/[lang]/agencies/apply/page.tsx
'use client';

import React, { useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { agencyService } from '@/services/agency.service';
import { useAuthStore } from '@/store/useAuthStore';

export default function AgencyApplyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agencyName, setAgencyName] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const licenseInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-neutral-600 mb-4">{lang === 'am' ? 'ኤጀንሲ ለመመዝገብ እባክዎ ይግቡ።' : 'Please log in to register an agency.'}</p>
        <Link href={`/${lang}/auth/login?returnUrl=/${lang}/agencies/apply`}
          className="px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition">
          Log In
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!agencyName.trim() || !licenseFile) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('agency_name', agencyName.trim());
      formData.append('business_license', licenseFile);

      await agencyService.createAgency(formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{lang === 'am' ? 'ማመልከቻው ገብቷል!' : 'Application Submitted!'}</h1>
        <p className="text-neutral-500 text-sm">
          Thank you for registering <strong>{agencyName}</strong>. Our administrative team will review your application and business license within 2–3 business days. You will be notified via email once approved.
        </p>
        <div className="pt-4">
          <Link href={`/${lang}/`} className="px-6 py-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">For Businesses</p>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{lang === 'am' ? 'ኤጀንሲዎን ይመዝገቡ' : 'Register Your Agency'}</h1>
        <p className="text-neutral-500 text-sm">Join the platform to manage multiple agents and listings under one company brand.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= s ? 'bg-red-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-red-600' : 'bg-neutral-200 dark:bg-neutral-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 md:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-100 dark:border-red-900/50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> {error}
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{lang === 'am' ? 'የኤጀንሲ ዝርዝሮች' : 'Agency Details'}</h2>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Official Agency Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Addis Premier Real Estate"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={agencyName.trim().length < 3}
                className="px-6 py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm disabled:opacity-50 transition">
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{lang === 'am' ? 'ህጋዊ ማረጋገጫ' : 'Legal Verification'}</h2>
            <p className="text-sm text-neutral-500">Please upload a valid business registration license or broker certification. Must be PDF, JPG, or PNG under 5MB.</p>
            
            <div 
              onClick={() => licenseInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                licenseFile ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-neutral-300 dark:border-neutral-700 hover:border-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}>
              <input
                type="file"
                ref={licenseInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-neutral-400 dark:text-neutral-500 mb-3">
                {licenseFile ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                )}
              </div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {licenseFile ? licenseFile.name : 'Click to upload business license'}
              </p>
              {licenseFile && (
                <p className="text-xs text-neutral-500 mt-1">{(licenseFile.size / 1024 / 1024).toFixed(2)} MB</p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-200 transition">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!licenseFile}
                className="px-6 py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm disabled:opacity-50 transition">
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{lang === 'am' ? 'ገምግም እና ላክ' : 'Review & Submit'}</h2>
            
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-5 space-y-4 border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Agency Name</p>
                <p className="font-semibold text-neutral-900 dark:text-white mt-1">{agencyName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Attached Document</p>
                <p className="font-semibold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {licenseFile?.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Admin Account</p>
                <p className="font-semibold text-neutral-900 dark:text-white mt-1">{user?.email}</p>
                <p className="text-xs text-neutral-500">This account will be set as the initial Agency Admin.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 text-center">
              By submitting, you agree to our Terms of Service for registered agencies.
            </p>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-200 transition">
                ← Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold text-sm disabled:opacity-50 transition shadow-sm">
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
