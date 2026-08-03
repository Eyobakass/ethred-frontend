// src/app/[lang]/seller/promotions/page.tsx
'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { paymentService } from '@/services/payment.service';
import { PaymentProcessor } from '@/types/payment.types';

const TIERS = [
  {
    id: 'FEATURED_BASIC',
    label: 'Featured Basic',
    labelAm: 'መሰረታዊ ፊቻር',
    price: 500,
    duration: '7 days',
    durationAm: '7 ቀናት',
    perks: ['Homepage featured section', '3D tour badge on card', 'Priority in search results'],
    perksAm: ['በዋናው ገጽ ይታያሉ', '3D ቱር ምልክት', 'በፍለጋ ውጤቶች ቅድሚያ'],
    color: 'from-neutral-700 to-neutral-600',
    accentColor: 'text-neutral-300',
    recommended: false,
  },
  {
    id: 'FEATURED_PREMIUM',
    label: 'Featured Premium',
    labelAm: 'ፕሪሚየም ፊቻር',
    price: 1200,
    duration: '30 days',
    durationAm: '30 ቀናት',
    perks: [
      'Homepage hero carousel slot',
      '3D virtual tour priority display',
      'Gold badge + Featured label',
      'WhatsApp inquiry integration',
    ],
    perksAm: [
      'በዋናው ስላይደር ይታያሉ',
      '3D ቱር ቅድሚያ',
      'ወርቃማ ምልክት',
      'WhatsApp ጥያቄ',
    ],
    color: 'from-gold-700 to-gold-500',
    accentColor: 'text-gold-400',
    recommended: true,
  },
  {
    id: 'FEATURED_ELITE',
    label: 'Elite Spotlight',
    labelAm: 'ኤሊት ስፖትላይት',
    price: 2500,
    duration: '60 days',
    durationAm: '60 ቀናት',
    perks: [
      'All Premium features',
      'Dedicated email blast to buyers',
      'Social media mention',
      'Dedicated account manager',
    ],
    perksAm: [
      'ሁሉም ፕሪሚየም ባህሪያት',
      'ለገዢዎች ኢሜይል',
      'ሶሻል ሚዲያ ማቴ',
      'ተወካይ',
    ],
    color: 'from-violet-700 to-violet-500',
    accentColor: 'text-violet-400',
    recommended: false,
  },
] as const;

const PAYMENT_METHODS: { id: PaymentProcessor; label: string; icon: string }[] = [
  { id: 'CHAPA', label: 'Chapa', icon: '💳' },
  { id: 'TELEBIRR', label: 'Telebirr', icon: '📱' },
  { id: 'CBE_BIRR', label: 'CBE Birr', icon: '🏦' },
];

export default function SellerPromotionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const router = useRouter();

  const [selectedTier, setSelectedTier] = useState<string>('FEATURED_PREMIUM');
  const [selectedProcessor, setSelectedProcessor] = useState<PaymentProcessor>('CHAPA');
  const [propertyId, setPropertyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tier = TIERS.find((t) => t.id === selectedTier)!;

  const handleCheckout = async () => {
    if (!propertyId.trim()) {
      setError(lang === 'am' ? 'ቤቱን ያስገቡ' : 'Please enter a Property ID to promote.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.createCheckout({
        property_id: propertyId.trim(),
        promotion_tier: selectedTier,
        processor: selectedProcessor,
        amount: tier.price,
      });
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        router.push(`/${lang}/seller/dashboard?promotion=success&tx=${res.tx_ref}`);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-neutral-800 pb-6">
        <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-1">
          ⭐ Boost Your Listing
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {lang === 'am' ? 'ቤትዎን ያስተዋውቁ' : 'Promote Your Property'}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === 'am'
            ? 'ተጨማሪ ገዢዎችን ለመሳብ ቤትዎን ያስተዋውቁ'
            : 'Reach more verified buyers with featured placement on the platform.'}
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTier(t.id)}
            className={`relative p-6 rounded-2xl border text-left transition-all ${
              selectedTier === t.id
                ? 'border-gold-500 ring-2 ring-gold-500/30 bg-neutral-900'
                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
            }`}
          >
            {t.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-500 text-black text-[10px] font-extrabold whitespace-nowrap">
                ⭐ MOST POPULAR
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.color} mb-4 flex items-center justify-center`}>
              <span className="text-white font-extrabold text-sm">
                {t.id === 'FEATURED_BASIC' ? 'B' : t.id === 'FEATURED_PREMIUM' ? 'P' : 'E'}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mb-0.5">
              {lang === 'am' ? t.labelAm : t.label}
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              {lang === 'am' ? t.durationAm : t.duration}
            </p>
            <div className={`text-2xl font-extrabold mb-4 ${t.accentColor}`}>
              {t.price} ETB
            </div>
            <ul className="space-y-1.5">
              {(lang === 'am' ? t.perksAm : t.perks).map((perk, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            {selectedTier === t.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Checkout form */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-5">
        <h2 className="text-base font-bold text-white">
          {lang === 'am' ? 'ክፍያ ዝርዝሮች' : 'Checkout Details'}
        </h2>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            {lang === 'am' ? 'የቤቱ ID' : 'Property ID to Promote'}
          </label>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="e.g. prop_abc123"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500 transition"
          />
          <p className="text-[10px] text-neutral-500 mt-1">
            Find the ID in your Seller Dashboard listing row.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            {lang === 'am' ? 'የክፍያ ዘዴ' : 'Payment Method'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setSelectedProcessor(pm.id)}
                className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  selectedProcessor === pm.id
                    ? 'bg-gold-500/10 border-gold-500 text-gold-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                <span className="text-lg">{pm.icon}</span>
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">Total amount</p>
            <p className="text-2xl font-extrabold text-gold-400">{tier.price} ETB</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-sm shadow-lg shadow-gold-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : lang === 'am' ? 'ክፍያ ፈጽም' : 'Pay & Boost Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
