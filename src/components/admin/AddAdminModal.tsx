'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faEnvelope, faShield, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Card, Button, Input } from '@/components/ui';
import { AdminRole, Admin, ROLE_PERMISSIONS } from '@/models/Admin';
import { AdminService } from '@/services/AdminService';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminCreated: () => void;
  currentAdmin: Admin | null;
}

interface AddAdminForm {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: AdminRole;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({
  isOpen,
  onClose,
  onAdminCreated,
  currentAdmin
}) => {
  const [formData, setFormData] = useState<AddAdminForm>({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: AdminRole.MODERATOR
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const adminService = new AdminService();

  // Determine which roles the current admin can create
  const getAvailableRoles = (): AdminRole[] => {
    if (!currentAdmin) return [];
    
    switch (currentAdmin.role) {
      case AdminRole.SUPER_ADMIN:
        return [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR];
      case AdminRole.ADMIN:
        return [AdminRole.MODERATOR];
      case AdminRole.MODERATOR:
        return []; // Moderators cannot create admins
      default:
        return [];
    }
  };

  const getRoleDisplayName = (role: AdminRole): string => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return 'מנהל עליון';
      case AdminRole.ADMIN:
        return 'מנהל';
      case AdminRole.MODERATOR:
        return 'אחראי';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: AdminRole): string => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return 'גישה מלאה לכל המערכת כולל יצירת מנהלים נוספים';
      case AdminRole.ADMIN:
        return 'ניהול משתמשים ועסקים, יכול ליצור אחראים';
      case AdminRole.MODERATOR:
        return 'אישור ודחיה של משתמשים חדשים בלבד';
      default:
        return '';
    }
  };

  const availableRoles = getAvailableRoles();

  const handleInputChange = (field: keyof AddAdminForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('כתובת אימייל נדרשת');
      return false;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('כתובת אימייל לא תקינה');
      return false;
    }

    if (!formData.name.trim()) {
      setError('שם מלא נדרש');
      return false;
    }

    if (!formData.password) {
      setError('סיסמה נדרשת');
      return false;
    }

    if (formData.password.length < 6) {
      setError('סיסמה חייבת להכיל לפחות 6 תווים');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return false;
    }

    if (!availableRoles.includes(formData.role)) {
      setError('אין הרשאה ליצור מנהל מסוג זה');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Create Firebase Authentication user first
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה ביצירת חשבון המנהל');
      }

      const { userId } = await response.json();

      // Create Admin document
      await adminService.createAdmin(
        {
          userId,
          email: formData.email,
          name: formData.name,
          role: formData.role,
          permissions: ROLE_PERMISSIONS[formData.role],
          isActive: true
        },
        currentAdmin?.id || 'system'
      );

      // Reset form
      setFormData({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        role: AdminRole.MODERATOR
      });

      onAdminCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      setError(error.message || 'שגיאה ביצירת המנהל');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Check if current admin has permission to create admins
  if (!currentAdmin?.canManageAdmins()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
        <Card className="p-6 max-w-md mx-4">
          <div className="text-center">
            <FontAwesomeIcon icon={faShield} className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">אין הרשאה</h3>
            <p className="text-gray-600 mb-4">אין לך הרשאה ליצור מנהלים חדשים</p>
            <Button onClick={onClose} variant="primary">
              סגור
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <Card className="p-6 max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">הוסף מנהל חדש</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 ml-2" />
              כתובת אימייל
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="admin@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 ml-2" />
              שם מלא
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="שם המנהל החדש"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סיסמה
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="לפחות 6 תווים"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אישור סיסמה
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="הזן שוב את הסיסמה"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faShield} className="w-4 h-4 ml-2" />
              סוג מנהל
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as AdminRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={loading}
              required
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
            {formData.role && (
              <p className="text-sm text-gray-600 mt-2">
                {getRoleDescription(formData.role)}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'יוצר מנהל...' : 'צור מנהל חדש'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              ביטול
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};