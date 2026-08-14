// src/app/[lang]/account/billing/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { paymentService } from '@/services/payment.service';
import { BillingInvoice } from '@/types/index';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/utils/currency';

export default function BillingHistoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  
  const { isAuthenticated } = useAuthStore();
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    paymentService.listInvoices()
      .then((res: any) => {
        const list = Array.isArray(res) ? res
          : Array.isArray(res?.results) ? res.results
          : Array.isArray(res?.data) ? res.data : [];
        setInvoices(list);
      })
      .catch((err) => {
        console.error('Failed to load invoices:', err);
        setError('Failed to load billing history.');
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-500 mb-4">Please log in to view your billing history.</p>
        <Link href={`/${lang}/auth/login`} className="text-red-600 font-bold hover:underline">Sign In</Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">COMPLETED</span>;
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">PENDING</span>;
      case 'FAILED': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">FAILED</span>;
      case 'REFUNDED': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">REFUNDED</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Account Details</p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-0.5">Billing History</h1>
        </div>
        <Link href={`/${lang}/account/settings`} className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition">
          Go to Settings →
        </Link>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">No payment history yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400 text-xs">Date</th>
                  <th className="px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400 text-xs">Transaction Ref</th>
                  <th className="px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400 text-xs">Amount</th>
                  <th className="px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400 text-xs">Processor</th>
                  <th className="px-5 py-3 font-semibold text-neutral-600 dark:text-neutral-400 text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                    <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                      {new Date(inv.created_at).toLocaleDateString('en-ET', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-neutral-500">
                      {inv.tx_ref}
                    </td>
                    <td className="px-5 py-4 font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(inv.amount, inv.currency as any, lang as 'en' | 'am')}
                    </td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400 capitalize">
                      {inv.payment_processor?.replace('_', ' ').toLowerCase() || 'Unknown'}
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(inv.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
