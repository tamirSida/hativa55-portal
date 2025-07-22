'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faClock, 
  faHome,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const { user, firebaseUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // If user is approved, redirect them to home
  if (user?.isApproved()) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Image 
              src="/logo.png" 
              alt="לוגו הקהילה" 
              width={48} 
              height={48} 
              className="h-12 w-auto"
            />
            <h1 className="text-3xl font-bold text-teal-600">קהילה</h1>
          </div>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="relative">
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                className="w-16 h-16 text-green-500 mx-auto mb-4" 
              />
              <FontAwesomeIcon 
                icon={faClock} 
                className="w-6 h-6 text-yellow-500 absolute -bottom-1 -right-1 bg-white rounded-full" 
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ההרשמה הושלמה בהצלחה!
          </h2>

          <div className="space-y-4 text-gray-600 mb-8">
            <p className="text-lg">
              שלום {user?.name || firebaseUser?.displayName},
            </p>
            <p>
              חשבונך נוצר בהצלחה ונמצא כעת בהליך אישור על ידי המנהלים.
            </p>
            <p>
              תקבל הודעה ברגע שהחשבון יאושר ותוכל להתחיל להשתמש בפלטפורמה.
            </p>
          </div>

          {/* User Info */}
          <div className="bg-teal-50 rounded-xl p-4 mb-6 text-right">
            <h3 className="font-semibold text-gray-900 mb-2">פרטי החשבון:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>שם:</strong> {user?.name || firebaseUser?.displayName}</p>
              <p><strong>אימייל:</strong> {user?.email || firebaseUser?.email}</p>
              {user?.city && <p><strong>עיר:</strong> {user.city}</p>}
              {user?.gdud && <p><strong>יחידה:</strong> {user.gdud}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5" />
              <span className="font-semibold">סטטוס: ממתין לאישור</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
              >
                <FontAwesomeIcon icon={faHome} className="w-5 h-5 ml-2" />
                חזרה לעמוד הבית
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleLogout}
              className="w-full"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 ml-2" />
              התנתק
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600">
          <p>
            זמן האישור הממוצע: 24-48 שעות
          </p>
          <p className="mt-2">
            יש שאלות? צור קשר עם הצוות ב
            <a href="mailto:support@community.com" className="text-teal-600 hover:underline mr-1">
              support@community.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}