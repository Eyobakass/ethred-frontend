"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, validateSession } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Attempt session hydration
    validateSession().finally(() => {
      setIsReady(true);
    });
  }, [validateSession]);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!user?.role || !allowedRoles.includes(user.role)) {
        // Logged in but unauthorized -> send to generic dashboard or login
        router.replace('/auth/login');
      }
    }
  }, [isReady, isAuthenticated, user?.role, allowedRoles, router]);

  // Don't render children until we've verified session and permissions
  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}
