'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope,
  faClock,
  faRoute,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Card } from '@/components/ui';
import { Business } from '@/models/Business';
import { getLocationDisplayText } from '@/utils/wazeUtils';
import { GeocodingService } from '@/utils/geocodingUtils';

interface EnhancedBusinessCardProps {
  business: Business & { distance?: number };
  isApproved: boolean;
  showDistance?: boolean;
  size?: 'compact' | 'normal' | 'large';
}

export default function EnhancedBusinessCard({
  business,
  isApproved,
  showDistance = false,
  size = 'normal'
}: EnhancedBusinessCardProps) {
  // Get business status (open/closed)
  const getBusinessStatus = (business: Business) => {
    const openHours = business.metadata?.openHours;
    if (!openHours) return null;
    
    const today = new Date().getDay();
    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const englishDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    const hasEnglishKeys = englishDays.some(day => openHours[day]);
    const todayKey = hasEnglishKeys ? englishDays[today] : hebrewDays[today];
    
    const todayHours = openHours[todayKey];
    if (!todayHours || todayHours.closed) {
      return { status: 'סגור', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      const timeUntilClose = closeTime - currentTime;
      if (timeUntilClose <= 60) {
        return { 
          status: `סוגר בקרוב ${todayHours.close}`, 
          color: 'text-yellow-700', 
          bgColor: 'bg-yellow-50' 
        };
      }
      return { 
        status: `פתוח עד ${todayHours.close}`, 
        color: 'text-green-700', 
        bgColor: 'bg-green-50' 
      };
    } else if (currentTime < openTime) {
      return { 
        status: `פותח ב-${todayHours.open}`, 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50' 
      };
    } else {
      return { status: 'סגור', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
  };

  // Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^\d]/g, '').replace(/^0/, '972');
  };

  const status = getBusinessStatus(business);
  const sizeClasses = {
    compact: 'p-3',
    normal: 'p-4', 
    large: 'p-6'
  };

  const imageSize = {
    compact: { width: 8, height: 8 }, // w-8 h-8
    normal: { width: 10, height: 10 }, // w-10 h-10
    large: { width: 12, height: 12 } // w-12 h-12
  };

  return (
    <Card className={`${sizeClasses[size]} hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden`}>
      <Link href={`/businesses/${business.id}`} className="block">
        <div className="space-y-3">
          {/* Header with logo, title, and distance */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`w-${imageSize[size].width} h-${imageSize[size].height} rounded-lg overflow-hidden bg-teal-100 flex items-center justify-center flex-shrink-0`}>
                {business.metadata?.images?.logoUrl ? (
                  <Image
                    src={business.metadata.images.logoUrl}
                    alt={`לוגו ${business.name}`}
                    width={imageSize[size].width * 4}
                    height={imageSize[size].height * 4}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-teal-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`${size === 'large' ? 'text-xl' : 'text-lg'} font-semibold text-gray-900 mb-1 truncate group-hover:text-teal-600 transition-colors`}>
                  {business.name}
                </h3>
                <p className="text-xs text-teal-600 font-medium">
                  {business.metadata?.category || 'עסק'}
                </p>
              </div>
            </div>

            {/* Distance Badge */}
            {showDistance && business.distance !== undefined && (
              <div className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
                {GeocodingService.formatDistance(business.distance)}
              </div>
            )}
          </div>

          {/* Status and Location Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Status */}
            {status && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}>
                <FontAwesomeIcon icon={faClock} className="w-3 h-3 ml-1" />
                {status.status}
              </div>
            )}

            {/* Location */}
            <div className="flex items-center text-xs text-gray-500 flex-1 min-w-0">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 ml-1 flex-shrink-0" />
              <span className="truncate">
                {getLocationDisplayText(business.wazeUrl, business.serviceAreas)}
              </span>
            </div>
          </div>
          
          {/* Description */}
          <p className={`text-gray-600 text-sm ${size === 'compact' ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {business.description}
          </p>

          {/* Tags */}
          {business.tags && business.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {business.tags.slice(0, size === 'compact' ? 2 : 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {business.tags.length > (size === 'compact' ? 2 : 3) && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{business.tags.length - (size === 'compact' ? 2 : 3)}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons Overlay */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-1">
          {/* Navigation Button */}
          {business.wazeUrl && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(business.wazeUrl, '_blank');
              }}
              className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
              title="נווט עם Waze"
            >
              <FontAwesomeIcon icon={faRoute} className="w-3 h-3" />
            </button>
          )}

          {/* Quick Contact Buttons (for approved users) */}
          {isApproved && business.metadata?.contactInfo && (
            <>
              {business.metadata.contactInfo.phone && (
                <>
                  {/* Phone Call */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(`tel:${business.metadata!.contactInfo!.phone}`, '_self');
                    }}
                    className="p-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
                    title="התקשר"
                  >
                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const whatsappPhone = formatPhoneForWhatsApp(business.metadata!.contactInfo!.phone!);
                      window.open(`https://wa.me/${whatsappPhone}`, '_blank');
                    }}
                    className="p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
                    title="WhatsApp"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-3 h-3" />
                  </button>
                </>
              )}

              {/* Email */}
              {business.metadata.contactInfo.email && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(`mailto:${business.metadata!.contactInfo!.email}`, '_self');
                  }}
                  className="p-2 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors"
                  title="שלח מייל"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contact Info for Approved Users */}
      {isApproved && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="space-y-1">
            {business.metadata?.contactInfo?.phone && (
              <div className="flex items-center text-xs text-gray-500">
                <FontAwesomeIcon icon={faPhone} className="w-3 h-3 ml-1 flex-shrink-0" />
                <span className="truncate">{business.metadata.contactInfo.phone}</span>
              </div>
            )}
            {business.metadata?.contactInfo?.email && (
              <div className="flex items-center text-xs text-gray-500">
                <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 ml-1 flex-shrink-0" />
                <span className="truncate">{business.metadata.contactInfo.email}</span>
              </div>
            )}
            <p className="text-xs text-gray-400">
              בעלים: {business.ownerName}
            </p>
          </div>
        </div>
      )}

      {/* View Details Button */}
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Link
          href={`/businesses/${business.id}`}
          className="inline-flex items-center px-3 py-1 bg-teal-500 text-white text-xs rounded-md hover:bg-teal-600 transition-colors"
        >
          <span>פרטים</span>
          <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3 mr-1" />
        </Link>
      </div>
    </Card>
  );
}