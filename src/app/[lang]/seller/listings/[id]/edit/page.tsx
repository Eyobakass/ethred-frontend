// src/app/[lang]/seller/listings/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';
import { PropertyCategory, TransactionType, Property } from '@/types/property.types';
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

export default function EditListingPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

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

  useEffect(() => {
    propertyService
      .getPropertyById(id)
      .then((data) => {
        setProperty(data);
        if (data) {
          setForm({
            title_en: data.title_en || '',
            title_am: data.title_am || '',
            description_en: data.description_en || '',
            description_am: data.description_am || '',
            price_etb: String(data.price_etb || ''),
            transaction_mode: data.transaction_mode || 'SALE',
            category: data.category || 'APARTMENT',
            region: data.region || 'Addis Ababa',
            sub_city: data.sub_city || '',
            woreda: data.woreda || '',
            nearest_landmark: data.nearest_landmark || '',
            bedrooms: String(data.bedrooms || '1'),
            bathrooms: String(data.bathrooms || '1'),
            area_sqm: String(data.area_sqm || ''),
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load property details.');
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [id]);

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
      await propertyService.updateProperty(id, {
        title_en: form.title_en.trim(),
        title_am: form.title_am.trim() || undefined,
        description_en: form.description_en.trim(),
        description_am: form.description_am.trim() || undefined,
        price_etb: Number(form.price_etb),
        transaction_mode: form.transaction_mode,
        category: form.category,
        region: form.region,
        sub_city: form.sub_city,
        woreda: form.woreda,
        nearest_landmark: form.nearest_landmark.trim() || undefined,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area_sqm: Number(form.area_sqm),
      });

      router.push(`/${lang}/seller/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Failed to update property.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-10 text-center text-neutral-500">Loading property details...</div>;
  }

  const subCities = ETHIOPIAN_LOCATIONS[form.region]?.subCities || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {lang === 'am' ? 'የቤት መረጃ አርትዕ' : 'Edit Property Listing'}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Update title, pricing, location, and property attributes.
          </p>
        </div>
        <Link href={`/${lang}/seller/dashboard`} className="text-xs text-blue-500 hover:underline">
          &larr; {lang === 'am' ? 'ተመለስ' : 'Back to Dashboard'}
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
        {/* Category & Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Transaction Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('transaction_mode', 'SALE')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                  form.transaction_mode === 'SALE'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                For Sale
              </button>
              <button
                type="button"
                onClick={() => handleChange('transaction_mode', 'RENT')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                  form.transaction_mode === 'RENT'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                For Rent
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {lang === 'am' ? c.labelAm : c.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Title (English) *
            </label>
            <input
              type="text"
              value={form.title_en}
              onChange={(e) => handleChange('title_en', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
              placeholder="e.g. Modern 3-Bedroom Villa in Bole"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Title (Amharic)
            </label>
            <input
              type="text"
              value={form.title_am}
              onChange={(e) => handleChange('title_am', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
              placeholder="ምሳሌ፡ በቦሌ የሚገኝ ዘመናዊ ቤት"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Description (English) *
          </label>
          <textarea
            value={form.description_en}
            onChange={(e) => handleChange('description_en', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none min-h-[100px]"
            placeholder="Detailed description of features, view, security, generator..."
          />
        </div>

        {/* Price & Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Price (ETB) *
            </label>
            <input
              type="number"
              value={form.price_etb}
              onChange={(e) => handleChange('price_etb', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
              placeholder="e.g. 15000000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Area (sqm) *
            </label>
            <input
              type="number"
              value={form.area_sqm}
              onChange={(e) => handleChange('area_sqm', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
              placeholder="e.g. 250"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Bedrooms / Bathrooms
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={form.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                className="w-1/2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
                placeholder="Beds"
              />
              <input
                type="number"
                value={form.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                className="w-1/2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
                placeholder="Baths"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Region / City
            </label>
            <select
              value={form.region}
              onChange={(e) => {
                handleChange('region', e.target.value);
                handleChange('sub_city', '');
              }}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
            >
              {Object.keys(ETHIOPIAN_LOCATIONS).map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Sub-City / Zone
            </label>
            {subCities.length > 0 ? (
              <select
                value={form.sub_city}
                onChange={(e) => handleChange('sub_city', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
              >
                <option value="">Select Sub-city</option>
                {subCities.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.sub_city}
                onChange={(e) => handleChange('sub_city', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
                placeholder="e.g. Zone 1"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Nearest Landmark
            </label>
            <input
              type="text"
              value={form.nearest_landmark}
              onChange={(e) => handleChange('nearest_landmark', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none"
              placeholder="e.g. Edna Mall"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Link
            href={`/${lang}/seller/dashboard`}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
