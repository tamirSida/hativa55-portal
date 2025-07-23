'use client';

import React, { useState } from 'react';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faMapMarkerAlt, 
  faGlobe, 
  faClock,
  faImage,
  faTags,
  faCheckCircle,
  faExclamationTriangle,
  faUpload,
  faTrash,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card } from '@/components/ui';
import { SERVICE_AREAS } from '@/utils/israeliData';
import { ClientCloudinaryService } from '@/services/ClientCloudinaryService';
import { BusinessService } from '@/services/BusinessService';
import { useAuth } from '@/hooks/useAuth';

interface BusinessFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  locationType: 'specific' | 'service-areas';
  wazeUrl: string;
  serviceAreas: string[];
  logoUrl: string;
  imageUrls: string[];
  openHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  serviceTags: string[];
  tags: string[];
}

const categories = [
  'מסעדנות ואוכל',
  'טכנולוגיה ומחשבים',
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
  'שירות 24 שעות',
  'ייעוץ ללא תשלום',
  'אחריות מורחבת',
  'שירות ללקוחות VIP',
  'הזמנות מראש',
  'אירועים פרטיים'
];

const popularTags = [
  'איכותי',
  'מהיר',
  'אמין',
  'מקצועי',
  'ידידותי',
  'חדשני',
  'זול',
  'יקר',
  'בוטיק',
  'משפחתי',
  'מקומי',
  'אורגני',
  'טבעוני',
  'כשר',
  'מומלץ',
  'פופולרי',
  'ייחודי',
  'אישי',
  'VIP',
  'פרימיום'
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
  const { user, firebaseUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const cloudinaryService = new ClientCloudinaryService();
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    locationType: 'specific',
    wazeUrl: '',
    serviceAreas: [],
    logoUrl: '',
    imageUrls: [],
    openHours: {
      sunday: { open: '09:00', close: '17:00', closed: false },
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '14:00', closed: false },
      saturday: { open: '00:00', close: '00:00', closed: true }
    },
    serviceTags: [],
    tags: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleServiceAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !firebaseUser) return;

    setUploadingLogo(true);
    setErrors(prev => ({ ...prev, logo: '' }));

    try {
      const result = await cloudinaryService.uploadImage({
        file,
        folder: 'community-platform/businesses/logos'
      });
      
      setFormData(prev => ({ ...prev, logoUrl: result.secureUrl }));
    } catch (error: unknown) {
      setErrors(prev => ({ ...prev, logo: error instanceof Error ? error.message : 'שגיאה בהעלאת הלוגו. נסה שוב.' }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !firebaseUser) return;

    const maxBusinessImages = 6;
    
    if (formData.imageUrls.length + files.length > maxBusinessImages) {
      setErrors(prev => ({ ...prev, images: `ניתן להעלות עד ${maxBusinessImages} תמונות עסק` }));
      return;
    }

    setUploadingImages(true);
    setErrors(prev => ({ ...prev, images: '' }));

    try {
      const uploadPromises = files.map(file => 
        cloudinaryService.uploadImage({
          file,
          folder: 'community-platform/businesses/gallery'
        })
      );
      
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(result => result.secureUrl);
      
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newImageUrls]
      }));
    } catch (error: unknown) {
      setErrors(prev => ({ ...prev, images: error instanceof Error ? error.message : 'שגיאה בהעלאת התמונות. נסה שוב.' }));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
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
      
      if (formData.locationType === 'specific') {
        if (!formData.wazeUrl.trim()) newErrors.wazeUrl = 'קישור Waze נדרש למיקום מדויק';
      } else if (formData.locationType === 'service-areas') {
        if (formData.serviceAreas.length === 0) newErrors.serviceAreas = 'יש לבחור לפחות אזור שירות אחד';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !firebaseUser) return;

    setUploadingImages(true); // Show loading state
    
    try {
      // Use BusinessService directly from client-side
      const businessService = new BusinessService();
      
      // Create business data for the model
      const businessData = {
        ownerId: firebaseUser.uid,
        ownerName: user?.name || firebaseUser.displayName || 'שם לא זמין',
        name: formData.name,
        description: formData.description,
        serviceTags: formData.serviceTags || [],
        tags: formData.tags || [],
        jobPostings: [], // Required property
        isActive: true, // Required property
        // Add location data based on type
        ...(formData.locationType === 'specific' && formData.wazeUrl && { wazeUrl: formData.wazeUrl }),
        ...(formData.locationType === 'service-areas' && formData.serviceAreas?.length > 0 && { serviceAreas: formData.serviceAreas }),
        metadata: {
          category: formData.category,
          contactInfo: {
            phone: formData.phone,
            ...(formData.email && { email: formData.email }),
            ...(formData.website && { website: formData.website })
          },
          images: {
            ...(formData.logoUrl && { logoUrl: formData.logoUrl }),
            galleryUrls: formData.imageUrls || []
          },
          openHours: formData.openHours || {},
          locationType: formData.locationType
        }
      };

      const businessId = await businessService.createBusiness(businessData);

      // Update user's businessId field if user exists
      if (user) {
        try {
          const userService = new (await import('@/services/UserService')).UserService();
          await userService.updateUserProfile(user.id, { businessId });
        } catch (error) {
          console.error('Failed to link business to user profile:', error);
          // Don't fail the whole operation if user update fails
        }
      }

      // Success - redirect to business page or success page
      alert('העסק נוצר בהצלחה!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        phone: '',
        email: '',
        website: '',
        locationType: 'specific',
        wazeUrl: '',
        serviceAreas: [],
        logoUrl: '',
        imageUrls: [],
        openHours: {
          sunday: { open: '09:00', close: '17:00', closed: false },
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '14:00', closed: false },
          saturday: { open: '00:00', close: '00:00', closed: true }
        },
        serviceTags: [],
        tags: []
      });
      setCurrentStep(1);
      
    } catch (error: unknown) {
      console.error('Error creating business:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'שגיאה ביצירת העסק. נסה שוב.' 
      }));
    } finally {
      setUploadingImages(false);
    }
  };

  const getNameClass = () => {
    return `w-full px-3 py-3 sm:px-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base ${errors.name ? 'border-red-500' : 'border-gray-300'}`;
  };

  const getCategoryClass = () => {
    return `w-full px-3 py-3 sm:px-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base ${errors.category ? 'border-red-500' : 'border-gray-300'}`;
  };

  const getDescriptionClass = () => {
    return `w-full px-3 py-3 sm:px-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[120px] text-base resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`;
  };

  const getPhoneClass = () => {
    return `w-full px-3 py-3 sm:px-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base ${errors.phone ? 'border-red-500' : 'border-gray-300'}`;
  };

  const getWazeClass = () => {
    return `w-full px-3 py-3 sm:px-4 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base ${errors.wazeUrl ? 'border-red-500' : 'border-gray-300'}`;
  };

  const getLocationTypeClass = (type: string) => {
    const isActive = formData.locationType === type;
    return `cursor-pointer p-3 sm:p-4 border-2 rounded-lg transition-colors ${isActive ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`;
  };

  const getServiceAreaClass = (area: string) => {
    const isActive = formData.serviceAreas.includes(area);
    return `bubble filter cursor-pointer text-center text-xs sm:text-sm py-2 px-3 ${isActive ? 'active' : ''}`;
  };

  const getCityClass = (city: string) => {
    const isActive = formData.serviceAreas.includes(city);
    return `bubble filter cursor-pointer text-center text-xs sm:text-sm py-2 px-2 sm:px-3 ${isActive ? 'active' : ''}`;
  };

  const getServiceClass = (service: string) => {
    const isActive = formData.serviceTags.includes(service);
    return `bubble filter cursor-pointer text-center ${isActive ? 'active' : ''}`;
  };

  const getTagClass = (tag: string) => {
    const isActive = formData.tags.includes(tag);
    return `bubble filter cursor-pointer text-center ${isActive ? 'active' : ''}`;
  };

  const getNavigationButtonClass = () => {
    const classes = [];
    if (currentStep > 1) {
      classes.push('order-1 sm:order-2');
    } else {
      classes.push('w-full');
    }
    if (currentStep === 1) {
      classes.push('sm:mr-auto');
    }
    return classes.join(' ');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 sm:py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">הוספת עסק חדש</h1>
            </div>
            
            <div className="block sm:hidden mb-4">
              <div className="flex justify-center items-center gap-1">
                <span className="text-sm font-medium text-teal-600">{currentStep}</span>
                <span className="text-sm text-gray-500">מתוך 5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center gap-1 lg:gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step < currentStep ? (
                      <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 lg:w-4 lg:h-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 5 && (
                    <div className={`w-8 lg:w-16 h-1 mx-1 lg:mx-2 ${
                      step < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center text-sm sm:text-base text-gray-600">
              {currentStep === 1 && 'פרטים בסיסיים על העסק'}
              {currentStep === 2 && 'פרטי קשר ומיקום'}
              {currentStep === 3 && 'תמונות ולוגו'}
              {currentStep === 4 && 'שעות פתיחה ושירותים'}
              {currentStep === 5 && 'בדיקה אחרונה ושמירה'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:py-8">
        <Card className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">פרטים בסיסיים</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם העסק *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={getNameClass()}
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
                    className={getCategoryClass()}
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
                    className={getDescriptionClass()}
                    placeholder="ספר קצת על העסק, השירותים והמוצרים..."
                    rows={4}
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

          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">פרטי קשר ומיקום</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    טלפון *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={getPhoneClass()}
                    placeholder="050-123-4567"
                    inputMode="tel"
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
                    className="w-full px-3 py-3 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                    placeholder="info@business.co.il"
                    inputMode="email"
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
                  className="w-full px-3 py-3 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                  placeholder="https://www.business.co.il"
                  inputMode="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  סוג מיקום *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label className={getLocationTypeClass('specific')}>
                    <input
                      type="radio"
                      name="locationType"
                      value="specific"
                      checked={formData.locationType === 'specific'}
                      onChange={(e) => handleInputChange('locationType', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">מיקום מדויק</h3>
                        <p className="text-xs sm:text-sm text-gray-600">כתובת ספציפית עם קישור Waze</p>
                      </div>
                    </div>
                  </label>

                  <label className={getLocationTypeClass('service-areas')}>
                    <input
                      type="radio"
                      name="locationType"
                      value="service-areas"
                      checked={formData.locationType === 'service-areas'}
                      onChange={(e) => handleInputChange('locationType', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">אזורי שירות</h3>
                        <p className="text-xs sm:text-sm text-gray-600">מספר עיירות או אזורים</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.locationType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    קישור Waze *
                  </label>
                  <input
                    type="url"
                    value={formData.wazeUrl}
                    onChange={(e) => handleInputChange('wazeUrl', e.target.value)}
                    className={getWazeClass()}
                    placeholder="https://waze.com/ul/..."
                    inputMode="url"
                  />
                  {errors.wazeUrl && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                      {errors.wazeUrl}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    העתק קישור Waze למיקום המדויק של העסק
                  </p>
                </div>
              )}

              {formData.locationType === 'service-areas' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    אזורי שירות *
                  </label>
                  <p className="text-sm text-gray-600 mb-4">בחר את האזורים בהם אתה מספק שירות</p>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">אזורים כלליים</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {SERVICE_AREAS.map((area) => (
                        <label
                          key={area}
                          className={getServiceAreaClass(area)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.serviceAreas.includes(area)}
                            onChange={() => handleServiceAreaToggle(area)}
                            className="sr-only"
                          />
                          {area}
                        </label>
                      ))}
                    </div>
                  </div>

                  {errors.serviceAreas && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                      {errors.serviceAreas}
                    </p>
                  )}
                  
                  {formData.serviceAreas.length > 0 && (
                    <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                      <p className="text-sm text-teal-800 mb-2">אזורי השירות שנבחרו:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.serviceAreas.map((area) => (
                          <span key={area} className="px-2 py-1 bg-teal-200 text-teal-900 rounded text-xs">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">תמונות ולוגו</h2>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faImage} className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  לוגו העסק
                </h3>
                <p className="text-sm text-gray-600 mb-4">העלה לוגו לעסק שלך (אופציונאלי)</p>
                
                {!formData.logoUrl ? (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                    <FontAwesomeIcon icon={faUpload} className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base text-gray-600">לחץ להעלאת לוגו או גרור קובץ לכאן</p>
                      <p className="text-xs sm:text-sm text-gray-400">PNG, JPG, GIF עד 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploadingLogo && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-teal-600">מעלה לוגו...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img 
                      src={formData.logoUrl} 
                      alt="Business Logo" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {errors.logo && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                    {errors.logo}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faImage} className="w-5 h-5 text-teal-600" />
                  תמונות העסק
                </h3>
                <p className="text-sm text-gray-600 mb-4">העלה תמונות של העסק, המוצרים או השירותים (עד 6 תמונות + לוגו)</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Business image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.imageUrls.length < 6 && (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center hover:border-teal-500 transition-colors cursor-pointer">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faPlus} className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">הוסף תמונה</p>
                        <p className="text-xs text-gray-400">{formData.imageUrls.length}/6</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesUpload}
                        disabled={uploadingImages}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {uploadingImages && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
                            <p className="text-xs text-teal-600">מעלה תמונות...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {errors.images && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                    {errors.images}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">שעות פתיחה ושירותים</h2>
              
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
                      className={getServiceClass(service)}
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

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTags} className="w-5 h-5 text-purple-600" />
                  תגיות חיפוש
                </h3>
                <p className="text-sm text-gray-600 mb-4">בחר תגיות שיעזרו לאנשים למצוא את העסק שלך בחיפוש</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {popularTags.map((tag) => (
                    <label
                      key={tag}
                      className={getTagClass(tag)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{tag}</span>
                    </label>
                  ))}
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800 mb-2">תגיות שנבחרו:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-purple-200 text-purple-900 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
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
                    <h3 className="font-semibold text-gray-800 mb-2">פרטי קשר ומיקום</h3>
                    <p><strong>טלפון:</strong> {formData.phone}</p>
                    {formData.email && <p><strong>אימייל:</strong> {formData.email}</p>}
                    {formData.website && <p><strong>אתר:</strong> {formData.website}</p>}
                    <p><strong>מיקום:</strong> {
                      formData.locationType === 'specific' 
                        ? 'מיקום מדויק (Waze)' 
                        : `אזורי שירות: ${formData.serviceAreas.join(', ')}`
                    }</p>
                  </div>
                </div>

                {(formData.logoUrl || formData.imageUrls.length > 0) && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">תמונות</h3>
                    <div className="space-y-3">
                      {formData.logoUrl && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">לוגו:</p>
                          <img 
                            src={formData.logoUrl} 
                            alt="Business Logo" 
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      )}
                      {formData.imageUrls.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">תמונות העסק ({formData.imageUrls.length}):</p>
                          <div className="grid grid-cols-4 gap-2">
                            {formData.imageUrls.map((imageUrl, index) => (
                              <img 
                                key={index}
                                src={imageUrl} 
                                alt={`Business image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                {formData.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">תגיות</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bubble filter bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
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

              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">שגיאה</p>
                      <p>{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 ml-2 rotate-180" />
                חזור
              </Button>
            )}
            
            <div className={getNavigationButtonClass()}>
              {currentStep < 5 ? (
                <Button 
                  variant="primary" 
                  onClick={nextStep}
                  className="w-full sm:w-auto"
                >
                  המשך
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2" />
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={handleSubmit}
                  disabled={uploadingImages}
                  className="w-full sm:w-auto"
                >
                  {uploadingImages ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                      יוצר עסק...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 ml-2" />
                      צור עסק
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(AddBusinessPage, { requireApproved: true });