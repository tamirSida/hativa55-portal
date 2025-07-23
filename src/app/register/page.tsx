'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faUser, 
  faIdCard, 
  faEye, 
  faEyeSlash,
  faArrowLeft,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ISRAELI_CITIES, GDUD_OPTIONS } from '@/utils/israeliData';

interface RegistrationData {
  // Step 1: Basics
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  identityId: string;
  
  // Step 2: Location & Background  
  phone: string;
  city: string;
  gdud: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, clearError } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    identityId: '',
    phone: '',
    city: '',
    gdud: ''
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.password && 
                 formData.confirmPassword && formData.identityId &&
                 formData.password === formData.confirmPassword &&
                 formData.identityId.length === 9 &&
                 /^\d{9}$/.test(formData.identityId));
      case 2:
        return !!(formData.phone && formData.city && formData.gdud);
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (currentStep === 2 && validateStep(2)) {
      // Complete registration after step 2
      await handleRegistration();
    } else if (validateStep(currentStep) && currentStep < 2) {
      clearError(); // Clear any existing errors when moving to next step
      setCurrentStep(currentStep + 1);
      // Scroll to top on mobile to prevent scrolling issues
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      clearError(); // Clear any existing errors when moving to previous step
      setCurrentStep(currentStep - 1);
      // Scroll to top on mobile to prevent scrolling issues
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRegistration = async () => {
    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        identityId: formData.identityId,
        phone: formData.phone,
        city: formData.city,
        gdud: formData.gdud,
        bio: ''
      });
      // Redirect to pending approval page
      router.push('/pending-approval');
    } catch (err) {
      // Error handled by context
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1 && validateStep(1)) {
      clearError();
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep(2)) {
      await handleRegistration();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">בואו נכיר</h2>
        <p className="text-gray-600">פרטים בסיסיים להתחלה</p>
      </div>

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
        placeholder="הזינו את שמכם המלא"
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="כתובת אימייל"
        value={formData.email}
        onChange={handleChange}
        icon={faEnvelope}
        iconPosition="left"
        required
        placeholder="your@email.com"
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
        placeholder="123456789"
        maxLength={9}
        inputMode="numeric"
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
          placeholder="בחרו סיסמה חזקה"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute left-3 top-9 text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="אימות סיסמה"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={faLock}
          iconPosition="left"
          required
          placeholder="הזינו שוב את הסיסמה"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute left-3 top-9 text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="w-5 h-5" />
        </button>
      </div>

      {formData.password !== formData.confirmPassword && formData.confirmPassword && (
        <p className="text-red-500 text-sm">הסיסמאות לא תואמות</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ספרו לנו עליכם</h2>
        <p className="text-gray-600">איפה אתם נמצאים ומה הרקע שלכם</p>
      </div>

      <Input
        id="phone"
        name="phone"
        type="tel"
        label="טלפון"
        value={formData.phone}
        onChange={handleChange}
        required
        placeholder="050-1234567"
      />

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          עיר מגורים
        </label>
        <select
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">בחרו עיר</option>
          {ISRAELI_CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="gdud" className="block text-sm font-medium text-gray-700 mb-2">
          גדוד/יחידה צבאית
        </label>
        <select
          id="gdud"
          name="gdud"
          value={formData.gdud}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">בחרו יחידה</option>
          {GDUD_OPTIONS.map(gdud => (
            <option key={gdud.value} value={gdud.value}>{gdud.label}</option>
          ))}
        </select>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo and Progress */}
        <div className="text-center mb-8">
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
          
          {/* Progress Bar */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600 text-sm">שלב {currentStep} מתוך 2</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  icon={faArrowRight}
                  iconPosition="right"
                  className="rounded-xl"
                >
                  חזרה
                </Button>
              )}

              <div className="mr-auto flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={!validateStep(currentStep)}
                  icon={currentStep === 2 ? undefined : faArrowLeft}
                  iconPosition="left"
                  className="rounded-xl"
                >
                  {isSubmitting ? (currentStep === 2 ? 'נרשם...' : 'טוען...') : (currentStep === 2 ? 'הרשמה' : 'המשך')}
                </Button>
              </div>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              כבר יש לכם חשבון?{' '}
              <Link 
                href="/login" 
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
              >
                התחברו כאן
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-teal-600 hover:text-teal-700 text-sm hover:underline"
          >
            ← חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}