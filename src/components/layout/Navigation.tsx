'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBuilding, 
  faBriefcase, 
  faUser, 
  faUsers, 
  faBars,
  faTimes,
  faSignInAlt,
  faSignOutAlt,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';

interface NavigationProps {
  className?: string;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  className = '', 
  onOpenAuth 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    {
      href: '/',
      label: 'בית',
      icon: faHome,
      requireAuth: false
    },
    {
      href: '/businesses',
      label: 'עסקים',
      icon: faBuilding,
      requireAuth: false
    },
    {
      href: '/jobs',
      label: 'דרושים',
      icon: faBriefcase,
      requireAuth: false
    },
    {
      href: '/mentors',
      label: 'חנכים',
      icon: faUsers,
      requireAuth: false
    },
    {
      href: '/profile',
      label: 'הפרופיל שלי',
      icon: faUser,
      requireAuth: true
    }
  ];

  const visibleItems = navigationItems.filter(item => 
    !item.requireAuth || (item.requireAuth && isAuthenticated && user?.isApproved())
  );

  return (
    <nav className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-primary-600">
                קהילה
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8 space-x-reverse">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={item.icon} className="w-4 h-4 ml-2" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-sm text-gray-600">
                  שלום, {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={faSignOutAlt}
                >
                  התנתק
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenAuth?.('login')}
                  icon={faSignInAlt}
                >
                  התחבר
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenAuth?.('register')}
                  icon={faUserPlus}
                >
                  הרשם
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Auth Buttons & Menu */}
          <div className="md:hidden flex items-center space-x-2 space-x-reverse">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-xs text-gray-600 max-w-20 truncate">
                  {user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  icon={isMobileMenuOpen ? faTimes : faBars}
                  aria-label="תפריט"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenAuth?.('login')}
                  className="text-xs px-2 py-1"
                >
                  התחבר
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenAuth?.('register')}
                  className="text-xs px-2 py-1"
                >
                  הרשם
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  icon={isMobileMenuOpen ? faTimes : faBars}
                  aria-label="תפריט"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4 ml-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Mobile Logout Section - Only for authenticated users */}
            {isAuthenticated && user && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 ml-3" />
                  <span>התנתק</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};