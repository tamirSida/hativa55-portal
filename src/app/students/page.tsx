'use client';

import React from 'react';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faBook, faUsers, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { Card, Button } from '@/components/ui';

const resources = [
  {
    title: 'ספרייה דיגיטלית',
    description: 'מאגר של ספרים וחומרי לימוד בתחומי הטכנולוגיה',
    icon: faBook,
    color: 'bg-blue-500'
  },
  {
    title: 'קבוצות לימוד',
    description: 'הצטרף לקבוצות לימוד ושיתוף ידע עם סטודנטים אחרים',
    icon: faUsers,
    color: 'bg-green-500'
  },
  {
    title: 'פרויקטים משותפים',
    description: 'מצא שותפים לפרויקטים אקדמיים ואישיים',
    icon: faLightbulb,
    color: 'bg-purple-500'
  }
];

function StudentsPage() {
  // TODO: Load real study groups from Firestore
  const studyGroups: any[] = [];
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            סביבת הסטודנטים
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            מקום למידה וקהילה לסטודנטים בתחומי הטכנולוגיה והעסקים
          </p>
        </div>

        {/* Resources Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            משאבי לימוד
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`w-16 h-16 ${resource.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <FontAwesomeIcon icon={resource.icon} className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {resource.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Study Groups */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              קבוצות לימוד פעילות
            </h2>
            <Button variant="primary" size="lg">
              <FontAwesomeIcon icon={faUsers} className="w-5 h-5 ml-2" />
              צור קבוצה חדשה
            </Button>
          </div>
          
          {studyGroups.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                אין קבוצות לימוד פעילות עדיין
              </h3>
              <p className="text-gray-600 mb-6">
                היה הראשון ליצור קבוצת לימוד בקהילה
              </p>
              <Button variant="primary">
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 ml-2" />
                צור קבוצה ראשונה
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {studyGroups.map((group) => (
                <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faGraduationCap} className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {group.name}
                      </h3>
                      <p className="text-sm text-indigo-600">
                        {group.members} חברים
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      נושא: {group.topic}
                    </p>
                    <p className="text-sm text-gray-500">
                      מפגש הבא: {group.nextMeeting}
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      הצטרף
                    </Button>
                    <Button variant="outline" size="sm">
                      פרטים
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            הקהילה הסטודנטיאלית במספרים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">-</div>
              <div className="text-gray-600">סטודנטים פעילים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">{studyGroups.length}</div>
              <div className="text-gray-600">קבוצות לימוד</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">-</div>
              <div className="text-gray-600">פרויקטים משותפים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">-</div>
              <div className="text-gray-600">מוסדות לימוד</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(StudentsPage, { requireApproved: true });