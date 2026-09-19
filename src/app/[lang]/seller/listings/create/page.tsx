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
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAiCopy = async () => {
    setIsGeneratingAi(true);
    try {
      const generated = await propertyService.generateAiCopy({
        category: form.category,
        transaction_mode: form.transaction_mode,
        region: form.region,
        sub_city: form.sub_city,
        woreda: form.woreda,
        nearest_landmark: form.nearest_landmark,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        area_sqm: Number(form.area_sqm) || 100,
        price_etb: Number(form.price_etb) || 5000000,
      });

      if (generated) {
        setForm((prev) => ({
          ...prev,
          title_en: generated.title_en || prev.title_en,
          title_am: generated.title_am || prev.title_am,
          description_en: generated.description_en || prev.description_en,
          description_am: generated.description_am || prev.description_am,
        }));
      }
    } catch (err: any) {
      console.error('Failed to generate AI copy:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
        city: form.region, // City is required by backend schema
        price_etb: Number(form.price_etb),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area_sqm: Number(form.area_sqm),
      });
      // After creation, redirect to tour editor for this new listing
      router.push(`/${lang}/seller/listings/${created.id}/tour-editor`);
    } catch (err: any) {
      // Better error unwrapping for Axios/Zod errors
      const backendMessage = err?.response?.data?.message;
      const validationErrors = err?.response?.data?.errors;
      let errorMsg = backendMessage || err?.message || 'Failed to create listing. Please try again.';
      
      if (validationErrors && Array.isArray(validationErrors)) {
        errorMsg += ': ' + validationErrors.map((v: any) => `${v.field || v.path}: ${v.message}`).join(', ');
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectedRegion = ETHIOPIAN_LOCATIONS[form.region];

  const inputClass =
    'w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 dark:border-red-600 transition';
  const labelClass = 'block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> {lang === 'am' ? 'አዲስ የንብረት ማስታወቂያ' : 'New Property Listing'}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {lang === 'am' ? 'አዲስ ቤት ይዝግቡ' : 'Create New Listing'}
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {lang === 'am'
            ? 'ሁሉንም ዝርዝሮች ያስገቡ። ቤቱ ከፀደቀ በኋላ ለሁሉም ይታያል።'
            : 'Fill in all details. Your listing will go live after admin approval.'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-md flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> {lang === 'am' ? 'መሰረታዊ መረጃ' : 'Basic Information'}</h2>
            <button
              type="button"
              onClick={handleGenerateAiCopy}
              disabled={isGeneratingAi}
              className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              <span>{isGeneratingAi ? (lang === 'am' ? 'በማመንጨት ላይ...' : 'Generating...') : (lang === 'am' ? 'በ AI አዘጋጅ' : 'Generate with AI')}</span>
            </button>
          </div>
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
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg> {lang === 'am' ? 'የዋጋ እና የማስታወቂያ አይነት' : 'Pricing & Listing Type'}</h2>
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
                    className={`py-2.5 rounded-md border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      form.transaction_mode === t
                        ? 'bg-red-600 dark:bg-red-600 text-white border-red-600 dark:border-red-600'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
                    }`}>
                    {t === 'SALE' ? <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> For Sale</> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> For Rent</>}
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
                  className={`py-2 rounded-md border text-xs font-semibold transition ${
                    form.category === c.value
                      ? 'bg-red-600 dark:bg-red-600 text-white border-red-600 dark:border-red-600'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
                  }`}>
                  {lang === 'am' ? c.labelAm : c.labelEn}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> {lang === 'am' ? 'የአድራሻ ዝርዝሮች' : 'Location Details'}</h2>
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
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg> {lang === 'am' ? 'የንብረት መግለጫዎች' : 'Property Specifications'}</h2>
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
            className="px-5 py-2.5 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition border border-neutral-200 dark:border-neutral-700">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-sm transition disabled:opacity-50">
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
