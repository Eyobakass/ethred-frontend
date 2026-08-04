// src/app/[lang]/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property.types';
import { adminService } from '@/services/admin.service';

export default function AdminDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang === 'am' ? 'am' : 'en';
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);

  useEffect(() => {
    adminService
      .getPendingProperties()
      .then((res: any) => {
        if (res?.results && Array.isArray(res.results)) {
          setPendingProperties(res.results);
        } else if (Array.isArray(res)) {
          setPendingProperties(res);
        }
      })
      .catch(() => {
        setPendingProperties([
          {
            id: 'pending-1',
            owner_id: 'user-9',
            title_en: 'Penthouse Apartment in Bole Kazanchis',
            title_am: 'በቦሌ ካዛንችስ የሚገኝ ፔንት ሀውስ አፓርታማ',
            description_en: 'Pending document verification.',
            price_etb: 35000000,
            transaction_mode: 'SALE',
            category: 'APARTMENT',
            region: 'Addis Ababa',
            city: 'Addis Ababa',
            sub_city: 'Bole',
            woreda: 'Woreda 01',
            bedrooms: 4,
            bathrooms: 3,
            area_sqm: 280,
            status: 'PENDING',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      });
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminService.updatePropertyStatus(id, 'APPROVED');
      setPendingProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to approve property:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminService.updatePropertyStatus(id, 'SUSPENDED');
      setPendingProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to reject property:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="text-xs font-bold text-red-400 uppercase tracking-widest">
          🛡️ Platform Administration & Moderation
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">Pending Property Approvals Queue</h1>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 font-bold text-sm text-neutral-900 dark:text-white">
          Review Queue ({pendingProperties.length} pending items)
        </div>

        <div className="divide-y divide-neutral-800">
          {pendingProperties.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-600 dark:text-neutral-400">
              ✅ All pending property listings have been reviewed!
            </div>
          ) : (
            pendingProperties.map((item) => (
              <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{item.title_en}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Location: {item.sub_city}, {item.city} • Price: {item.price_etb} ETB
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/${lang}/admin/properties/${item.id}/review`}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
                  >
                    Review Listing &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
