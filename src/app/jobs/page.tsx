'use client';

import React from 'react';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMapMarkerAlt, faCalendarAlt, faShekelSign } from '@fortawesome/free-solid-svg-icons';
import { Card, Button } from '@/components/ui';

const mockJobs = [
  {
    id: '1',
    title: 'מפתח Full Stack',
    company: 'טכנולוגיות אלפא',
    location: 'תל אביב',
    salary: '15,000 - 20,000 ₪',
    type: 'משרה מלאה',
    postedAt: 'לפני 2 ימים',
    description: 'מחפשים מפתח Full Stack מנוסה עם ידע ב-React ו-Node.js'
  },
  {
    id: '2',
    title: 'מעצב UX/UI',
    company: 'סטודיו עיצוב',
    location: 'הרצליה',
    salary: '12,000 - 16,000 ₪',
    type: 'משרה מלאה',
    postedAt: 'לפני 5 ימים',
    description: 'מחפשים מעצב UX/UI יצירתי עם ניסיון בעיצוב אפליקציות'
  },
  {
    id: '3',
    title: 'מנהל פרויקטים',
    company: 'חברת ייעוץ',
    location: 'רמת גן',
    salary: '18,000 - 25,000 ₪',
    type: 'משרה מלאה',
    postedAt: 'לפני שבוע',
    description: 'מחפשים מנהל פרויקטים מנוסה לניהול פרויקטים טכנולוגיים'
  }
];

function JobsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            דרושים מהקהילה
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            מצא משרות חלומותיך או פרסם משרה חדשה מחברי הקהילה שלנו
          </p>
        </div>

        {/* Post Job Button */}
        <div className="text-center mb-8">
          <Button variant="primary" size="lg">
            <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 ml-2" />
            פרסם משרה חדשה
          </Button>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockJobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <FontAwesomeIcon icon={faBriefcase} className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-emerald-600 font-medium">
                      {job.company}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {job.type}
                </span>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {job.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 ml-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FontAwesomeIcon icon={faShekelSign} className="w-4 h-4 ml-2" />
                  {job.salary}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 ml-2" />
                  {job.postedAt}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" size="sm" className="flex-1">
                  פרטים נוספים
                </Button>
                <Button variant="outline" size="sm">
                  שמור
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            סטטיסטיקות תעסוקה
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">85+</div>
              <div className="text-gray-600">משרות פעילות</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">450+</div>
              <div className="text-gray-600">מועמדים רשומים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">120+</div>
              <div className="text-gray-600">השמות מוצלחות</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(JobsPage, { requireApproved: true });