// src/app/[lang]/admin/audit-logs/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { AuditLog } from '@/types/index';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  UPDATE: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  DELETE: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  APPROVE: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
  REJECT: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  BAN: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  VERIFY: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
};

export default function AdminAuditLogsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const LIMIT = 50;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await adminService.getAuditLogs({
        page, limit: LIMIT,
        action: filterAction.trim() || undefined,
        target_table: filterTable || undefined,
      });
      const list = Array.isArray(res) ? res
        : Array.isArray(res?.results) ? res.results
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.logs) ? res.logs : [];
      setLogs(list);
      setTotal(res?.total ?? res?.count ?? list.length);
    } catch {
      setError('Failed to load audit logs.');
    } finally { setIsLoading(false); }
  }, [page, filterAction, filterTable]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  const actionColor = (action: string) => {
    const key = Object.keys(ACTION_COLOR).find(k => action?.toUpperCase().includes(k));
    return key ? ACTION_COLOR[key] : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Admin</p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-0.5">Audit Logs</h1>
        </div>
        <Link href={`/${lang}/admin/dashboard`}
          className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition">← Dashboard</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          placeholder="Filter by action (e.g. APPROVE, BAN)…"
          className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition"
        />
        <select
          value={filterTable}
          onChange={e => { setFilterTable(e.target.value); setPage(1); }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-red-500 transition"
        >
          <option value="">All Tables</option>
          {['properties', 'users', 'agencies', 'invoices'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={() => { setPage(1); fetchLogs(); }}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-600">{error}</p>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm text-neutral-500">No audit log entries found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left font-semibold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                    {['Timestamp', 'Actor', 'Action', 'Target Table', 'Target ID', ''].map(h => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {logs.map((log: any) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                        <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('en-ET')}
                        </td>
                        <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                          {log.actor?.email ?? log.actor_id ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${actionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 font-mono">{log.target_table ?? '—'}</td>
                        <td className="px-4 py-3 text-neutral-400 font-mono truncate max-w-[120px]">{log.target_id ?? '—'}</td>
                        <td className="px-4 py-3">
                          {(log.new_values || log.old_values) && (
                            <button
                              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                              className="text-blue-500 hover:text-blue-700 font-semibold">
                              {expandedId === log.id ? '▲ Hide' : '▼ Details'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr className="bg-neutral-50 dark:bg-neutral-950">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-2">
                              {log.old_values && (
                                <div>
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Old Values</p>
                                  <pre className="text-[11px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 overflow-x-auto text-neutral-700 dark:text-neutral-300">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_values && (
                                <div>
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">New Values</p>
                                  <pre className="text-[11px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 overflow-x-auto text-neutral-700 dark:text-neutral-300">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Page {page} of {totalPages} · {total} entries</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
