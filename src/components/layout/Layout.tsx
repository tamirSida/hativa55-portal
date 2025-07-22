'use client';

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { AuthModal, PendingApprovalMessage } from '@/components/auth';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthModalContext } from '@/hooks/useAuthModal';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showFooter = true,
  className = ''
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const { user, loading, isAuthenticated } = useAuthContext();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Show pending approval for authenticated but unapproved users
  if (isAuthenticated && user && !user.isApproved()) {
    return <PendingApprovalMessage />;
  }

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`}>
        {/* Navigation */}
        <Navigation onOpenAuth={openAuthModal} />
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer */}
        {showFooter && <Footer />}
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authModalMode}
        />
      </div>
    </AuthModalContext.Provider>
  );
};