'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export const PendingUserBanner: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Don't show banner for admins or approved users
  if (isAdmin || !user || user.isApproved()) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b-2 border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon 
              icon={faClock} 
              className="w-5 h-5 text-yellow-600" 
            />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                חשבונך ממתין לאישור
              </p>
              <p className="text-xs text-yellow-700">
                תוכל לצפות בתוכן מוגבל בלבד עד לאישור המנהלים
              </p>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <Link href="/pending-approval">
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                פרטים נוספים
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};