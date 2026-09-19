// src/app/[lang]/properties/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
import { inquiryService } from '@/services/inquiry.service';
import { formatCurrency } from '@/utils/currency';
import { useAuth } from '@/hooks/useAuth';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { createWhatsAppInquiryLink } from '@/utils/whatsapp';



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

  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => { validateSession(); }, [validateSession]);

  useEffect(() => {
    propertyService
      .getPropertyById(propertyId)
      .then((res) => {
        if (res) {
          setProperty(res);
          addRecentlyViewed(res);
        }
      })
      .catch(() => { notFound(); });
  }, [propertyId, addRecentlyViewed]);

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
        <div className="w-8 h-8 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500 text-sm font-semibold">Loading Property...</p>
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
        <Link href={`/${lang}`} className="hover:text-neutral-900 dark:text-white transition">{lang === 'am' ? 'ዋና ገጽ' : 'Home'}</Link>
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-2 font-medium">
            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> {property.sub_city}, {property.city}</span>
            {property.nearest_landmark && <span>· Near {property.nearest_landmark}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">{title}</h1>
          <div className="flex items-center gap-3 mt-3">
            {property.is_featured && (
              <span className="text-[11px] font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-2.5 py-1 rounded-md uppercase tracking-wider">
                FEATURED
              </span>
            )}
            {hasTour && (
              <span className="text-[11px] font-semibold bg-red-600 text-white px-2.5 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> 3D Tour
              </span>
            )}
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
              property.transaction_mode === 'SALE'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
            }`}>
              {property.transaction_mode === 'SALE' ? 'For Sale' : 'For Rent'}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-left md:text-right">
          <div className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-white">
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
            <div className="group relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
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
                    className="px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
                    <span>{lang === 'am' ? '3D ቱር ጀምር' : '3D Virtual Tour'}</span>
                  </Link>
                  <button
                    onClick={handleFavorite}
                    disabled={favLoading || !isAuthenticated}
                    className={`w-10 h-10 rounded-md flex items-center justify-center transition border ${
                      favorited
                        ? 'bg-neutral-900 border-neutral-900 text-red-500'
                        : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                    } disabled:opacity-50`}
                    title={isAuthenticated ? 'Save to favorites' : 'Sign in to save'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                </div>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-md tracking-wider">
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
                    className={`flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border transition ${
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
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              {lang === 'am' ? 'ስለ ቤቱ' : 'About This Property'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-3">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {lang === 'am' ? 'ተጨማሪ አገልግሎቶች' : 'Amenities & Features'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span
                    key={a.id}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-md"
                  >
                    {a.amenity_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Key specs + Contact */}
        <div className="space-y-5">
          {/* Key specs card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-4">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{lang === 'am' ? 'ቁልፍ መግለጫዎች' : 'Key Specifications'}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>, label: lang === 'am' ? 'መኝታ ቤቶች' : 'Bedrooms', value: `${property.bedrooms} Beds` },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>, label: lang === 'am' ? 'መታጠቢያ' : 'Bathrooms', value: `${property.bathrooms} Baths` },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>, label: lang === 'am' ? 'ስፋት' : 'Total Area', value: `${property.area_sqm} m²` },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>, label: lang === 'am' ? 'ምድብ' : 'Category', value: property.category },
              ].map((spec) => (
                <div key={spec.label} className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded border border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 font-medium block text-[11px] uppercase tracking-wide mb-1">{spec.label}</span>
                  <span className="text-neutral-900 dark:text-white font-semibold flex items-center gap-1.5">{spec.icon} {spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg space-y-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {lang === 'am' ? 'ለባለቤቱ ጥያቄ ያስቀምጡ' : 'Contact the Owner'}
            </h3>
            {inquirySuccess ? (
              <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {lang === 'am' ? 'መልዕክቱ ተልኳል! ሻጩ በቅርቡ ያነጋግርዎታል።' : 'Message sent! The seller will contact you soon.'}
                </p>
              </div>
            ) : !inquiryOpen ? (
              <div className="space-y-2.5">
                <button
                  onClick={() => setInquiryOpen(true)}
                  className="w-full py-3 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 hover:opacity-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                  <span>{lang === 'am' ? 'ቀጥታ ጥያቄ ላክ' : 'Send Inquiry'}</span>
                </button>

                {/* WhatsApp Click-to-Chat (SRS REQ-COMM-02) */}
                <a
                  href={createWhatsAppInquiryLink({
                    phone: (property as any).owner?.phone_number || (property as any).agency?.phone_number,
                    propertyTitle: (lang === 'am' && property.title_am) ? property.title_am : property.title_en,
                    priceEtb: Number(property.price_etb),
                    propertyId: property.id,
                    lang,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>{lang === 'am' ? 'በዋትስአፕ አነጋግር' : 'Chat on WhatsApp'}</span>
                </a>
              </div>
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
                className="block w-full text-center py-2.5 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-red-600 dark:border-red-600 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
                {lang === 'am' ? 'ቤቱን በ 3D ጎብኝ' : 'Take 3D Virtual Tour'}
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

      {/* Recently Viewed Carousel / Strip (SRS REQ-BUY-03) */}
      {recentlyViewed.filter((item) => item.id !== property.id).length > 0 && (
        <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {lang === 'am' ? 'በቅርብ የታዩ ሌሎች ቤቶች' : 'Recently Viewed Properties'}
            </h2>
            <Link
              href={`/${lang}/me/recently-viewed`}
              className="text-xs font-semibold text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition underline"
            >
              {lang === 'am' ? 'ሁሉንም አሳይ' : 'View All History'}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyViewed
              .filter((item) => item.id !== property.id)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/${lang}/properties/${item.id}`}
                  className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden flex flex-col hover:border-neutral-400 transition"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title_en}
                      className="w-full h-full object-cover group-hover:brightness-95 transition"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-white truncate group-hover:text-red-600 transition">
                      {lang === 'am' && item.title_am ? item.title_am : item.title_en}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate">{item.sub_city}, {item.city}</p>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white mt-1 tabular-nums">
                      {formatCurrency(item.price_etb, 'ETB', lang)}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Report Listing */}
      <div className="text-center py-6">
        <button
          onClick={() => setReportOpen(true)}
          className="text-xs text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition underline"
        >
          {lang === 'am' ? 'ይህን ማስታወቂያ ጥቆማ አድርግ' : 'Report this listing'}
        </button>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{lang === 'am' ? 'ይህን ማስታወቂያ ጥቆማ አድርግ' : 'Report this listing'}</h3>
              <button onClick={() => { setReportOpen(false); setReportReason(''); setReportError(null); }} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            {reportSuccess ? (
              <p className="text-sm text-center font-medium text-emerald-600 dark:text-emerald-400 py-4 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Thank you. Our team will review this listing.
              </p>
            ) : (
              <>
                <p className="text-xs text-neutral-500">Please describe the issue with this listing. Minimum 20 characters.</p>
                <textarea
                  rows={4}
                  value={reportReason}
                  onChange={(e) => { setReportReason(e.target.value); setReportError(null); }}
                  placeholder="e.g. This listing contains fake photos and incorrect price information..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 resize-none transition"
                />
                {reportError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{reportError}</p>
                )}
                <button
                  onClick={handleReport}
                  disabled={isReporting || reportReason.trim().length < 20}
                  className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition"
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
