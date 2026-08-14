// src/app/[lang]/seller/inquiries/page.tsx
'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import { inquiryService } from '@/services/inquiry.service';
import { PropertyInquiry } from '@/types/index';
import { MessageSquare, CheckCircle, Eye, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  NEW: { label: 'New', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', icon: Clock },
  SEEN: { label: 'Seen', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Eye },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
};

const ITEMS_PER_PAGE = 10;

export default function SellerInquiriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);

  const fetchInquiries = () => {
    setIsLoading(true);
    setLoadError(null);
    inquiryService
      .getReceivedInquiries()
      .then((data) => {
        setInquiries(data);
        setPage(1); // Reset to page 1 on load
      })
      .catch((err: any) => {
        console.error('Failed to load inquiries:', err);
        setLoadError('Could not load inquiries. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleSelect = async (inquiry: PropertyInquiry) => {
    setActiveId(inquiry.id);
    if (inquiry.status === 'NEW') {
      // Optimistic update
      setInquiries((prev) =>
        prev.map((q) => (q.id === inquiry.id ? { ...q, status: 'SEEN' } : q))
      );
      try {
        await inquiryService.updateInquiryStatus(inquiry.id, 'SEEN');
      } catch {
        // Revert on error
        setInquiries((prev) =>
          prev.map((q) => (q.id === inquiry.id ? { ...q, status: 'NEW' } : q))
        );
      }
    }
  };

  const handleResolve = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(id);
    try {
      await inquiryService.updateInquiryStatus(id, 'RESOLVED');
      setInquiries((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: 'RESOLVED' } : q))
      );
    } catch (err: any) {
      console.error('Failed to resolve inquiry:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Memoized computations
  const newCount = useMemo(() => inquiries.filter((q) => q.status === 'NEW').length, [inquiries]);
  const active = useMemo(() => inquiries.find((q) => q.id === activeId), [inquiries, activeId]);
  
  const totalPages = Math.ceil(inquiries.length / ITEMS_PER_PAGE);
  const paginatedInquiries = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return inquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [inquiries, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 mb-6">
        <div className="text-xs font-bold text-red-400 uppercase tracking-widest">💬 Seller Portal</div>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Received Inquiries
            {newCount > 0 && (
              <span className="ml-3 px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">
                {newCount} new
              </span>
            )}
          </h1>
          <Link
            href={`/${lang}/seller/dashboard`}
            className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
          >
            ← Dashboard
          </Link>
        </div>
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

      {!isLoading && !loadError && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Left: Inquiry List */}
          <div className="lg:col-span-2 space-y-2">
            {inquiries.length === 0 ? (
              <div className="py-20 text-center">
                <MessageSquare className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No inquiries received yet.</p>
                <p className="text-xs text-neutral-400 mt-1">Buyers will contact you here when they are interested in your listings.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {paginatedInquiries.map((inquiry) => {
                    const cfg = STATUS_CONFIG[inquiry.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <button
                        key={inquiry.id}
                        onClick={() => handleSelect(inquiry)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          activeId === inquiry.id
                            ? 'border-red-600 bg-red-50 dark:bg-red-950/20'
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                              {inquiry.buyer?.profile?.full_name || 'Anonymous Buyer'}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                              {inquiry.property?.title_en || 'Unknown property'}
                            </p>
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-2">
                              {inquiry.message}
                            </p>
                          </div>
                          <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-2">
                          {new Date(inquiry.created_at).toLocaleDateString('en-ET', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </button>
                    );
                  })}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold disabled:opacity-40 transition"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-neutral-500">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold disabled:opacity-40 transition"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Detail pane */}
          <div className="lg:col-span-3">
            {!active ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                <MessageSquare className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Select an inquiry to view details</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      {active.buyer?.profile?.full_name || 'Anonymous Buyer'}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(active.created_at).toLocaleDateString('en-ET', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  {active.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(active.id)}
                      disabled={actionLoading === active.id}
                      className="flex-shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold transition"
                    >
                      {actionLoading === active.id ? 'Saving…' : '✅ Mark as Resolved'}
                    </button>
                  )}
                </div>

                {active.property && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <span className="text-sm">🏠</span>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Property</p>
                      <Link
                        href={`/${lang}/properties/${active.property.id}`}
                        className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                      >
                        {active.property.title_en}
                      </Link>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Message</p>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {active.message}
                  </p>
                </div>

                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[active.status].color}`}>
                    Status: {STATUS_CONFIG[active.status].label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
