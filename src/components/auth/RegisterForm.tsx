import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faUniversity, faBriefcase, faEye, faEyeSlash, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';
import { TagManager, TagCategory } from '@/models/Tag';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    identityId: '',
    password: '',
    confirmPassword: '',
    university: '',
    field: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { register, error, clearError } = useAuthContext();

  const universities = TagManager.getPredefinedTags(TagCategory.UNIVERSITY);
  const fields = TagManager.getPredefinedTags(TagCategory.FIELD);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      clearError();
    }
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'שם הוא שדה חובה';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'השם חייב להכיל לפחות 2 תווים';
    }

    if (!formData.email.trim()) {
      errors.email = 'אימייל הוא שדה חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'כתובת אימייל לא תקינה';
    }

    if (!formData.identityId.trim()) {
      errors.identityId = 'תעודת זהות היא שדה חובה';
    } else if (!/^\d{9}$/.test(formData.identityId.trim())) {
      errors.identityId = 'תעודת זהות חייבת להכיל 9 ספרות';
    }

    if (!formData.password) {
      errors.password = 'סיסמה היא שדה חובה';
    } else if (formData.password.length < 6) {
      errors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'אישור סיסמה הוא שדה חובה';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        identityId: formData.identityId.trim(),
        password: formData.password,
        university: formData.university || undefined,
        field: formData.field || undefined
      });
      onSuccess?.();
    } catch (error) {
      // Error is handled by the auth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.identityId && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          הרשמה
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            type="text"
            label="שם מלא"
            value={formData.name}
            onChange={handleChange}
            icon={faUser}
            iconPosition="left"
            required
            disabled={isSubmitting}
            placeholder="הכנס שם מלא"
            error={validationErrors.name}
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="אימייל"
            value={formData.email}
            onChange={handleChange}
            icon={faEnvelope}
            iconPosition="left"
            required
            autoComplete="email"
            disabled={isSubmitting}
            placeholder="example@email.com"
            error={validationErrors.email}
          />

          <Input
            id="identityId"
            name="identityId"
            type="text"
            label="תעודת זהות"
            value={formData.identityId}
            onChange={handleChange}
            icon={faIdCard}
            iconPosition="left"
            required
            disabled={isSubmitting}
            placeholder="123456789"
            maxLength={9}
            pattern="\d{9}"
            error={validationErrors.identityId}
            hint="תעודת הזהות תשמש לאימות זהות ואישור חשבון"
          />

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="סיסמה"
              value={formData.password}
              onChange={handleChange}
              icon={faLock}
              iconPosition="left"
              required
              autoComplete="new-password"
              disabled={isSubmitting}
              placeholder="הכנס סיסמה (לפחות 6 תווים)"
              error={validationErrors.password}
            />
            
            <button
              type="button"
              className="absolute left-8 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                className="w-4 h-4"
              />
            </button>
          </div>

          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="אישור סיסמה"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={faLock}
              iconPosition="left"
              required
              autoComplete="new-password"
              disabled={isSubmitting}
              placeholder="הכנס סיסמה שוב"
              error={validationErrors.confirmPassword}
            />
            
            <button
              type="button"
              className="absolute left-8 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon 
                icon={showConfirmPassword ? faEyeSlash : faEye} 
                className="w-4 h-4"
              />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">פרטים נוספים (אופציונלי)</p>
            
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                אוניברסיטה
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              >
                <option value="">בחר אוניברסיטה</option>
                {universities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">
                תחום לימודים/עבודה
              </label>
              <select
                id="field"
                name="field"
                value={formData.field}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              >
                <option value="">בחר תחום</option>
                {fields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
          >
            הרשם
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            כבר יש לך חשבון?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-500 font-medium"
              disabled={isSubmitting}
            >
              התחבר
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};