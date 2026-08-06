// src/app/[lang]/seller/dashboard/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { formatCurrency } from '@/utils/currency';

export default function SellerDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang === 'am' ? 'am' : 'en';
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
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'የሻጭ ዳሽቦርድ' : 'Seller Dashboard'}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your property listings, 3D virtual tours, and buyer inquiries.
          </p>
        </div>
        <Link
          href={`/${lang}/seller/listings/create`}
          className="px-5 py-2.5 rounded-xl bg-red-600 dark:bg-red-600 hover:bg-red-500 dark:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600 dark:shadow-red-600/20 transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>{lang === 'am' ? 'አዲስ ቤት መዝግብ' : 'Add New Listing'}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 font-bold text-sm text-neutral-900 dark:text-white">
          My Listed Properties ({properties.length})
        </div>
        <div className="divide-y divide-neutral-800">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading...</div>
          ) : properties.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-3xl">
                🏠
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
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition"
              >
                {lang === 'am' ? 'አዲስ ቤት መዝግብ' : 'Add New Listing'}
              </Link>
            </div>
          ) : (
            properties.map((prop) => (
              <div key={prop.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {lang === 'am' && prop.title_am ? prop.title_am : prop.title_en}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                    <span className="flex items-center gap-1 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                      <span>🏷️</span> {prop.category?.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1">📍 {prop.sub_city}, {prop.city}</span>
                    <span className="flex items-center gap-1 font-bold text-neutral-900 dark:text-neutral-200">
                      💰 {formatCurrency(Number(prop.price_etb), 'ETB', lang)}
                    </span>
                    <span className="flex items-center gap-1">🛏️ {prop.bedrooms} Bed</span>
                    <span className="flex items-center gap-1">🛁 {prop.bathrooms} Bath</span>
                    <span className="flex items-center gap-1">📐 {prop.area_sqm} m²</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prop.status === 'DRAFT' && prop.rejection_info ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800' :
                      prop.status === 'DRAFT' ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300' :
                      prop.status === 'PENDING' || prop.status === 'PENDING_UPDATE' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {prop.status === 'DRAFT' && prop.rejection_info ? 'NEEDS REVISION' : 
                       prop.status === 'PENDING_UPDATE' ? 'PENDING UPDATE' : prop.status}
                    </span>
                  </div>

                  {/* Cool Rejection Feedback Alert Box */}
                  {prop.status === 'DRAFT' && prop.rejection_info && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs space-y-1.5 animate-in">
                      <div className="flex items-center justify-between font-bold text-red-700 dark:text-red-400">
                        <span className="flex items-center gap-1.5">
                          <span>⚠️</span> Rejection Feedback (Action Required)
                        </span>
                        <span className="text-[10px] text-neutral-500 font-normal">
                          {new Date(prop.rejection_info.rejected_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30 font-medium">
                        &quot;{prop.rejection_info.reason}&quot;
                      </p>
                      <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-1">
                        <span>Reviewed by: <strong className="text-neutral-700 dark:text-neutral-300">{prop.rejection_info.rejected_by}</strong></span>
                        <span className="text-red-600 dark:text-red-400 font-semibold">Please fix the requested changes and re-submit.</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                  {prop.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmit(prop.id)}
                      disabled={isSubmitting === prop.id}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800/50 transition disabled:opacity-50"
                    >
                      {isSubmitting === prop.id ? 'Submitting...' : '✅ Submit for Review'}
                    </button>
                  )}
                  <Link
                    href={`/${lang}/seller/listings/${prop.id}`}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold border border-neutral-900 dark:border-white transition flex items-center gap-1.5"
                  >
                    <span>✏️</span> Manage Listing
                  </Link>
                  <Link
                    href={`/${lang}/seller/promotions`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 text-xs font-semibold border border-amber-500/30 transition"
                  >
                    ⭐ Promote
                  </Link>
                  {prop.status === 'ARCHIVED' && (
                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50 transition"
                    >
                      🗑️ Delete Permanently
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
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500 font-bold text-lg">
              <span>⚠️</span> Listing Validation Guard
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 font-medium">
              {validationError}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setValidationError(null)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
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
