// src/app/[lang]/properties/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { inquiryService } from '@/services/inquiry.service';
import { formatCurrency } from '@/utils/currency';
import { useAuth } from '@/hooks/useAuth';

// Sample property for when API is unavailable
const makeSampleProperty = (id: string): Property => ({
  id,
  owner_id: 'owner-1',
  title_en: 'Luxury 3-Bedroom Apartment in Bole Edna Mall',
  title_am: 'በቦሌ ኤድና ሞል አቅራቢያ የሚገኝ የቅንጦት ባለ 3 መኝታ አፓርታማ',
  description_en:
    'Exceptional modern apartment featuring a navigable 3D Matterport-style virtual tour. This high-rise unit boasts a master suite with jacuzzi, Italian marble finishes, high-speed elevators, backup power generator, underground parking, 24/7 security and CCTV coverage.',
  description_am:
    'ዘመናዊ ቅርፅ ያለው አፓርታማ ከ 3D ቨርቹዋል ጉብኝት ጋር። ዋናው ክፍል ጃኩዚ አለው፣ ኢጣሊያዊ የእብነ በረድ ፍጻሜ፣ ፈጣን ሊፍቶች፣ ምትክ ኃይለ ኤሌክትሪክ፣ ምድር ቤት ፓርኪንግ፣ 24/7 ደህንነት።',
  price_etb: 14500000,
  price_usd: 110000,
  transaction_mode: 'SALE',
  category: 'APARTMENT',
  region: 'Addis Ababa',
  city: 'Addis Ababa',
  sub_city: 'Bole',
  woreda: 'Woreda 03',
  nearest_landmark: 'Edna Mall',
  bedrooms: 3,
  bathrooms: 2,
  area_sqm: 165,
  status: 'APPROVED',
  is_featured: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  amenities: [
    { id: 'a1', property_id: id, amenity_name: 'Backup Generator' },
    { id: 'a2', property_id: id, amenity_name: 'Underground Parking' },
    { id: 'a3', property_id: id, amenity_name: '24/7 Security' },
    { id: 'a4', property_id: id, amenity_name: 'CCTV' },
    { id: 'a5', property_id: id, amenity_name: 'Swimming Pool' },
    { id: 'a6', property_id: id, amenity_name: 'Gym / Fitness Center' },
  ],
  media: [
    { id: 'm1', property_id: id, file_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', media_category: 'IMAGE', sort_order: 0, is_tour_scene: true },
    { id: 'm2', property_id: id, file_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', media_category: 'IMAGE', sort_order: 1 },
    { id: 'm3', property_id: id, file_url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80', media_category: 'IMAGE', sort_order: 2 },
  ],
});

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id: propertyId } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const { isAuthenticated, validateSession } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => { validateSession(); }, [validateSession]);

  useEffect(() => {
    propertyService
      .getPropertyById(propertyId)
      .then((res) => { if (res) setProperty(res); })
      .catch(() => setProperty(makeSampleProperty(propertyId)));
  }, [propertyId]);

  const handleSendInquiry = async () => {
    if (!isAuthenticated) {
      router.push(`/${lang}/auth/login`);
      return;
    }
    if (inquiryMsg.trim().length < 20) {
      setInquiryError('Message must be at least 20 characters.');
      return;
    }
    setIsSubmittingInquiry(true);
    setInquiryError(null);
    try {
      await inquiryService.createInquiry({ property_id: propertyId, message: inquiryMsg.trim() });
      setInquirySuccess(true);
      setInquiryMsg('');
      setInquiryOpen(false);
    } catch (err: any) {
      setInquiryError(err?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleReport = async () => {
    setReportError(null);
    if (reportReason.trim().length < 20) {
      setReportError('Please provide a reason of at least 20 characters.');
      return;
    }
    setIsReporting(true);
    try {
      await inquiryService.reportListing(propertyId, reportReason.trim());
      setReportSuccess(true);
      setTimeout(() => { setReportOpen(false); setReportSuccess(false); setReportReason(''); setReportError(null); }, 2000);
    } catch (err: any) {
      setReportError(err?.message || 'Failed to submit report.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    
    const wasFavorited = favorited;
    setFavorited(!wasFavorited);
    setFavLoading(true);
    
    try {
      if (wasFavorited) {
        await propertyService.removeFavorite(propertyId);
      } else {
        await propertyService.addFavorite(propertyId);
      }
    } catch (err: any) {
      console.error('Favorite action failed:', err?.message);
      setFavorited(wasFavorited);
    } finally {
      setFavLoading(false);
    }
  };


  if (!property) {
    return (
      <div className="py-32 text-center">
        <div className="w-12 h-12 border-4 border-red-600 dark:border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 text-sm font-semibold">Loading Property...</p>
      </div>
    );
  }

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const title = lang === 'am' && property.title_am ? property.title_am : property.title_en;
  const description = lang === 'am' && property.description_am ? property.description_am : property.description_en;
  const images = property.media?.filter((m) => m.media_category === 'IMAGE' && !m.is_tour_scene) ?? [];
  const hasTour = !!property.external_tour_url || property.media?.some((m) => m.is_tour_scene);

  const handlePrevImage = () => {
    if (images.length === 0) return;
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (images.length === 0) return;
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": property.category === 'HOUSE' ? "SingleFamilyResidence" : property.category === 'APARTMENT' ? "Apartment" : "RealEstateListing",
            "name": title,
            "description": description,
            "url": `https://ethred.com/${lang}/properties/${property.id}`,
            "image": images.map(img => getImageUrl(img.file_url)),
            "offers": {
              "@type": "Offer",
              "price": property.price_etb,
              "priceCurrency": "ETB",
              "availability": "https://schema.org/InStock",
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": property.city,
              "addressRegion": property.region,
              "streetAddress": `${property.sub_city}, ${property.woreda || ''}`,
              "addressCountry": "ET"
            },
            "numberOfRooms": property.bedrooms,
            "floorSize": {
              "@type": "QuantitativeValue",
              "value": property.area_sqm,
              "unitCode": "MTK"
            }
          })
        }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href={`/${lang}`} className="hover:text-neutral-900 dark:text-white transition">Home</Link>
        <span>/</span>
        <Link href={`/${lang}/properties`} className="hover:text-neutral-900 dark:text-white transition">
          {lang === 'am' ? 'ቤቶች' : 'Properties'}
        </Link>
        <span>/</span>
        <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">{property.title_en}</span>
      </nav>

      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-red-600 dark:text-red-400 mb-2 font-semibold">
            <span>📍 {property.sub_city}, {property.city}</span>
            {property.nearest_landmark && <span>· Near {property.nearest_landmark}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white leading-tight">{title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {property.is_featured && (
              <span className="text-[10px] font-extrabold bg-red-600 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-600/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                ⭐ Featured
              </span>
            )}
            {hasTour && (
              <span className="text-[10px] font-extrabold bg-neutral-50 dark:bg-neutral-800 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-600/30 px-2 py-0.5 rounded-md">
                🥽 3D Tour
              </span>
            )}
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
              property.transaction_mode === 'SALE'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-blue-950 text-blue-400 border border-blue-800'
            }`}>
              {property.transaction_mode === 'SALE' ? '🏷️ For Sale' : '🔑 For Rent'}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-left md:text-right">
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {formatCurrency(Number(property.price_etb), 'ETB', lang)}
          </div>
          {property.price_usd && (
            <div className="text-xs text-neutral-500 mt-0.5">
              ≈ {formatCurrency(Number(property.price_usd), 'USD', lang)}
            </div>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Gallery + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image + gallery */}
          <div className="space-y-2">
            <div className="group relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
              <img
                src={getImageUrl(images[activeImageIdx]?.file_url ?? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80')}
                alt={`${title} — photo ${activeImageIdx + 1}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-20 shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-20 shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* 3D Tour CTA overlay */}
              {hasTour && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex items-end justify-between">
                  <Link
                    href={`/${lang}/properties/${propertyId}/tour`}
                    className="px-6 py-3 rounded-xl bg-red-600 dark:bg-red-600 hover:bg-red-500 dark:bg-red-500 text-white font-extrabold text-sm shadow-2xl shadow-red-600 dark:shadow-red-600/30 transition flex items-center gap-2"
                  >
                    <span>🥽</span>
                    <span>{lang === 'am' ? '3D ቱር ጀምር' : 'Launch 3D Virtual Tour'}</span>
                  </Link>
                  <button
                    onClick={handleFavorite}
                    disabled={favLoading || !isAuthenticated}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      favorited
                        ? 'bg-red-600 border-red-500 text-neutral-900 dark:text-white'
                        : 'bg-black/50 border-white/20 text-neutral-900 dark:text-white hover:bg-black/70'
                    } disabled:opacity-50`}
                    title={isAuthenticated ? 'Save to favorites' : 'Sign in to save'}
                  >
                    {favorited ? '❤️' : '🤍'}
                  </button>
                </div>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  {activeImageIdx + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIdx(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition ${
                      i === activeImageIdx ? 'border-red-600 dark:border-red-600' : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img.file_url)} 
                      alt="" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {lang === 'am' ? 'ስለ ቤቱ' : 'About This Property'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {lang === 'am' ? 'ተጨማሪ አገልግሎቶች' : 'Amenities & Features'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span
                    key={a.id}
                    className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs rounded-xl"
                  >
                    ✅ {a.amenity_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Key specs + Contact */}
        <div className="space-y-5">
          {/* Key specs card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Key Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { icon: '🛏️', label: lang === 'am' ? 'መኝታ ቤቶች' : 'Bedrooms', value: `${property.bedrooms} Beds` },
                { icon: '🚿', label: lang === 'am' ? 'መታጠቢያ' : 'Bathrooms', value: `${property.bathrooms} Baths` },
                { icon: '📐', label: lang === 'am' ? 'ስፋት' : 'Total Area', value: `${property.area_sqm} m²` },
                { icon: '🏡', label: lang === 'am' ? 'ምድብ' : 'Category', value: property.category },
              ].map((spec) => (
                <div key={spec.label} className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-xl border border-neutral-300 dark:border-neutral-700">
                  <span className="text-neutral-500 block text-[10px] uppercase tracking-wide mb-1">{spec.label}</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{spec.icon} {spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {lang === 'am' ? 'ለባለቤቱ ጥያቄ ያስቀምጡ' : 'Contact the Owner'}
            </h3>
            {inquirySuccess ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800">
                <span>✅</span>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Message sent! The seller will contact you soon.
                </p>
              </div>
            ) : !inquiryOpen ? (
              <button
                onClick={() => setInquiryOpen(true)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>{lang === 'am' ? 'ቀጥታ ጥያቄ ላክ' : 'Send Inquiry'}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={inquiryMsg}
                  onChange={(e) => { setInquiryMsg(e.target.value); setInquiryError(null); }}
                  placeholder={lang === 'am' ? 'መልዕክትዎ...' : 'Hi, I am interested in this property. Is it still available?'}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 dark:border-red-600 resize-none transition"
                />
                {inquiryError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{inquiryError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSendInquiry}
                    disabled={isSubmittingInquiry || inquiryMsg.trim().length < 20}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition"
                  >
                    {isSubmittingInquiry ? 'Sending…' : 'Send'}
                  </button>
                  <button
                    onClick={() => { setInquiryOpen(false); setInquiryError(null); }}
                    className="px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold hover:bg-neutral-100 dark:bg-neutral-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {hasTour && (
              <Link
                href={`/${lang}/properties/${propertyId}/tour`}
                className="block w-full text-center py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-red-600 dark:border-red-600/30 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-neutral-100 dark:bg-neutral-700 transition"
              >
                🥽 {lang === 'am' ? 'ቤቱን በ 3D ጎብኝ' : 'Take 3D Virtual Tour'}
              </Link>
            )}
          </div>

          {/* Listing meta */}
          <div className="text-xs text-neutral-500 space-y-1 px-1">
            <p>Listed: {new Date(property.created_at).toLocaleDateString('en-ET')}</p>
            <p>Property ID: <span className="font-mono text-neutral-600 dark:text-neutral-400">{property.id}</span></p>
          </div>
        </div>
      </div>

      {/* Report Listing */}
      <div className="text-center py-6">
        <button
          onClick={() => setReportOpen(true)}
          className="text-xs text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition underline"
        >
          Report this listing
        </button>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Report this listing</h3>
              <button onClick={() => { setReportOpen(false); setReportReason(''); setReportError(null); }} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                ✕
              </button>
            </div>
            {reportSuccess ? (
              <p className="text-sm text-center font-semibold text-emerald-600 dark:text-emerald-400 py-4">
                ✅ Thank you. Our team will review this listing.
              </p>
            ) : (
              <>
                <p className="text-xs text-neutral-500">Please describe the issue with this listing. Minimum 20 characters.</p>
                <textarea
                  rows={4}
                  value={reportReason}
                  onChange={(e) => { setReportReason(e.target.value); setReportError(null); }}
                  placeholder="e.g. This listing contains fake photos and incorrect price information..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 resize-none transition"
                />
                {reportError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{reportError}</p>
                )}
                <button
                  onClick={handleReport}
                  disabled={isReporting || reportReason.trim().length < 20}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition"
                >
                  {isReporting ? 'Submitting…' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
