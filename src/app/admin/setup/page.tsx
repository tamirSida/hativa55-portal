'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faUserShield, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card } from '@/components/ui';
import { AdminService } from '@/services/AdminService';
import { UserService } from '@/services/UserService';
import { useRouter } from 'next/navigation';

export default function AdminSetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    identityId: ''
  });

  const adminService = new AdminService();
  const userService = new UserService();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateStep1 = (): boolean => {
    if (!formData.email || !formData.password || !formData.name || !formData.identityId) {
      setError('יש למלא את כל השדות');
      return false;
    }

    if (formData.identityId.length !== 9 || !/^\d{9}$/.test(formData.identityId)) {
      setError('תעודת זהות חייבת להכיל 9 ספרות');
      return false;
    }

    if (formData.password.length < 6) {
      setError('סיסמה חייבת להכיל לפחות 6 תווים');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) return;

    setLoading(true);
    setError('');

    try {
      // Step 1: Check if super admin already exists
      const existingSuperAdmins = await adminService.getAdminsByRole('super_admin' as any);
      if (existingSuperAdmins.length > 0) {
        setError('מנהל ראשי כבר קיים במערכת');
        setLoading(false);
        return;
      }

      setStep(2);

      // Step 2: Create user account via Firebase Auth
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('שגיאה ביצירת החשבון');
      }

      const { userId } = await response.json();

      // Step 3: Create admin record
      await adminService.createFirstSuperAdmin(
        formData.email,
        formData.name,
        userId
      );

      setStep(3);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 3000);

    } catch (error: any) {
      setError(error.message || 'שגיאה לא צפויה');
      setStep(1);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCheck} className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            מנהל ראשי נוצר בהצלחה!
          </h1>
          <p className="text-gray-600 mb-6">
            החשבון שלך נוצר והגישה למערכת הניהול אושרה. אתה מועבר לדשבורד...
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faShieldAlt} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            הגדרת מנהל ראשי
          </h1>
          <p className="text-gray-600">
            צור את המנהל הראשי של הפלטפורמה
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-3 h-3 rounded-full ${
                stepNum <= step ? 'bg-teal-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <Card className="p-8">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <FontAwesomeIcon icon={faUserShield} className="w-8 h-8 text-teal-600 mb-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  פרטי המנהל הראשי
                </h2>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <Input
                name="name"
                type="text"
                label="שם מלא"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="הזן שם מלא"
              />

              <Input
                name="email"
                type="email"
                label="כתובת אימייל"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="admin@example.com"
              />

              <Input
                name="identityId"
                type="text"
                label="תעודת זהות"
                value={formData.identityId}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="123456789"
                maxLength={9}
                pattern="\\d{9}"
              />

              <Input
                name="password"
                type="password"
                label="סיסמה"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="בחר סיסמה חזקה"
                minLength={6}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
                className="rounded-xl"
              >
                {loading ? 'יוצר מנהל ראשי...' : 'צור מנהל ראשי'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="text-center py-8">
              <FontAwesomeIcon 
                icon={faSpinner} 
                className="w-8 h-8 text-teal-600 animate-spin mb-4" 
              />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                יוצר חשבון מנהל...
              </h2>
              <p className="text-gray-600">
                אנא המתן, החשבון נוצר ברקע
              </p>
            </div>
          )}
        </Card>

        {/* Warning */}
        <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">הערה חשובה</h3>
              <p className="text-sm text-yellow-700">
                המנהל הראשי יקבל את כל ההרשאות במערכת. שמור על פרטי ההתחברות במקום בטוח.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}