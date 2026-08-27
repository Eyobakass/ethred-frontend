"use client";

import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      {children}
    </ProtectedRoute>
  );
}
