'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBuilding, 
  faBriefcase, 
  faUser, 
  faUsers, 
  faGraduationCap,
  faBars,
  faTimes,
  faSignInAlt,
  faSignOutAlt,
  faUserPlus,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  className?: string;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  className = '', 
  onOpenAuth 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, firebaseUser, isAdmin, isAuthenticated, logout } = useAuth();

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
      href: '/students',
      label: 'סביבת סטודנטים',
      icon: faGraduationCap,
      requireAuth: false
    },
    {
      href: '/mentors',
      label: 'מציאת מנטור',
      icon: faUsers,
      requireAuth: false
    },
    {
      href: '/profile',
      label: 'הפרופיל שלי',
      icon: faUser,
      requireAuth: true
    },
    {
      href: '/admin/dashboard',
      label: 'ממשק ניהול',
      icon: faCog,
      requireAuth: true,
      adminOnly: true
    }
  ];

  const visibleItems = navigationItems.filter(item => {
    if (!item.requireAuth) return true;
    if (!isAuthenticated) return false;
    if (item.adminOnly) return isAdmin;
    return user?.isApproved() || isAdmin;
  });

  return (
    <nav className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Hamburger Menu - Right Side for RTL */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              icon={isMobileMenuOpen ? faTimes : faBars}
              aria-label="תפריט"
            />
          </div>

          {/* Logo - Center on Mobile, Left on Desktop */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="לוגו הקהילה" 
                width={32} 
                height={32} 
                className="h-8 w-auto"
              />
              <div className="text-2xl font-bold text-teal-600">
                קהילה
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center gap-8">
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
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  שלום, {user?.name || firebaseUser?.displayName || firebaseUser?.email}
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
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={faSignInAlt}
                  >
                    התחבר
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={faUserPlus}
                  >
                    הרשם
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Auth Buttons - Left Side */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <span className="text-xs text-gray-600 max-w-20 truncate">
                {user?.name || firebaseUser?.displayName || firebaseUser?.email}
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    התחבר
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    הרשם
                  </Button>
                </Link>
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