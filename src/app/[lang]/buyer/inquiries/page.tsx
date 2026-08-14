// src/app/[lang]/buyer/inquiries/page.tsx
'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import { inquiryService } from '@/services/inquiry.service';
import { PropertyInquiry } from '@/types/index';
import { MessageSquare, Clock, Eye, CheckCircle } from 'lucide-react';

const STATUS_CONFIG = {
  NEW: { label: 'Waiting for reply', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', icon: Clock },
  SEEN: { label: 'Seen by Seller', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Eye },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
};

const ITEMS_PER_PAGE = 10;

export default function BuyerInquiriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);

  const fetchInquiries = () => {
    setIsLoading(true);
    setLoadError(null);
    inquiryService
      .getSentInquiries()
      .then((data) => {
        setInquiries(data);
        setPage(1); // Reset to page 1
      })
      .catch((err: any) => {
        console.error('Failed to load sent inquiries:', err);
        setLoadError('Could not load your inquiries. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, []);

  const totalPages = Math.ceil(inquiries.length / ITEMS_PER_PAGE);
  const paginatedInquiries = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return inquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [inquiries, page]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 mb-6">
        <div className="text-xs font-bold text-red-400 uppercase tracking-widest">💬 My Account</div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">My Sent Inquiries</h1>
        <p className="text-xs text-neutral-500 mt-1">Track messages you have sent to property sellers.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {loadError && (
        <div className="p-6 text-center">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">⚠️ {loadError}</p>
          <button
            onClick={fetchInquiries}
            className="mt-3 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
          >
            🔄 Retry
          </button>
        </div>
      )}

      {!isLoading && !loadError && inquiries.length === 0 && (
        <div className="py-24 text-center">
          <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-base font-semibold text-neutral-600 dark:text-neutral-400">No inquiries sent yet</p>
          <p className="text-sm text-neutral-400 mt-1 mb-5">Browse properties and contact sellers you are interested in.</p>
          <Link
            href={`/${lang}/properties`}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition inline-block"
          >
            Browse Properties →
          </Link>
        </div>
      )}

      {!isLoading && !loadError && inquiries.length > 0 && (
        <div className="space-y-4">
          {paginatedInquiries.map((inquiry) => {
            const cfg = STATUS_CONFIG[inquiry.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={inquiry.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {inquiry.property ? (
                      <Link
                        href={`/${lang}/properties/${inquiry.property.id}`}
                        className="text-sm font-bold text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition truncate block"
                      >
                        🏠 {inquiry.property.title_en}
                      </Link>
                    ) : (
                      <p className="text-sm font-bold text-neutral-500">Property removed</p>
                    )}
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Sent {new Date(inquiry.created_at).toLocaleDateString('en-ET', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {inquiry.message.length > 200 ? inquiry.message.slice(0, 200) + '…' : inquiry.message}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                ← Previous
              </button>
              <span className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
