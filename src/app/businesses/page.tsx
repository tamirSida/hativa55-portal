'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope,
  faLock,
  faUserPlus,
  faSignInAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { BusinessService } from '@/services/BusinessService';
import { Business } from '@/models/Business';

export default function BusinessesPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const isApproved = isAuthenticated && (isAdmin || (user && user.isApproved()));
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBusinesses = async () => {
      if (!isApproved) {
        setIsLoading(false);
        return;
      }

      try {
        const businessService = new BusinessService();
        const allBusinesses = await businessService.getActiveBusinesses();
        setBusinesses(allBusinesses);
      } catch (error) {
        console.error('Error loading businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinesses();
  }, [isApproved]);

  const getBusinessStatus = (business: Business) => {
    const openHours = business.metadata?.openHours;
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
      return { status: 'סגור', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      // Check if closing within an hour
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

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            עסקים מהקהילה
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isApproved 
              ? "גלה עסקים מקומיים מחברי הקהילה שלנו, צור קשר ותמוך בעסקים קטנים"
              : "הכר עסקים נבחרים מהקהילה שלנו - הצטרף לקבלת גישה מלאה"
            }
          </p>
        </div>

        {/* Access Level Notice for Pending/Non-logged Users */}
        {!isApproved && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faLock} className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    תצוגה מוגבלת
                  </h3>
                  <p className="text-yellow-700 mb-3">
                    אתה רואה כעת רק חלק מהעסקים הרשומים בקהילה. 
                    {isAuthenticated 
                      ? " ברגע שהחשבון יאושר תקבל גישה לכל העסקים ופרטי קשר מלאים."
                      : " הצטרף לקהילה כדי לראות את כל העסקים ופרטי הקשר."
                    }
                  </p>
                  <div className="flex gap-3">
                    {!isAuthenticated ? (
                      <>
                        <Link href="/register">
                          <Button size="sm" variant="primary">
                            <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4 ml-2" />
                            הצטרף עכשיו
                          </Button>
                        </Link>
                        <Link href="/login">
                          <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800">
                            <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4 ml-2" />
                            התחבר
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link href="/pending-approval">
                        <Button size="sm" variant="primary">
                          בדוק סטטוס
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Businesses Grid */}
        {businesses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              אין עסקים זמינים
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {businesses.map((business) => (
              <Link key={business.id} href={`/businesses/${business.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-teal-100 flex items-center justify-center">
                      {business.metadata?.images?.logoUrl ? (
                        <Image
                          src={business.metadata.images.logoUrl}
                          alt={`לוגו ${business.name}`}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                        {business.name}
                      </h3>
                      <p className="text-sm text-teal-600 mb-2 font-medium">
                        {business.metadata?.category || 'עסק'}
                      </p>
                      
                      {(() => {
                        const status = getBusinessStatus(business);
                        return status ? (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${status.color} ${status.bgColor}`}>
                            <FontAwesomeIcon icon={faClock} className="w-3 h-3 ml-1" />
                            {status.status}
                          </div>
                        ) : null;
                      })()}
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {business.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 ml-2" />
                          {business.wazeUrl ? 'מיקום מדויק' : 
                           business.serviceAreas ? business.serviceAreas.slice(0, 2).join(', ') : 
                           'מיקום לא צוין'}
                        </div>
                        
                        {isApproved ? (
                          <div className="space-y-1">
                            {business.metadata?.contactInfo?.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <FontAwesomeIcon icon={faPhone} className="w-4 h-4 ml-2" />
                                {business.metadata.contactInfo.phone}
                              </div>
                            )}
                            {business.metadata?.contactInfo?.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 ml-2" />
                                {business.metadata.contactInfo.email}
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              בעלים: {business.ownerId}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 text-center">
                              פרטי קשר זמינים למשתמשים מאושרים בלבד
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}


        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            הקהילה שלנו במספרים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {businesses.length}
              </div>
              <div className="text-gray-600">עסקים רשומים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                -
              </div>
              <div className="text-gray-600">חברי קהילה</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                -
              </div>
              <div className="text-gray-600">תחומי התמחות</div>
            </div>
          </div>
          
          {!isApproved && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-4">
                רוצה לראות את כל העסקים והמספרים האמיתיים?
              </p>
              {!isAuthenticated ? (
                <Link href="/register">
                  <Button variant="primary" size="lg">
                    הצטרף לקהילה
                  </Button>
                </Link>
              ) : (
                <Link href="/pending-approval">
                  <Button variant="primary" size="lg">
                    בדוק סטטוס אישור
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}