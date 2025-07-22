'use client';

import { createContext, useContext } from 'react';

interface AuthModalContextType {
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = (): AuthModalContextType => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};