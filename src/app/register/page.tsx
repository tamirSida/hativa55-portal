'use client';

import React, { useState } from 'react';
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
  faArrowRight,
  faBuilding,
  faGraduationCap,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card } from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';
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
  
  // Step 3: Profile
  hasBusiness: boolean;
  businessName: string;
  businessDescription: string;
  
  hasEducation: boolean;
  institutionName: string;
  degreeOrCertificate: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error } = useAuthContext();
  const router = useRouter();

  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    identityId: '',
    phone: '',
    city: '',
    gdud: '',
    hasBusiness: false,
    businessName: '',
    businessDescription: '',
    hasEducation: false,
    institutionName: '',
    degreeOrCertificate: ''
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
                 formData.identityId.length === 9);
      case 2:
        return !!(formData.phone && formData.city && formData.gdud);
      case 3:
        if (formData.hasBusiness) {
          return !!(formData.businessName && formData.businessDescription);
        }
        if (formData.hasEducation) {
          return !!(formData.institutionName && formData.degreeOrCertificate);
        }
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        identityId: formData.identityId,
        // We'll handle the additional data after basic registration
      });
      router.push('/'); // Will show pending approval screen
    } catch (err) {
      // Error handled by context
    }
    setIsSubmitting(false);
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
        pattern="\\d{9}"
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

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">מה המצב שלכם?</h2>
        <p className="text-gray-600">עסק או לימודים - ספרו לנו</p>
      </div>

      <Card className="p-6 border-2 hover:border-teal-300 transition-colors cursor-pointer" 
            onClick={() => setFormData({...formData, hasBusiness: !formData.hasBusiness})}>
        <div className="flex items-center gap-4">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            formData.hasBusiness ? 'bg-teal-600 border-teal-600' : 'border-gray-300'
          }`}>
            {formData.hasBusiness && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-white" />}
          </div>
          <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-teal-600" />
          <div>
            <h3 className="font-semibold text-gray-900">יש לי עסק</h3>
            <p className="text-gray-600 text-sm">אני בעל/ת עסק או עצמאי/ת</p>
          </div>
        </div>
      </Card>

      {formData.hasBusiness && (
        <div className="space-y-4 bg-teal-50 p-6 rounded-xl">
          <Input
            id="businessName"
            name="businessName"
            type="text"
            label="שם העסק"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="הזינו את שם העסק"
          />
          <div>
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-2">
              תיאור קצר של העסק
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="מה העסק שלכם עושה?"
            />
          </div>
        </div>
      )}

      <Card className="p-6 border-2 hover:border-teal-300 transition-colors cursor-pointer"
            onClick={() => setFormData({...formData, hasEducation: !formData.hasEducation})}>
        <div className="flex items-center gap-4">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            formData.hasEducation ? 'bg-teal-600 border-teal-600' : 'border-gray-300'
          }`}>
            {formData.hasEducation && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-white" />}
          </div>
          <FontAwesomeIcon icon={faGraduationCap} className="w-6 h-6 text-teal-600" />
          <div>
            <h3 className="font-semibold text-gray-900">לימודים</h3>
            <p className="text-gray-600 text-sm">אני לומד/ת או סיימתי לימודים</p>
          </div>
        </div>
      </Card>

      {formData.hasEducation && (
        <div className="space-y-4 bg-teal-50 p-6 rounded-xl">
          <Input
            id="institutionName"
            name="institutionName"
            type="text"
            label="מוסד לימודים"
            value={formData.institutionName}
            onChange={handleChange}
            required
            placeholder="אוניברסיטת תל אביב, קורסרה, וכו'"
          />
          <Input
            id="degreeOrCertificate"
            name="degreeOrCertificate"
            type="text"
            label="תואר/תעודה"
            value={formData.degreeOrCertificate}
            onChange={handleChange}
            required
            placeholder="תואר ראשון במדעי המחשב, קורס React, וכו'"
          />
        </div>
      )}
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
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600 text-sm">שלב {currentStep} מתוך 3</p>
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
            {currentStep === 3 && renderStep3()}

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

              <div className="mr-auto">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    icon={faArrowLeft}
                    iconPosition="left"
                    className="rounded-xl"
                  >
                    המשך
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={!validateStep(3)}
                    className="rounded-xl"
                  >
                    {isSubmitting ? 'נרשם...' : 'הרשמה'}
                  </Button>
                )}
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