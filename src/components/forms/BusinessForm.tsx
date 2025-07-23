'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@/components/ui';
import { SERVICE_AREAS } from '@/utils/israeliData';
import { ClientCloudinaryService } from '@/services/ClientCloudinaryService';

export interface BusinessFormData {
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

export const businessCategories = [
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

interface BusinessFormProps {
  formData: BusinessFormData;
  onChange: (data: Partial<BusinessFormData>) => void;
  onValidationChange?: (isValid: boolean, errors: {[key: string]: string}) => void;
  showStep?: number; // For multi-step forms, null for single form
  mode?: 'full' | 'onboarding'; // Controls which features to show
}

export const BusinessForm: React.FC<BusinessFormProps> = ({
  formData,
  onChange,
  onValidationChange,
  showStep,
  mode = 'full'
}) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const cloudinaryService = new ClientCloudinaryService();

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
    const isValid = Object.keys(newErrors).length === 0;
    
    if (onValidationChange) {
      onValidationChange(isValid, newErrors);
    }
    
    return isValid;
  };

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleServiceAreaChange = (area: string) => {
    const isSelected = formData.serviceAreas.includes(area);
    const newAreas = isSelected 
      ? formData.serviceAreas.filter(a => a !== area)
      : [...formData.serviceAreas, area];
    
    handleChange('serviceAreas', newAreas);
  };

  const handleTagToggle = (tag: string, type: 'serviceTags' | 'tags') => {
    const currentTags = formData[type];
    const isSelected = currentTags.includes(tag);
    const newTags = isSelected 
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleChange(type, newTags);
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const uploadedUrl = await cloudinaryService.uploadImage(
        file, 
        'community-platform/businesses/logos'
      );
      handleChange('logoUrl', uploadedUrl);
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
    setUploadingLogo(false);
  };

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file =>
        cloudinaryService.uploadImage(file, 'community-platform/businesses/gallery')
      );
      
      const uploadedUrls = await Promise.all(uploadPromises);
      const newImageUrls = [...formData.imageUrls, ...uploadedUrls].slice(0, 6);
      handleChange('imageUrls', newImageUrls);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
    setUploadingImages(false);
  };

  const handleHourChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const newHours = {
      ...formData.openHours,
      [day]: {
        ...formData.openHours[day],
        [field]: value
      }
    };
    handleChange('openHours', newHours);
  };

  // Step 1: Basic Info
  if (showStep === 1 || (!showStep && mode === 'onboarding')) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="name"
            name="name"
            type="text"
            label="שם העסק *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="הזינו את שם העסק"
            error={errors.name}
          />
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              קטגוריה *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">בחר קטגוריה</option>
              {businessCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            תיאור העסק *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="תארו את העסק, השירותים שאתם מציעים ומה מייחד אתכם"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
    );
  }

  // Step 2: Contact & Location
  if (showStep === 2) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="phone"
            name="phone"
            type="tel"
            label="טלפון *"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            placeholder="050-1234567"
            error={errors.phone}
          />
          
          <Input
            id="email"
            name="email"
            type="email"
            label="אימייל"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="business@example.com"
          />
        </div>

        <Input
          id="website"
          name="website"
          type="url"
          label="אתר אינטרנט"
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
          placeholder="https://www.business.com"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            סוג מיקום *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="locationType"
                value="specific"
                checked={formData.locationType === 'specific'}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className="ml-2"
              />
              מיקום ספציפי
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="locationType"
                value="service-areas"
                checked={formData.locationType === 'service-areas'}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className="ml-2"
              />
              אזורי שירות
            </label>
          </div>
        </div>

        {formData.locationType === 'specific' && (
          <Input
            id="wazeUrl"
            name="wazeUrl"
            type="url"
            label="קישור Waze *"
            value={formData.wazeUrl}
            onChange={(e) => handleChange('wazeUrl', e.target.value)}
            required
            placeholder="https://waze.com/ul/..."
            error={errors.wazeUrl}
          />
        )}

        {formData.locationType === 'service-areas' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              אזורי שירות * (בחר לפחות אחד)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {SERVICE_AREAS.map(area => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.serviceAreas.includes(area)}
                    onChange={() => handleServiceAreaChange(area)}
                    className="ml-2"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
            {errors.serviceAreas && <p className="text-red-500 text-sm mt-1">{errors.serviceAreas}</p>}
          </div>
        )}
      </div>
    );
  }

  // Step 3: Images (only in full mode)
  if (showStep === 3 && mode === 'full') {
    return (
      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            לוגו העסק
          </label>
          {formData.logoUrl ? (
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={formData.logoUrl}
                alt="לוגו העסק"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleChange('logoUrl', '')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                className="hidden"
                id="logo-upload"
                disabled={uploadingLogo}
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <FontAwesomeIcon icon={faUpload} className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-600">
                  {uploadingLogo ? 'מעלה...' : 'לחץ להעלאת לוגו'}
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            תמונות העסק (עד 6 תמונות)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`תמונת עסק ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
                    handleChange('imageUrls', newUrls);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {formData.imageUrls.length < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="images-upload"
                  disabled={uploadingImages}
                />
                <label htmlFor="images-upload" className="cursor-pointer text-center">
                  <FontAwesomeIcon icon={faPlus} className="w-6 h-6 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-600">
                    {uploadingImages ? 'מעלה...' : 'הוסף תמונה'}
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Hours & Services (only in full mode)
  if (showStep === 4 && mode === 'full') {
    return (
      <div className="space-y-6">
        {/* Opening Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            שעות פתיחה
          </label>
          <div className="space-y-3">
            {daysOfWeek.map(day => (
              <div key={day.key} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium">{day.label}</div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!formData.openHours[day.key]?.closed}
                    onChange={(e) => handleHourChange(day.key, 'closed', !e.target.checked)}
                    className="ml-2"
                  />
                  פתוח
                </label>
                
                {!formData.openHours[day.key]?.closed && (
                  <>
                    <input
                      type="time"
                      value={formData.openHours[day.key]?.open || '09:00'}
                      onChange={(e) => handleHourChange(day.key, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg"
                    />
                    <span>עד</span>
                    <input
                      type="time"
                      value={formData.openHours[day.key]?.close || '17:00'}
                      onChange={(e) => handleHourChange(day.key, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Service Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            שירותים מיוחדים
          </label>
          <div className="flex flex-wrap gap-2">
            {popularServices.map(service => {
              const isActive = formData.serviceTags.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleTagToggle(service, 'serviceTags')}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                  }`}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            תגיות חיפוש
          </label>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => {
              const isActive = formData.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag, 'tags')}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Single form mode (onboarding)
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">פרטי העסק</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="name"
          name="name"
          type="text"
          label="שם העסק *"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          placeholder="הזינו את שם העסק"
          error={errors.name}
        />
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            קטגוריה *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">בחר קטגוריה</option>
            {businessCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          תיאור העסק *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder="תארו את העסק, השירותים שאתם מציעים ומה מייחד אתכם"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="טלפון עסק *"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          required
          placeholder="050-1234567"
          error={errors.phone}
        />
        
        <Input
          id="email"
          name="email"
          type="email"
          label="אימייל עסק"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="business@example.com"
        />
      </div>

      <Input
        id="website"
        name="website"
        type="url"
        label="אתר אינטרנט"
        value={formData.website}
        onChange={(e) => handleChange('website', e.target.value)}
        placeholder="https://www.business.com"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          סוג מיקום *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="locationType"
              value="specific"
              checked={formData.locationType === 'specific'}
              onChange={(e) => handleChange('locationType', e.target.value)}
              className="ml-2"
            />
            מיקום ספציפי
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="locationType"
              value="service-areas"
              checked={formData.locationType === 'service-areas'}
              onChange={(e) => handleChange('locationType', e.target.value)}
              className="ml-2"
            />
            אזורי שירות
          </label>
        </div>
      </div>

      {formData.locationType === 'specific' && (
        <Input
          id="wazeUrl"
          name="wazeUrl"
          type="url"
          label="קישור Waze *"
          value={formData.wazeUrl}
          onChange={(e) => handleChange('wazeUrl', e.target.value)}
          required
          placeholder="https://waze.com/ul/..."
          error={errors.wazeUrl}
        />
      )}

      {formData.locationType === 'service-areas' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            אזורי שירות * (בחר לפחות אחד)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {SERVICE_AREAS.map(area => (
              <label key={area} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.serviceAreas.includes(area)}
                  onChange={() => handleServiceAreaChange(area)}
                  className="ml-2"
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
          {errors.serviceAreas && <p className="text-red-500 text-sm mt-1">{errors.serviceAreas}</p>}
        </div>
      )}
    </div>
  );
};

export default BusinessForm;