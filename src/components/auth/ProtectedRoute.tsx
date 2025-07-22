'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireApproval?: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireApproval = true,
  adminOnly = false,
  redirectTo
}) => {
  const { user, isAdmin, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // Admin-only routes
    if (adminOnly && !isAdmin) {
      router.push(redirectTo || '/');
      return;
    }

    // Routes that require authentication
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Routes that require approval (but admins bypass this)
    if (requireApproval && !isAdmin && user && !user.isApproved()) {
      router.push('/pending-approval');
      return;
    }

  }, [user, isAdmin, isAuthenticated, loading, adminOnly, requireApproval, redirectTo, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Admin-only protection
  if (adminOnly && !isAdmin) {
    return null; // Will redirect via useEffect
  }

  // Authentication required
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Approval required (except for admins)
  if (requireApproval && !isAdmin && user && !user.isApproved()) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};