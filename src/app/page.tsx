'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar, QuickSearch } from '@/components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faBriefcase, faUsers, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { Button, Card } from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';

export default function HomePage() {
  const { isAuthenticated } = useAuthContext();
  const { openAuthModal } = useAuthModal();
  
  const handleSearch = (query: string) => {
    console.log('Search:', query);
    // TODO: Implement search logic
  };

  const handleQuickSearch = (suggestion: string) => {
    console.log('Quick search:', suggestion);
    // TODO: Navigate to search results
  };

  const popularSearches = [
    'פיתוח תוכנה',
    'שיווק דיגיטלי',
    'עיצוב גרפי',
    'ייעוץ עסקי',
    'צילום',
    'מדעי המחשב'
  ];

  const featuredSections = [
    {
      icon: faBuilding,
      title: 'עסקים בקהילה',
      description: 'מצא עסקים מקומיים ואנשי מקצוע מהקהילה שלך',
      href: '/businesses',
      color: 'bg-teal-500'
    },
    {
      icon: faBriefcase,
      title: 'דרושים',
      description: 'חפש משרות או פרסם הזדמנויות תעסוקה',
      href: '/jobs',
      color: 'bg-emerald-500'
    },
    {
      icon: faGraduationCap,
      title: 'סביבת סטודנטים',
      description: 'מתחילים ללמוד? או כבר סטודנטים? התחברו לקהילת הלמידה',
      href: '/students',
      color: 'bg-indigo-500'
    },
    {
      icon: faUsers,
      title: 'מציאת מנטור',
      description: 'קבל או תן חונכות מקצועית לחברי הקהילה',
      href: '/mentors',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              ברוכים הבאים לקהילה
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              המקום לחבר בין אנשי מקצוע, עסקים, משרות והזדמנויות בקהילה הישראלית
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                placeholder="חפש עסקים, משרות, חנכים או כישורים..."
                onSearch={handleSearch}
                size="lg"
              />
            </div>

            {/* Quick Search */}
            <QuickSearch
              suggestions={popularSearches}
              onSuggestionClick={handleQuickSearch}
              className="max-w-4xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              מה תוכל למצוא כאן?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              גלה את כל מה שהקהילה שלנו מציעה - מעסקים מקומיים ועד הזדמנויות קריירה
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSections.map((section) => (
              <Card
                key={section.href}
                className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                clickable
                onClick={() => {
                  // TODO: Navigate to section
                  console.log('Navigate to:', section.href);
                }}
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
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            מוכן להתחיל?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            הצטרף לקהילה שלנו וגלה הזדמנויות חדשות, צור קשרים מקצועיים ותרום לקהילה
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
              >
                הרשם עכשיו
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // TODO: Navigate to about page
                console.log('Navigate to about');
              }}
            >
              למד עוד
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}