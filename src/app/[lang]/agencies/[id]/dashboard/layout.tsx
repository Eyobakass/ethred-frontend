"use client";

import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function AgencyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['AGENCY_ADMIN', 'AGENCY_AGENT']}>
      {children}
    </ProtectedRoute>
  );
}
