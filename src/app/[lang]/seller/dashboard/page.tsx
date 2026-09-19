// src/app/[lang]/seller/dashboard/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { formatCurrency } from '@/utils/currency';
import { useAuthStore } from '@/store/useAuthStore';

export default function SellerDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang === 'am' ? 'am' : 'en';
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useEffect(() => {
    propertyService
      .getMyListings()
      .then((res) => {
        setProperties(res || []);
      })
      .catch(() => {
        setProperties([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (id: string) => {
    // 1. Validation Guard: Find property and check readiness
    const prop = properties.find((p) => p.id === id);
    if (prop) {
      if (!prop.title_en || prop.title_en.trim().length < 5) {
        setValidationError('Please provide a descriptive English title (at least 5 characters).');
        return;
      }
      if (!prop.price_etb || Number(prop.price_etb) <= 0) {
        setValidationError('Please enter a valid listing price.');
        return;
      }
      if (!prop.area_sqm || Number(prop.area_sqm) <= 0) {
        setValidationError('Please enter a valid property area (sqm).');
        return;
      }
      if (prop.rejection_info && new Date(prop.updated_at) <= new Date(prop.rejection_info.rejected_at)) {
        setValidationError('You must edit your property details, photos, or 3D tour based on the admin feedback before resubmitting for review.');
        return;
      }
    }

    setIsSubmitting(id);
    try {
      await propertyService.submitForReview(id);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'PENDING' } : p))
      );
    } catch (error: any) {
      console.error('Failed to submit for review', error);
      alert(error.message || 'Failed to submit property for review. Please try again.');
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) return;
    try {
      // deleteDraft calls DELETE /properties/:id, which now hard deletes ARCHIVED items
      await propertyService.deleteDraft(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      console.error('Failed to delete property', error);
      alert(error.message || 'Failed to delete property.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'የሻጭ ዳሽቦርድ' : 'Seller Dashboard'}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            {lang === 'am' ? 'የእርስዎን ቤቶች፣ 3D ቨርቹዋል ጉብኝቶች እና የገዢ ጥያቄዎችን ያስተዳድሩ።' : 'Manage your property listings, 3D virtual tours, and buyer inquiries.'}
          </p>
        </div>
        <Link
          href={`/${lang}/seller/listings/create`}
          className="px-5 py-2.5 rounded-md bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white font-semibold text-xs transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>{lang === 'am' ? 'አዲስ ቤት መዝግብ' : 'Add New Listing'}</span>
        </Link>
      </div>

      {user && !user.is_identity_verified && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                {lang === 'am' ? 'የማንነት ማረጋገጫ ያስፈልጋል (Liyu ID / ፓስፖርት)' : 'Identity Verification Recommended'}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {lang === 'am'
                  ? 'የተረጋገጠ ሻጭ ባጅ ለማግኘት እና የገዢዎችን እምነት ለመጨመር መታወቂያዎን ወይም ፓስፖርትዎን ያስገቡ።'
                  : 'Upload your National ID (Liyu ID) or Passport to get a verified seller badge and unlock priority listing visibility.'}
              </p>
            </div>
          </div>
          <Link
            href={`/${lang}/account/verification`}
            className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap transition text-center flex-shrink-0"
          >
            {lang === 'am' ? 'አሁን አረጋግጥ' : 'Verify Identity Now'}
          </Link>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 font-bold text-sm text-neutral-900 dark:text-white">
          My Listed Properties ({properties.length})
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mb-4 text-neutral-400 dark:text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                {lang === 'am' ? 'ምንም ቤቶች የሉም' : 'No Properties Yet'}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
                {lang === 'am' 
                  ? 'እስካሁን ምንም አይነት ቤት አልመዘገቡም። አዲስ ቤት በመመዝገብ ይጀምሩ!'
                  : "You haven't listed any properties yet. Get started by adding your first listing!"}
              </p>
              <Link
                href={`/${lang}/seller/listings/create`}
                className="px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
              >
                {lang === 'am' ? 'አዲስ ቤት መዝግብ' : 'Add New Listing'}
              </Link>
            </div>
          ) : (
            properties.map((prop) => (
              <div key={prop.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {lang === 'am' && prop.title_am ? prop.title_am : prop.title_en}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                    <span className="flex items-center gap-1 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                      {prop.category?.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {prop.sub_city}, {prop.city}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-neutral-900 dark:text-neutral-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                      {formatCurrency(Number(prop.price_etb), 'ETB', lang)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                      {prop.bedrooms} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>
                      {prop.bathrooms} Bath
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>
                      {prop.area_sqm} m²
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      prop.status === 'DRAFT' && prop.rejection_info ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800' :
                      prop.status === 'DRAFT' ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300' :
                      prop.status === 'PENDING' || prop.status === 'PENDING_UPDATE' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {prop.status === 'DRAFT' && prop.rejection_info ? 'NEEDS REVISION' : 
                       prop.status === 'PENDING_UPDATE' ? 'PENDING UPDATE' : prop.status}
                    </span>
                  </div>

                  {/* Cool Rejection Feedback Alert Box */}
                  {prop.status === 'DRAFT' && prop.rejection_info && (
                    <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-red-700 dark:text-red-400">
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                          Rejection Feedback (Action Required)
                        </span>
                        <span className="text-[10px] text-neutral-500 font-normal">
                          {new Date(prop.rejection_info.rejected_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 p-2.5 rounded border border-red-100 dark:border-red-900/30 font-medium">
                        &quot;{prop.rejection_info.reason}&quot;
                      </p>
                      <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-1">
                        <span>Reviewed by: <strong className="text-neutral-700 dark:text-neutral-300">{prop.rejection_info.rejected_by}</strong></span>
                        <span className="text-red-600 dark:text-red-400 font-semibold">{lang === 'am' ? 'እባክዎ የተጠየቁትን ማስተካከያዎች አድርገው በድጋሚ ያስገቡ።' : 'Please fix the requested changes and re-submit.'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                  {prop.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmit(prop.id)}
                      disabled={isSubmitting === prop.id}
                      className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800/50 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSubmitting === prop.id ? 'Submitting...' : (
                        <><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Submit for Review</>
                      )}
                    </button>
                  )}
                  <Link
                    href={`/${lang}/seller/listings/${(prop as any).pending_draft_id || prop.id}`}
                    className="px-3 py-1.5 rounded-md bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold border border-neutral-900 dark:border-white transition flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    {lang === 'am' ? 'ማስታወቂያውን ያስተካክሉ' : 'Manage Listing'}
                  </Link>
                  <Link
                    href={`/${lang}/seller/promotions?propertyId=${prop.id}`}
                    className="px-3 py-1.5 rounded-md text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Promote
                  </Link>
                  {prop.status === 'ARCHIVED' && (
                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50 transition flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Validation Error Modal */}
      {validationError && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              Listing Validation Guard
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 font-medium">
              {validationError}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setValidationError(null)}
                className="px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
