"use client";

import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
