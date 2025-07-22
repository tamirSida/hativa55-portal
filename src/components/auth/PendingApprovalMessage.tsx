import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';

interface PendingApprovalMessageProps {
  onLogout?: () => void;
}

export const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({ 
  onLogout 
}) => {
  const { logout, user } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      onLogout?.();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon 
              icon={faClock} 
              className="w-8 h-8 text-yellow-600"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            החשבון ממתין לאישור
          </h2>
          
          <p className="text-gray-600 leading-relaxed">
            תודה שנרשמת לפלטפורמת הקהילה! החשבון שלך נמצא בתהליך אימות ומחכה לאישור מנהל.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center text-blue-800">
            <FontAwesomeIcon 
              icon={faUserCheck} 
              className="w-5 h-5 ml-3"
            />
            <div className="text-sm text-right">
              <p className="font-medium">מה קורה עכשיו?</p>
              <p className="mt-1">
                מנהל הקהילה יבדוק את הפרטים שלך ויאשר את החשבון בהקדם. 
                תקבל הודעה באימייל כאשר החשבון יאושר.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            <strong>שם:</strong> {user?.name}
          </p>
          <p className="text-sm text-gray-500">
            <strong>אימייל:</strong> {user?.email}
          </p>
          {user?.university && (
            <p className="text-sm text-gray-500">
              <strong>אוניברסיטה:</strong> {user.university}
            </p>
          )}
          {user?.field && (
            <p className="text-sm text-gray-500">
              <strong>תחום:</strong> {user.field}
            </p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            fullWidth
          >
            התנתק
          </Button>
          
          <p className="text-xs text-gray-500 mt-3">
            זמן ממוצע לאישור: 24-48 שעות
          </p>
        </div>
      </div>
    </div>
  );
};