'use client';

import React, { useState } from 'react';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faGlobe, 
  faClock,
  faImage,
  faTags,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card } from '@/components/ui';
import { israeliCities } from '@/utils/israeliData';

interface BusinessFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  wazeUrl: string;
  openHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  serviceTags: string[];
}

const categories = [
  'מסעדנות ואוכל',
  'טכנולוgia ומחשבים',
  'עיצוב ואדריכלות',
  'שירותים משפטיים',
  'בריאות ורפואה',
  'יופי וטיפוח',
  'חינוך והדרכה',
  'בידור ותרבות',
  'ספורט וכושר',
  'שירותי בית',
  'רכב ותחבורה',
  'כספים וביטוח',
  'קניות ומסחר',
  'תיירות ונופש',
  'אחר'
];

const popularServices = [
  'משלוח עד הבית',
  'פרטות חנייה',
  'גישה לנכים',
  'אמצעי תשלום אלקטרוני',
  'שירות 24/7',
  'ייעוץ ללא תשלום',
  'אחריות מורחבת',
  'שירות ללקוחות VIP',
  'הזמנות מראש',
  'אירועים פרטיים'
];

const daysOfWeek = [
  { key: 'sunday', label: 'ראשון' },
  { key: 'monday', label: 'שני' },
  { key: 'tuesday', label: 'שלישי' },
  { key: 'wednesday', label: 'רביעי' },
  { key: 'thursday', label: 'חמישי' },
  { key: 'friday', label: 'שישי' },
  { key: 'saturday', label: 'שבת' }
];

function AddBusinessPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    wazeUrl: '',
    openHours: {
      sunday: { open: '09:00', close: '17:00', closed: false },
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '14:00', closed: false },
      saturday: { open: '00:00', close: '00:00', closed: true }
    },
    serviceTags: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTags: prev.serviceTags.includes(service)
        ? prev.serviceTags.filter(s => s !== service)
        : [...prev.serviceTags, service]
    }));
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      openHours: {
        ...prev.openHours,
        [day]: {
          ...prev.openHours[day],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'שם העסק נדרש';
      if (!formData.description.trim()) newErrors.description = 'תיאור העסק נדרש';
      if (!formData.category) newErrors.category = 'יש לבחור קטגוריה';
    } else if (step === 2) {
      if (!formData.phone.trim()) newErrors.phone = 'מספר טלפון נדרש';
      if (!formData.address.trim()) newErrors.address = 'כתובת נדרשת';
      if (!formData.city) newErrors.city = 'יש לבחור עיר';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        // TODO: Implement business creation logic
        console.log('Creating business:', formData);
        // Navigate to success page or business profile
      } catch (error) {
        console.error('Error creating business:', error);
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="row">
            <div className="col-xs-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FontAwesomeIcon icon={faBuilding} className="w-8 h-8 text-teal-600" />
                  <h1 className="text-3xl font-bold text-gray-900">הוספת עסק חדש</h1>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step < currentStep ? (
                          <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                        ) : (
                          step
                        )}
                      </div>
                      {step < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                          step < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center text-gray-600">
                  {currentStep === 1 && 'פרטים בסיסיים על העסק'}
                  {currentStep === 2 && 'פרטי קשר ומיקום'}
                  {currentStep === 3 && 'שעות פתיחה ושירותים'}
                  {currentStep === 4 && 'בדיקה אחרונה ושמירה'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="row">
          <div className="col-xs-12">
            <Card className="max-w-4xl mx-auto p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">פרטים בסיסיים</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        שם העסק *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="הכנס את שם העסק..."
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        קטגוריית העסק *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">בחר קטגוריה...</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        תיאור העסק *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[120px] ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="ספר קצת על העסק, השירותים והמוצרים..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">פרטי קשר ומיקום</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        טלפון *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="050-123-4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        אימייל
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="info@business.co.il"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אתר אינטרנט
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="https://www.business.co.il"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        עיר *
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">בחר עיר...</option>
                        {israeliCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        כתובת מדוייקת *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="רחוב ומספר בית"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      קישור Waze (אופציונאלי)
                    </label>
                    <input
                      type="url"
                      value={formData.wazeUrl}
                      onChange={(e) => handleInputChange('wazeUrl', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="https://waze.com/ul/..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      הוסף קישור Waze לניווט נוח יותר ללקוחות
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Hours & Services */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">שעות פתיחה ושירותים</h2>
                  
                  {/* Opening Hours */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-teal-600" />
                      שעות פתיחה
                    </h3>
                    <div className="space-y-3">
                      {daysOfWeek.map((day) => (
                        <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 text-sm font-medium text-gray-700">
                            {day.label}
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.openHours[day.key].closed}
                              onChange={(e) => handleHoursChange(day.key, 'closed', e.target.checked)}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600">סגור</span>
                          </label>
                          {!formData.openHours[day.key].closed && (
                            <>
                              <input
                                type="time"
                                value={formData.openHours[day.key].open}
                                onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                              <span className="text-gray-500">עד</span>
                              <input
                                type="time"
                                value={formData.openHours[day.key].close}
                                onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faTags} className="w-5 h-5 text-teal-600" />
                      שירותים מיוחדים
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">בחר את השירותים הרלוונטיים לעסק שלך</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {popularServices.map((service) => (
                        <label
                          key={service}
                          className={`bubble filter cursor-pointer text-center ${
                            formData.serviceTags.includes(service) ? 'active' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.serviceTags.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">בדיקה אחרונה</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">פרטי העסק</h3>
                        <p><strong>שם:</strong> {formData.name}</p>
                        <p><strong>קטגוריה:</strong> {formData.category}</p>
                        <p><strong>תיאור:</strong> {formData.description}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">פרטי קשר</h3>
                        <p><strong>טלפון:</strong> {formData.phone}</p>
                        {formData.email && <p><strong>אימייל:</strong> {formData.email}</p>}
                        {formData.website && <p><strong>אתר:</strong> {formData.website}</p>}
                        <p><strong>כתובת:</strong> {formData.address}, {formData.city}</p>
                      </div>
                    </div>

                    {formData.serviceTags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">שירותים</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.serviceTags.map((service) => (
                            <span
                              key={service}
                              className="bubble filter bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">לפני השליחה</p>
                        <p>אנא וודא שכל הפרטים נכונים. לאחר יצירת העסק, ניתן יהיה לערוך אותו בפרופיל שלך.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    חזור
                  </Button>
                )}
                
                <div className="mr-auto">
                  {currentStep < 4 ? (
                    <Button variant="primary" onClick={nextStep}>
                      המשך
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleSubmit}>
                      <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 ml-2" />
                      צור עסק
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AddBusinessPage, { requireApproved: true });