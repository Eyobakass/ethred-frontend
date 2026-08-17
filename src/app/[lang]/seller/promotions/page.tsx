// src/app/[lang]/seller/promotions/page.tsx
'use client';

import React, { useState, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentService } from '@/services/payment.service';

const TIERS = [
  { id: 'HOMEPAGE_FEATURED', name: 'Homepage Featured', price: 2500, duration: '30 days', description: 'Top banner placement + Featured section on homepage' },
  { id: 'SEARCH_BOOST', name: 'Search Boost', price: 1500, duration: '30 days', description: 'Top of search results + increased visibility' },
  { id: 'PREMIUM_BADGE', name: 'Premium Badge', price: 800, duration: '30 days', description: 'Premium badge displayed on listing card' },
];

function PromotionsContent({ lang }: { lang: 'en' | 'am' }) {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = async () => {
    if (!propertyId || !selectedTier) return;
    const tierObj = TIERS.find(t => t.id === selectedTier);
    if (!tierObj) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await paymentService.initiatePayment({
        property_id: propertyId,
        promotion_tier: selectedTier,
      });
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        throw new Error('No checkout URL received from the server.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  if (!propertyId) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Property Selected</h1>
        <p className="text-neutral-500 mb-6">You must select a property to promote.</p>
        <Link href={`/${lang}/seller/dashboard`} className="text-red-600 font-bold hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-2">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Boost Your Listing</p>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Promote Property</h1>
        <p className="text-neutral-500 text-sm">Select a promotion tier to increase visibility and attract more buyers.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-100 dark:border-red-900/50 text-center">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-200 border-2 ${
              selectedTier === tier.id
                ? 'border-red-600 bg-red-50/50 dark:bg-red-900/10 shadow-lg shadow-red-600/10 scale-105'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-red-300 dark:hover:border-red-900'
            }`}
          >
            {selectedTier === tier.id && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Selected
              </div>
            )}
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{tier.name}</h2>
            <div className="my-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">{tier.price}</span>
              <span className="text-sm font-semibold text-neutral-500">ETB</span>
            </div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-4">Duration: {tier.duration}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{tier.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={handleProceed}
          disabled={!selectedTier || isLoading}
          className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg disabled:opacity-50 transition shadow-xl shadow-red-600/20"
        >
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
      
      <div className="text-center pt-4">
        <Link href={`/${lang}/seller/dashboard`} className="text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition">
          Cancel and return to dashboard
        </Link>
      </div>
    </>
  );
}

export default function PromotionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <Suspense fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      }>
        <PromotionsContent lang={lang} />
      </Suspense>
    </div>
  );
}
