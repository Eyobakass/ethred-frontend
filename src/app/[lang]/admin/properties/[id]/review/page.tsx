// src/app/[lang]/admin/properties/[id]/review/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';
import { adminService } from '@/services/admin.service';
import { tourService } from '@/services/tour.service';
import { Property } from '@/types/property.types';
import { TourConfig } from '@/types/tour.types';
import { PannellumViewer } from '@/components/3d-tour/PannellumViewer';
import { formatCurrency } from '@/utils/currency';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export default function AdminPropertyReviewPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const resolvedParams = use(params);
  const { lang, id } = resolvedParams;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [tourConfig, setTourConfig] = useState<TourConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { confirm, ConfirmProps } = useConfirm();

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propData = await propertyService.getPropertyById(id);
        setProperty(propData);

        // Always attempt to fetch tour config if it exists
        const tc = await tourService.getTourConfig(id, true).catch(() => null);
        if (tc && tc.scenes && Object.keys(tc.scenes).length > 0) {
          setTourConfig(tc);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load property details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!(await confirm({ message: 'Are you sure you want to approve this listing?', confirmLabel: 'Approve' }))) return;
    setIsSubmitting(true);
    try {
      await adminService.updatePropertyStatus(id, 'APPROVED');
      router.push(`/${lang}/admin/dashboard`);
    } catch (err: any) {
      alert(err.message || 'Failed to approve listing');
      setIsSubmitting(false);
    }
  };

  const submitReject = async () => {
    if (rejectReason.trim().length < 5) {
      alert('Please provide a descriptive reason (at least 5 characters).');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.updatePropertyStatus(id, 'REJECTED', rejectReason);
      router.push(`/${lang}/admin/dashboard`);
    } catch (err: any) {
      alert(err.message || 'Failed to reject listing');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-medium">{lang === 'am' ? 'የንብረቱን ዝርዝር በማምጣት ላይ...' : 'Loading property details...'}</div>;
  if (!property) return <div className="p-10 text-center font-medium text-red-500">{errorMsg}</div>;

  const images = property.media?.filter(m => m.media_category === 'IMAGE' && !m.is_tour_scene) || [];

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
            {lang === 'am' ? 'የአስተዳዳሪ ግምገማ ሁኔታ' : 'Admin Review Mode'}
          </div>
          <h1 className="text-2xl font-bold">{property.title_en}</h1>
        </div>
        <Link href={`/${lang}/admin/dashboard`} className="text-sm font-semibold text-blue-500 hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Back to Dashboard
        </Link>
      </div>

      {/* Duplicate / Fraud Alert Banner (SRS REQ-VERI-02) */}
      {(property as any).is_flagged_duplicate && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-lg p-4 mb-6 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
              <span>{lang === 'am' ? 'ማስጠንቀቂያ፡ ተመሳስሎ የተቀዳ ፎቶ ተገኝቷል!' : 'Warning: Potential Duplicate / Stolen Media Detected!'}</span>
            </h3>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
              {(property as any).duplicate_reason || 'Identical photo hashes were detected from another seller or property listing.'}
            </p>
          </div>
        </div>
      )}

      {/* Moderation Quality Checklist Banner */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-6 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
          {lang === 'am' ? 'ራስ-ሰር የጥራት መቆጣጠሪያ' : 'Automated Quality Checklist'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className={`p-2.5 rounded-md border flex items-center gap-2 font-semibold ${
            property.title_en?.length >= 5 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
          }`}>
            <span>{property.title_en?.length >= 5 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            )}</span>
            <span>Title Length: {property.title_en?.length || 0} chars</span>
          </div>

          <div className={`p-2.5 rounded-md border flex items-center gap-2 font-semibold ${
            images.length > 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400'
          }`}>
            <span>{images.length > 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            )}</span>
            <span>Photos: {images.length} uploaded</span>
          </div>

          <div className={`p-2.5 rounded-md border flex items-center gap-2 font-semibold ${
            tourConfig ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500'
          }`}>
            <span>{tourConfig ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            )}</span>
            <span>{lang === 'am' ? '3D ቨርቹዋል ጉብኝት' : '3D Virtual Tour'}: {tourConfig ? 'Configured' : 'None'}</span>
          </div>

          <div className={`p-2.5 rounded-md border flex items-center gap-2 font-semibold ${
            Number(property.price_etb) > 0 && Number(property.area_sqm) > 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
          }`}>
            <span>{Number(property.price_etb) > 0 && Number(property.area_sqm) > 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            )}</span>
            <span>Price & Area Valid</span>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{lang === 'am' ? 'የንብረት ዝርዝሮች' : 'Property Details'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="block text-neutral-500">Category</span>
            <span className="font-semibold">{property.category}</span>
          </div>
          <div>
            <span className="block text-neutral-500">Mode</span>
            <span className="font-semibold">{property.transaction_mode}</span>
          </div>
          <div>
            <span className="block text-neutral-500">Price</span>
            <span className="font-semibold">{formatCurrency(Number(property.price_etb), 'ETB', lang as 'en' | 'am')}</span>
          </div>
          <div>
            <span className="block text-neutral-500">Location</span>
            <span className="font-semibold">{property.sub_city}, {property.city}</span>
          </div>
          <div>
            <span className="block text-neutral-500">Bedrooms</span>
            <span className="font-semibold">{property.bedrooms}</span>
          </div>
          <div>
            <span className="block text-neutral-500">Bathrooms</span>
            <span className="font-semibold">{property.bathrooms}</span>
          </div>
          <div>
            <span className="block text-neutral-500">Area</span>
            <span className="font-semibold">{property.area_sqm} sqm</span>
          </div>
        </div>
        <div className="mt-6">
          <span className="block text-neutral-500 mb-1 text-sm font-semibold">Description</span>
          <p className="text-sm leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 whitespace-pre-wrap">
            {property.description_en}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">Standard Images ({images.length})</h2>
        {images.length === 0 ? (
          <p className="text-sm text-neutral-500">No standard images provided.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="aspect-[4/3] rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <img 
                  src={getImageUrl(img.file_url)} 
                  className="w-full h-full object-cover" 
                  alt="Property" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-24 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{lang === 'am' ? '3D ቨርቹዋል ጉብኝት' : '3D Virtual Tour'}</h2>
        {!tourConfig ? (
          <p className="text-sm text-neutral-500">No 3D tour provided.</p>
        ) : (
          <div className="rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-800 relative" style={{ height: '500px' }}>
             <PannellumViewer
                tourConfig={tourConfig}
                isEditMode={false}
              />
          </div>
        )}
      </div>

      <ConfirmModal {...ConfirmProps} />

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm font-bold flex items-center gap-2">
            Status: <span className="text-amber-500">{property.status}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold transition border border-neutral-200 dark:border-neutral-700 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              Reject / Request Changes
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              {lang === 'am' ? 'ማስታወቂያውን አጽድቅ' : 'Approve Listing'}
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                {lang === 'am' ? 'ማስታወቂያውን ውድቅ አድርግ' : 'Reject Listing'}
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              Please provide a reason. This will be sent directly to the seller via email so they can fix the issues.
            </p>
            <textarea
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-3 text-sm min-h-[120px] mb-4 outline-none focus:border-red-500 transition"
              placeholder="e.g., Photos are blurry, price is unrealistic, etc."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-md text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
              >
                {isSubmitting ? 'Submitting...' : 'Send Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
