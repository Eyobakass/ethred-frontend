// src/app/[lang]/agencies/[id]/dashboard/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { agencyService } from '@/services/agency.service';
import { useAuthStore } from '@/store/useAuthStore';
import { AgencyEmployee } from '@/types/index';

export default function AgencyDashboardPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: rawLang, id } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [analytics, setAnalytics] = useState<any | null>(null);
  const [employees, setEmployees] = useState<AgencyEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'AGENCY_ADMIN') {
      router.replace(`/${lang}/auth/login`);
      return;
    }

    setIsLoading(true);
    Promise.all([
      agencyService.getAnalytics(id).catch(() => null),
      agencyService.listEmployees(id).catch(() => [])
    ])
      .then(([analyticsRes, employeesRes]) => {
        setAnalytics(analyticsRes);
        setEmployees(employeesRes as AgencyEmployee[]);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, [id, isAuthenticated, user, lang, router]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setInviteSuccess(false);
    try {
      await agencyService.inviteEmployee(id, inviteEmail.trim());
      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to send invite.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveEmployee = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    setActionLoadingId(userId);
    try {
      await agencyService.removeEmployee(id, userId);
      setEmployees(prev => prev.filter(e => e.user_id !== userId));
    } catch (err: any) {
      alert(err?.message || 'Failed to remove employee.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="py-20 text-center text-red-600 font-bold">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Agency Admin</p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">Agency Dashboard</h1>
        </div>
        <Link href={`/${lang}/agencies/${id}`} className="text-sm font-bold text-red-600 hover:underline">
          View Public Profile ↗
        </Link>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase">Total Listings</p>
          <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {analytics?.total_listings ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase">Total Views</p>
          <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {analytics?.total_views ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase">Total Inquiries</p>
          <p className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
            {analytics?.total_inquiries ?? 0}
          </p>
        </div>
      </div>

      {/* Team Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Team Members</h2>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            {employees.length === 0 ? (
              <p className="p-8 text-center text-sm text-neutral-500">No team members found.</p>
            ) : (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {employees.map(emp => (
                  <li key={emp.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {emp.user?.profile?.avatar_url ? (
                          <img src={emp.user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-neutral-500">
                            {(emp.user?.profile?.full_name || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                          {emp.user?.profile?.full_name || 'Unnamed User'}
                        </p>
                        <p className="text-xs text-neutral-500">{emp.assigned_role}</p>
                      </div>
                    </div>
                    {emp.user_id !== user?.id && (
                      <button
                        onClick={() => handleRemoveEmployee(emp.user_id)}
                        disabled={actionLoadingId === emp.user_id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 transition disabled:opacity-50">
                        {actionLoadingId === emp.user_id ? 'Removing…' : 'Remove'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Invite Form */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Invite Agent</h2>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">User Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="agent@example.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={isInviting || !inviteEmail}
                className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm disabled:opacity-50 transition">
                {isInviting ? 'Sending Invite...' : 'Send Invite'}
              </button>
              {inviteSuccess && (
                <p className="text-xs font-bold text-emerald-600 text-center mt-2">✅ Invite sent successfully!</p>
              )}
            </form>
            <p className="text-xs text-neutral-500 mt-4 text-center">
              The invited user must already have an account on Ethred.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
