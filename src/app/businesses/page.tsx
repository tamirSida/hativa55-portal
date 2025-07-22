'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope,
  faLock,
  faUserPlus,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

// Mock business data for pending/non-logged users
const sampleBusinesses = [
  {
    id: '1',
    name: 'קפה קהילה',
    description: 'בית קפה ומקום מפגש חמים במרכז תל אביב',
    category: 'מסעדנות ואוכל',
    city: 'תל אביב',
    owner: 'יואב כהן',
    isPublic: true
  },
  {
    id: '2', 
    name: 'אלרון שירותי מחשב',
    description: 'פתרונות טכנולוגיים לעסקים קטנים וגדולים',
    category: 'טכנולוגיה ומחשבים',
    city: 'הרצליה',
    owner: 'מיכל לוי',
    isPublic: true
  },
  {
    id: '3',
    name: 'סטודיו עיצוב נוי',
    description: 'עיצוב פנים ואדריכלות מקצועיים',
    category: 'עיצוב ואדריכלות', 
    city: 'רמת השרון',
    owner: 'דוד אברהמי',
    isPublic: true
  },
  {
    id: '4',
    name: 'משרד עורכי דין בר-אור',
    description: 'ייעוץ משפטי מקצועי בתחומי עסקים ונדל"ן',
    category: 'שירותים משפטיים',
    city: 'תל אביב',
    owner: 'עו"ד רחל בר-אור',
    isPublic: false // This will be hidden for non-approved users
  }
];

export default function BusinessesPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const isApproved = isAuthenticated && (isAdmin || (user && user.isApproved()));

  // Filter businesses based on approval status
  const visibleBusinesses = isApproved 
    ? sampleBusinesses 
    : sampleBusinesses.filter(business => business.isPublic);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {visibleBusinesses.map((business) => (
            <Card key={business.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                    {business.name}
                  </h3>
                  <p className="text-sm text-teal-600 mb-2 font-medium">
                    {business.category}
                  </p>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 ml-2" />
                      {business.city}
                    </div>
                    
                    {isApproved ? (
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <FontAwesomeIcon icon={faPhone} className="w-4 h-4 ml-2" />
                          050-123-4567
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 ml-2" />
                          contact@{business.name.replace(/\s+/g, '').toLowerCase()}.co.il
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          בעלים: {business.owner}
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
          ))}
        </div>

        {/* Add Business CTA - Only for approved users */}
        {isApproved && (
          <div className="text-center mb-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                יש לך עסק? הוסף אותו לקהילה!
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                הרחב את הרשת המקצועית שלך והגדל את החשיפה של העסק בקהילה שלנו
              </p>
              <Link href="/add-business">
                <Button variant="primary" size="lg">
                  <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 ml-2" />
                  הוסף עסק חדש
                </Button>
              </Link>
            </div>
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
                {isApproved ? "150+" : "50+"}
              </div>
              <div className="text-gray-600">עסקים רשומים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {isApproved ? "1,200+" : "400+"}
              </div>
              <div className="text-gray-600">חברי קהילה</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {isApproved ? "25+" : "10+"}
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