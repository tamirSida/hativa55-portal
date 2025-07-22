'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar, QuickSearch } from '@/components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faBriefcase, faUsers, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const isApproved = isAuthenticated && (isAdmin || (user && user.isApproved()));
  
  const handleSearch = (query: string) => {
    console.log('Search:', query);
    // TODO: Implement search logic
  };

  const handleQuickSearch = (suggestion: string) => {
    console.log('Quick search:', suggestion);
    // TODO: Navigate to search results
  };

  // Different search suggestions based on approval status
  const approvedSearches = [
    'פיתוח תוכנה',
    'שיווק דיגיטלי',
    'עיצוב גרפי',
    'ייעוץ עסקי',
    'צילום',
    'מדעי המחשב'
  ];

  const publicSearches = [
    'עסקים בתל אביב',
    'שירותי עיצוב',
    'פיתוח אתרים',
    'ייעוץ משפטי'
  ];

  // All sections for approved users
  const allSections = [
    {
      icon: faBuilding,
      title: 'עסקים בקהילה',
      description: 'מצא עסקים מקומיים ואנשי מקצוע מהקהילה שלך',
      href: '/businesses',
      color: 'bg-teal-500',
      public: true
    },
    {
      icon: faBriefcase,
      title: 'דרושים',
      description: 'חפש משרות או פרסם הזדמנויות תעסוקה',
      href: '/jobs',
      color: 'bg-emerald-500',
      public: false
    },
    {
      icon: faGraduationCap,
      title: 'סביבת סטודנטים',
      description: 'מתחילים ללמוד? או כבר סטודנטים? התחברו לקהילת הלמידה',
      href: '/students',
      color: 'bg-indigo-500',
      public: false
    },
    {
      icon: faUsers,
      title: 'מציאת מנטור',
      description: 'קבל או תן חונכות מקצועית לחברי הקהילה',
      href: '/mentors',
      color: 'bg-purple-500',
      public: false
    }
  ];

  const featuredSections = isApproved ? allSections : allSections.filter(section => section.public);
  const popularSearches = isApproved ? approvedSearches : publicSearches;

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-white">
              ברוכים הבאים לקהילה
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              {isApproved 
                ? "המקום לחבר בין אנשי מקצוע, עסקים, משרות והזדמנויות בקהילה הישראלית"
                : "גלה עסקים ואנשי מקצוע מהקהילה הישראלית - הצטרף אלינו כדי לקבל גישה מלאה"
              }
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-4 sm:mb-8">
              <SearchBar
                placeholder="חפש עסקים, משרות, חנכים או כישורים..."
                onSearch={handleSearch}
                size="lg"
              />
            </div>

            {/* Quick Search - Hidden on Mobile */}
            <div className="hidden sm:block">
              <QuickSearch
                suggestions={popularSearches}
                onSuggestionClick={handleQuickSearch}
                className="max-w-4xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section - for pending/non-logged users */}
      {!isApproved && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                אודות הקהילה
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  אנו קהילה ישראלית המחברת בין אנשי מקצוע, עסקים קטנים וחברים לשעבר מהצבא. 
                  המטרה שלנו היא ליצור רשת חזקה של תמיכה הדדית, שיתוף ידע והזדמנויות עסקיות.
                </p>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">רשת מקצועית</h3>
                    <p className="text-gray-600">התחבר לאנשי מקצוע מהתחום שלך ומתחומים נוספים</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faBuilding} className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">עסקים מקומיים</h3>
                    <p className="text-gray-600">גלה ותמוך בעסקים מקומיים מהקהילה</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faGraduationCap} className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">פיתוח מקצועי</h3>
                    <p className="text-gray-600">קבל חונכות ושתף ידע עם חברי הקהילה</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isApproved ? "מה תוכל למצוא כאן?" : "עסקים מהקהילה"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {isApproved 
                ? "גלה את כל מה שהקהילה שלנו מציעה - מעסקים מקומיים ועד הזדמנויות קריירה"
                : "גלה עסקים ושירותים מקומיים מחברי הקהילה שלנו"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSections.map((section) => (
              <Link key={section.href} href={section.href}>
                <Card
                  className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  clickable
                >
                  <div className={`w-16 h-16 ${section.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <FontAwesomeIcon 
                      icon={section.icon} 
                      className="w-8 h-8 text-white"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {section.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isApproved ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                מוכן לקחת חלק פעיל?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                עדכן את הפרופיל שלך, חבר לעסקים וקבל חונכות מהקהילה
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/profile">
                  <Button
                    variant="primary"
                    size="lg"
                  >
                    עדכן פרופיל
                  </Button>
                </Link>
                <Link href="/businesses">
                  <Button
                    variant="outline"
                    size="lg"
                  >
                    גלה עסקים
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isAuthenticated ? "חשבונך ממתין לאישור" : "מוכן להצטרף?"}
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {isAuthenticated 
                  ? "ברגע שהחשבון יאושר תקבל גישה מלאה לכל התכונות של הקהילה"
                  : "הצטרף לקהילה שלנו וגלה הזדמנויות חדשות, צור קשרים מקצועיים ותרום לקהילה"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated ? (
                  <>
                    <Link href="/register">
                      <Button
                        variant="primary"
                        size="lg"
                      >
                        הרשם עכשיו
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="lg"
                      >
                        התחבר
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/pending-approval">
                    <Button
                      variant="primary"
                      size="lg"
                    >
                      צפה בסטטוס
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}