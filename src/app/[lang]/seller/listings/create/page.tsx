// src/app/[lang]/seller/listings/create/page.tsx
'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { propertyService } from '@/services/property.service';
import { PropertyCategory, TransactionType } from '@/types/property.types';
import { ETHIOPIAN_LOCATIONS } from '@/utils/location';

const CATEGORIES: { value: PropertyCategory; labelEn: string; labelAm: string }[] = [
  { value: 'APARTMENT', labelEn: 'Apartment', labelAm: 'አፓርታማ' },
  { value: 'HOUSE', labelEn: 'House / Villa', labelAm: 'ቤት / ቪላ' },
  { value: 'LAND', labelEn: 'Land Plot', labelAm: 'ቦታ / ካርታ' },
  { value: 'COMMERCIAL', labelEn: 'Commercial Space', labelAm: 'የንግድ ቦታ' },
  { value: 'OFFICE', labelEn: 'Office', labelAm: 'ቢሮ' },
  { value: 'WAREHOUSE', labelEn: 'Warehouse', labelAm: 'መጋዘን' },
  { value: 'VACATION', labelEn: 'Vacation / Short-Stay', labelAm: 'ጊዜያዊ ቤት' },
];

export default function CreateListingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const router = useRouter();

  const [form, setForm] = useState({
    title_en: '',
    title_am: '',
    description_en: '',
    description_am: '',
    price_etb: '',
    transaction_mode: 'SALE' as TransactionType,
    category: 'APARTMENT' as PropertyCategory,
    region: 'Addis Ababa',
    sub_city: '',
    woreda: '',
    nearest_landmark: '',
    bedrooms: '1',
    bathrooms: '1',
    area_sqm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en.trim()) { setError('English title is required.'); return; }
    if (!form.price_etb || Number(form.price_etb) <= 0) { setError('A valid price is required.'); return; }
    if (!form.area_sqm || Number(form.area_sqm) <= 0) { setError('Area in m² is required.'); return; }

    setLoading(true);
    setError('');
    try {
      const created = await propertyService.createProperty({
        ...form,
        price_etb: Number(form.price_etb),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area_sqm: Number(form.area_sqm),
      });
      // After creation, redirect to tour editor for this new listing
      router.push(`/${lang}/seller/listings/${created.id}/tour-editor`);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRegion = ETHIOPIAN_LOCATIONS[form.region];

  const inputClass =
    'w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500 transition';
  const labelClass = 'block text-xs font-semibold text-neutral-300 mb-1.5';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-800 pb-6">
        <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-1">
          ➕ New Property Listing
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          {lang === 'am' ? 'አዲስ ቤት ይዝግቡ' : 'Create New Listing'}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === 'am'
            ? 'ሁሉንም ዝርዝሮች ያስገቡ። ቤቱ ከፀደቀ በኋላ ለሁሉም ይታያል።'
            : 'Fill in all details. Your listing will go live after admin approval.'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white">📝 Basic Information</h2>
          <div>
            <label className={labelClass}>Title (English) *</label>
            <input type="text" className={inputClass} value={form.title_en}
              onChange={(e) => handleChange('title_en', e.target.value)}
              placeholder="e.g. Modern 3-Bedroom Apartment in Bole" required />
          </div>
          <div>
            <label className={labelClass}>Title (Amharic)</label>
            <input type="text" className={inputClass} value={form.title_am}
              onChange={(e) => handleChange('title_am', e.target.value)}
              placeholder="በቦሌ ዘመናዊ ባለ 3 መኝታ አፓርታማ" />
          </div>
          <div>
            <label className={labelClass}>Description (English) *</label>
            <textarea rows={4} className={inputClass + ' resize-none'} value={form.description_en}
              onChange={(e) => handleChange('description_en', e.target.value)}
              placeholder="Describe the property features, finishes, nearby amenities..." required />
          </div>
          <div>
            <label className={labelClass}>Description (Amharic)</label>
            <textarea rows={3} className={inputClass + ' resize-none'} value={form.description_am}
              onChange={(e) => handleChange('description_am', e.target.value)}
              placeholder="የቤቱን ባህሪያት፣ ልዩ ባህሪያቶች..." />
          </div>
        </section>

        {/* Pricing & Type */}
        <section className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white">💰 Pricing & Listing Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price (ETB) *</label>
              <input type="number" className={inputClass} value={form.price_etb}
                onChange={(e) => handleChange('price_etb', e.target.value)}
                placeholder="e.g. 14500000" min={0} required />
            </div>
            <div>
              <label className={labelClass}>Listing Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['SALE', 'RENT'] as TransactionType[]).map((t) => (
                  <button key={t} type="button"
                    onClick={() => handleChange('transaction_mode', t)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      form.transaction_mode === t
                        ? 'bg-gold-500 text-black border-gold-500'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}>
                    {t === 'SALE' ? '🏷️ For Sale' : '🔑 For Rent'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Property Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.value} type="button"
                  onClick={() => handleChange('category', c.value)}
                  className={`py-2 rounded-xl border text-xs font-semibold transition ${
                    form.category === c.value
                      ? 'bg-gold-500 text-black border-gold-500'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}>
                  {lang === 'am' ? c.labelAm : c.labelEn}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white">📍 Location Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Region / City</label>
              <select className={inputClass} value={form.region}
                onChange={(e) => { handleChange('region', e.target.value); handleChange('sub_city', ''); }}>
                {Object.keys(ETHIOPIAN_LOCATIONS).map((r) => (
                  <option key={r} value={r}>{lang === 'am' ? ETHIOPIAN_LOCATIONS[r].am : ETHIOPIAN_LOCATIONS[r].en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sub-City</label>
              <select className={inputClass} value={form.sub_city}
                onChange={(e) => { handleChange('sub_city', e.target.value); handleChange('woreda', ''); }}>
                <option value="">Select Sub-City</option>
                {selectedRegion?.subCities.map((sc) => (
                  <option key={sc.en} value={sc.en}>{lang === 'am' ? sc.am : sc.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Woreda</label>
              <select className={inputClass} value={form.woreda}
                onChange={(e) => handleChange('woreda', e.target.value)}>
                <option value="">Select Woreda</option>
                {selectedRegion?.subCities
                  .find((sc) => sc.en === form.sub_city)?.woredas.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Nearest Landmark</label>
              <input type="text" className={inputClass} value={form.nearest_landmark}
                onChange={(e) => handleChange('nearest_landmark', e.target.value)}
                placeholder="e.g. Edna Mall, CMC Michael" />
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white">📐 Property Specifications</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Bedrooms</label>
              <select className={inputClass} value={form.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} {n === 0 ? '(Studio)' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Bathrooms</label>
              <select className={inputClass} value={form.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Area (m²) *</label>
              <input type="number" className={inputClass} value={form.area_sqm}
                onChange={(e) => handleChange('area_sqm', e.target.value)}
                placeholder="e.g. 165" min={1} required />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-sm shadow-lg shadow-gold-500/20 transition disabled:opacity-50">
            {loading
              ? 'Creating...'
              : lang === 'am'
              ? 'ቤቱን ምዝግብ'
              : 'Create Listing & Add 3D Tour →'}
          </button>
        </div>
      </form>
    </div>
  );
}
