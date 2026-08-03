// src/app/[lang]/properties/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { propertyService } from '@/services/property.service';
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
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');

  useEffect(() => { validateSession(); }, [validateSession]);

  useEffect(() => {
    propertyService
      .getPropertyById(propertyId)
      .then((res) => { if (res) setProperty(res); })
      .catch(() => setProperty(makeSampleProperty(propertyId)));
  }, [propertyId]);

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    setFavLoading(true);
    try {
      const res = await propertyService.toggleFavorite(propertyId);
      setFavorited(res.favorited);
    } catch {
      setFavorited((v) => !v); // optimistic toggle fallback
    } finally {
      setFavLoading(false);
    }
  };

  if (!property) {
    return (
      <div className="py-32 text-center">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gold-400 text-sm font-semibold">Loading Property...</p>
      </div>
    );
  }

  const title = lang === 'am' && property.title_am ? property.title_am : property.title_en;
  const description = lang === 'am' && property.description_am ? property.description_am : property.description_en;
  const images = property.media?.filter((m) => m.media_category === 'IMAGE') ?? [];
  const hasTour = !!property.external_tour_url || images.some((m) => m.is_tour_scene);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href={`/${lang}`} className="hover:text-white transition">Home</Link>
        <span>/</span>
        <Link href={`/${lang}/properties`} className="hover:text-white transition">
          {lang === 'am' ? 'ቤቶች' : 'Properties'}
        </Link>
        <span>/</span>
        <span className="text-neutral-400 truncate max-w-[200px]">{property.title_en}</span>
      </nav>

      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gold-400 mb-2 font-semibold">
            <span>📍 {property.sub_city}, {property.city}</span>
            {property.nearest_landmark && <span>· Near {property.nearest_landmark}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {property.is_featured && (
              <span className="text-[10px] font-extrabold bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                ⭐ Featured
              </span>
            )}
            {hasTour && (
              <span className="text-[10px] font-extrabold bg-neutral-800 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-md">
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
          <div className="text-3xl font-extrabold text-white">
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
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
              <img
                src={images[activeImageIdx]?.file_url ?? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
                alt={`${title} — photo ${activeImageIdx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 3D Tour CTA overlay */}
              {hasTour && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex items-end justify-between">
                  <Link
                    href={`/${lang}/properties/${propertyId}/tour`}
                    className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-sm shadow-2xl shadow-gold-500/30 transition flex items-center gap-2"
                  >
                    <span>🥽</span>
                    <span>{lang === 'am' ? '3D ቱር ጀምር' : 'Launch 3D Virtual Tour'}</span>
                  </Link>
                  <button
                    onClick={handleFavorite}
                    disabled={favLoading || !isAuthenticated}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      favorited
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                    } disabled:opacity-50`}
                    title={isAuthenticated ? 'Save to favorites' : 'Sign in to save'}
                  >
                    {favorited ? '❤️' : '🤍'}
                  </button>
                </div>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
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
                      i === activeImageIdx ? 'border-gold-500' : 'border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    <img src={img.file_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-white">
              {lang === 'am' ? 'ስለ ቤቱ' : 'About This Property'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <h2 className="text-base font-bold text-white">
                {lang === 'am' ? 'ተጨማሪ አገልግሎቶች' : 'Amenities & Features'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span
                    key={a.id}
                    className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-xl"
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
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Key Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { icon: '🛏️', label: lang === 'am' ? 'መኝታ ቤቶች' : 'Bedrooms', value: `${property.bedrooms} Beds` },
                { icon: '🚿', label: lang === 'am' ? 'መታጠቢያ' : 'Bathrooms', value: `${property.bathrooms} Baths` },
                { icon: '📐', label: lang === 'am' ? 'ስፋት' : 'Total Area', value: `${property.area_sqm} m²` },
                { icon: '🏡', label: lang === 'am' ? 'ምድብ' : 'Category', value: property.category },
              ].map((spec) => (
                <div key={spec.label} className="bg-neutral-800 p-3 rounded-xl border border-neutral-700">
                  <span className="text-neutral-500 block text-[10px] uppercase tracking-wide mb-1">{spec.label}</span>
                  <span className="text-white font-bold">{spec.icon} {spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-white">
              {lang === 'am' ? 'ለባለቤቱ ጥያቄ ያስቀምጡ' : 'Contact the Owner'}
            </h3>
            {!inquiryOpen ? (
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
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  placeholder={lang === 'am' ? 'መልዕክትዎ...' : 'Hi, I am interested in this property. Is it still available?'}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500 resize-none transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert('Inquiry sent! (Backend integration pending)');
                      setInquiryOpen(false);
                      setInquiryMsg('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setInquiryOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-semibold hover:bg-neutral-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {hasTour && (
              <Link
                href={`/${lang}/properties/${propertyId}/tour`}
                className="block w-full text-center py-3 rounded-xl bg-neutral-800 border border-gold-500/30 text-gold-400 font-bold text-xs hover:bg-neutral-700 transition"
              >
                🥽 {lang === 'am' ? 'ቤቱን በ 3D ጎብኝ' : 'Take 3D Virtual Tour'}
              </Link>
            )}
          </div>

          {/* Listing meta */}
          <div className="text-xs text-neutral-500 space-y-1 px-1">
            <p>Listed: {new Date(property.created_at).toLocaleDateString('en-ET')}</p>
            <p>Property ID: <span className="font-mono text-neutral-400">{property.id}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
