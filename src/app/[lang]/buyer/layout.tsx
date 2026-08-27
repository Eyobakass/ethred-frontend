"use client";

import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['BUYER']}>
      {children}
    </ProtectedRoute>
  );
}
