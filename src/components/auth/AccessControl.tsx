'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AccessControlProps {
  children: React.ReactNode;
  requireApproved?: boolean;
  requireAdmin?: boolean;
  allowedForPending?: boolean;
  redirectTo?: string;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  children,
  requireApproved = false,
  requireAdmin = false,
  allowedForPending = false,
  redirectTo = '/'
}) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    // Admin access
    if (requireAdmin && !isAdmin) {
      router.push(redirectTo);
      return;
    }

    // Approved user access
    if (requireApproved) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (!isAdmin && (!user || !user.isApproved())) {
        router.push('/pending-approval');
        return;
      }
    }

    // Pending user restrictions
    if (isAuthenticated && !isAdmin && user && !user.isApproved() && !allowedForPending) {
      router.push('/pending-approval');
      return;
    }

  }, [user, isAuthenticated, isAdmin, loading, requireApproved, requireAdmin, allowedForPending, router, redirectTo]);

  // Show loading while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">בודק הרשאות...</p>
        </div>
      </div>
    );
  }

  // Check permissions after loading
  if (requireAdmin && !isAdmin) return null;
  
  if (requireApproved) {
    if (!isAuthenticated) return null;
    if (!isAdmin && (!user || !user.isApproved())) return null;
  }

  if (isAuthenticated && !isAdmin && user && !user.isApproved() && !allowedForPending) {
    return null;
  }

  return <>{children}</>;
};