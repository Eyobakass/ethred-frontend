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

export default function AdminPropertyReviewPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const resolvedParams = use(params);
  const { lang, id } = resolvedParams;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [tourConfig, setTourConfig] = useState<TourConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        const tc = await tourService.getTourConfig(id).catch(() => null);
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
    if (!window.confirm('Are you sure you want to approve this listing?')) return;
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

  if (isLoading) return <div className="p-10 text-center">Loading property details...</div>;
  if (!property) return <div className="p-10 text-center text-red-500">{errorMsg}</div>;

  const images = property.media?.filter(m => !m.is_tour_scene) || [];

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
          <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
            Admin Review Mode
          </div>
          <h1 className="text-2xl font-bold">{property.title_en}</h1>
        </div>
        <Link href={`/${lang}/admin/dashboard`} className="text-sm text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
      {/* Moderation Quality Checklist Banner */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
          <span>📋</span> Automated Quality Checklist
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium ${
            property.title_en?.length >= 5 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
          }`}>
            <span>{property.title_en?.length >= 5 ? '✅' : '❌'}</span>
            <span>Title Length: {property.title_en?.length || 0} chars</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium ${
            images.length > 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400'
          }`}>
            <span>{images.length > 0 ? '✅' : '⚠️'}</span>
            <span>Photos: {images.length} uploaded</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium ${
            tourConfig ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500'
          }`}>
            <span>{tourConfig ? '✅' : 'ℹ️'}</span>
            <span>3D Virtual Tour: {tourConfig ? 'Configured' : 'None'}</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium ${
            Number(property.price_etb) > 0 && Number(property.area_sqm) > 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
          }`}>
            <span>{Number(property.price_etb) > 0 && Number(property.area_sqm) > 0 ? '✅' : '❌'}</span>
            <span>Price & Area Valid</span>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Property Details</h2>
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
            <span className="font-semibold">{formatCurrency(Number(property.price_etb), 'ETB', lang)}</span>
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
          <span className="block text-neutral-500 mb-1 text-sm">Description</span>
          <p className="text-sm leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 whitespace-pre-wrap">
            {property.description_en}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Standard Images ({images.length})</h2>
        {images.length === 0 ? (
          <p className="text-sm text-neutral-500">No standard images provided.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200">
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

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-24 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">3D Virtual Tour</h2>
        {!tourConfig ? (
          <p className="text-sm text-neutral-500">No 3D tour provided.</p>
        ) : (
          <div className="rounded-xl overflow-hidden shadow-xl relative" style={{ height: '500px' }}>
             <PannellumViewer
                tourConfig={tourConfig}
                isEditMode={false}
              />
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm font-bold">
            Status: <span className="text-amber-500">{property.status}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 font-bold transition border border-red-800"
            >
              Reject / Request Changes
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-600/20"
            >
              Approve Listing
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Reject Listing</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Please provide a reason. This will be sent directly to the seller via email so they can fix the issues.
            </p>
            <textarea
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-sm min-h-[120px] mb-4 outline-none focus:border-red-500 transition"
              placeholder="e.g., Photos are blurry, price is unrealistic, etc."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition"
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
