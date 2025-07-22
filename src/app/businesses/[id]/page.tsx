'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faEnvelope, 
  faGlobe, 
  faMapMarkerAlt, 
  faArrowRight, 
  faClock,
  faTag,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { BusinessService } from '@/services/BusinessService';
import { Business } from '@/models/Business';
import { Button } from '@/components/ui';

interface BusinessPageProps {}

const BusinessPage: React.FC<BusinessPageProps> = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBusiness = async () => {
      if (!id || typeof id !== 'string') {
        setError('מזהה עסק לא תקין');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const businessService = new BusinessService();
        const businessData = await businessService.getById(id);
        
        if (!businessData) {
          setError('העסק לא נמצא');
        } else {
          setBusiness(businessData);
        }
      } catch (err) {
        console.error('Error loading business:', err);
        setError('שגיאה בטעינת פרטי העסק');
      } finally {
        setIsLoading(false);
      }
    };

    loadBusiness();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען פרטי עסק...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <Link href="/businesses">
            <Button variant="primary">
              חזור לעסקים
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">העסק לא נמצא</h1>
          <Link href="/businesses">
            <Button variant="primary">
              חזור לעסקים
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const logoUrl = business.metadata?.images?.logoUrl;
  const contactInfo = business.metadata?.contactInfo;
  const openHours = business.metadata?.openHours;
  const galleryUrls = business.metadata?.images?.galleryUrls || [];

  const formatPhoneNumber = (phone: string) => {
    // Format Israeli phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('972')) {
      return `+${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    return phone;
  };

  const getCurrentDayStatus = () => {
    if (!openHours) return null;
    
    const today = new Date().getDay();
    
    // Check both Hebrew and English day names
    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const englishDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Determine which format is used in the data
    const hasEnglishKeys = englishDays.some(day => openHours[day]);
    const todayKey = hasEnglishKeys ? englishDays[today] : hebrewDays[today];
    
    const todayHours = openHours[todayKey];
    if (!todayHours || todayHours.closed) {
      return { status: 'סגור היום', color: 'text-red-600' };
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      return { status: `פתוח עד ${todayHours.close}`, color: 'text-green-600' };
    } else if (currentTime < openTime) {
      return { status: `פותח ב-${todayHours.open}`, color: 'text-yellow-600' };
    } else {
      return { status: 'סגור כעת', color: 'text-red-600' };
    }
  };

  const dayStatus = getCurrentDayStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/businesses" 
            className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 ml-2" />
            <span>חזור לרשימת עסקים</span>
          </Link>
        </div>
      </div>

      {/* Business Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logoUrl ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <Image
                    src={logoUrl}
                    alt={`לוגו ${business.name}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FontAwesomeIcon icon={faBuilding} className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {business.name}
              </h1>
              
              {business.metadata?.category && (
                <div className="flex items-center mb-3">
                  <FontAwesomeIcon icon={faTag} className="w-4 h-4 text-gray-500 ml-2" />
                  <span className="text-gray-600">{business.metadata.category}</span>
                </div>
              )}

              {/* Business Status */}
              {dayStatus && (
                <div className="flex items-center mb-3">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-500 ml-2" />
                  <span className={`font-medium ${dayStatus.color}`}>
                    {dayStatus.status}
                  </span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {contactInfo?.phone && (
                  <a
                    href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <FontAwesomeIcon icon={faPhone} className="w-4 h-4 ml-2" />
                    {formatPhoneNumber(contactInfo.phone)}
                  </a>
                )}

                {contactInfo?.website && (
                  <a
                    href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 ml-2" />
                    אתר אינטרנט
                  </a>
                )}

                {business.wazeUrl && (
                  <a
                    href={business.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 ml-2" />
                    נווט ב-Waze
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">אודות העסק</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {business.description}
              </p>
            </div>

            {/* Service Tags */}
            {business.serviceTags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">שירותים</h2>
                <div className="flex flex-wrap gap-2">
                  {business.serviceTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {business.serviceAreas && business.serviceAreas.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">אזורי שירות</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {business.serviceAreas.map((area, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm text-center"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {galleryUrls.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">גלריה</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={url}
                        alt={`תמונה ${index + 1} של ${business.name}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Hours */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">פרטי התקשרות</h2>
              <div className="space-y-4">
                {contactInfo?.phone && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-gray-400 ml-3" />
                    <a
                      href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {formatPhoneNumber(contactInfo.phone)}
                    </a>
                  </div>
                )}

                {contactInfo?.email && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-400 ml-3" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}

                {contactInfo?.website && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faGlobe} className="w-5 h-5 text-gray-400 ml-3" />
                    <a
                      href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {contactInfo.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            {openHours && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">שעות פעילות</h2>
                <div className="space-y-2">
                  {Object.keys(openHours).length > 0 ? (
                    (() => {
                      // Create day mapping for both Hebrew and English
                      const dayMap: Record<string, string> = {
                        'sunday': 'ראשון',
                        'monday': 'שני', 
                        'tuesday': 'שלישי',
                        'wednesday': 'רביעי',
                        'thursday': 'חמישי',
                        'friday': 'שישי',
                        'saturday': 'שבת',
                        'ראשון': 'ראשון',
                        'שני': 'שני',
                        'שלישי': 'שלישי',
                        'רביעי': 'רביעי',
                        'חמישי': 'חמישי',
                        'שישי': 'שישי',
                        'שבת': 'שבת'
                      };
                      
                      // Order days correctly
                      const orderedDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                      const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                      
                      // Check if data uses English or Hebrew keys
                      const hasEnglishKeys = orderedDays.some(day => openHours[day]);
                      const daysToUse = hasEnglishKeys ? orderedDays : hebrewDays;
                      
                      return daysToUse
                        .filter(day => openHours[day])
                        .map((day) => {
                          const hours = openHours[day];
                          const today = new Date().getDay();
                          const isToday = (hasEnglishKeys ? orderedDays[today] === day : hebrewDays[today] === day);
                          const displayName = dayMap[day] || day;
                          
                          return (
                            <div key={day} className={`flex justify-between items-center py-1 ${isToday ? 'bg-teal-50 px-2 rounded' : ''}`}>
                              <span className={`font-medium ${isToday ? 'text-teal-800' : 'text-gray-700'}`}>
                                {displayName}
                              </span>
                              <span className={`${isToday ? 'text-teal-700 font-medium' : 'text-gray-600'}`}>
                                {hours.closed ? 'סגור' : `${hours.open} - ${hours.close}`}
                              </span>
                            </div>
                          );
                        });
                    })()
                  ) : (
                    <p className="text-gray-500">שעות פעילות לא זמינות</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;