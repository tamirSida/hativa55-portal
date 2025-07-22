'use client';

import React from 'react';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faStar, faHandshake, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Card, Button } from '@/components/ui';

const mentors = [
  {
    id: '1',
    name: 'רחל לוי',
    expertise: 'פיתוח תוכנה',
    experience: '8 שנות ניסיון',
    company: 'Microsoft',
    mentees: 12,
    rating: 4.9,
    skills: ['React', 'Python', 'DevOps'],
    bio: 'מנהלת צוות פיתוח במיקרוסופט, מתמחה בפיתוח אפליקציות web ומנהיגות טכנית'
  },
  {
    id: '2', 
    name: 'יוסי כהן',
    expertise: 'עיצוב UX/UI',
    experience: '6 שנות ניסיון',
    company: 'Wix',
    mentees: 8,
    rating: 4.8,
    skills: ['Figma', 'User Research', 'Prototyping'],
    bio: 'מעצב ראשי ב-Wix, מתמחה בחקר משתמשים ועיצוב חוויית משתמש'
  },
  {
    id: '3',
    name: 'מיכל דוד',
    expertise: 'ניהול מוצר',
    experience: '10 שנות ניסיון',
    company: 'Meta',
    mentees: 15,
    rating: 5.0,
    skills: ['Strategy', 'Analytics', 'Leadership'],
    bio: 'מנהלת מוצר בכירה ב-Meta, מתמחה באסטרטגיית מוצר וניהול צוותים'
  }
];

const mentorshipPrograms = [
  {
    title: 'תוכנית חונכות למפתחים',
    duration: '3 חודשים',
    participants: 25,
    description: 'תוכנית מובנית למפתחים מתחילים עם מנטורים מנוסים'
  },
  {
    title: 'מסלול עיצוב דיגיטלי',
    duration: '4 חודשים',
    participants: 18,
    description: 'תוכנית מקיפה למעצבים צעירים בתחום ה-UX/UI'
  },
  {
    title: 'מנהיגות טכנולוגית',
    duration: '6 חודשים',
    participants: 12,
    description: 'תוכנית לפיתוח כישורי הנהגה וניהול בתחום הטכנולוגיה'
  }
];

function MentorsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            חונכות מקצועית
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            מצא מנטור מנוסה או הפוך למנטור ותרום לקהילה המקצועית
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg">
              <FontAwesomeIcon icon={faHandshake} className="w-5 h-5 ml-2" />
              בקש חונכות
            </Button>
            <Button variant="outline" size="lg">
              <FontAwesomeIcon icon={faUsers} className="w-5 h-5 ml-2" />
              הפוך למנטור
            </Button>
          </div>
        </div>

        {/* Featured Mentors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            מנטורים מומלצים
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {mentor.name}
                  </h3>
                  <p className="text-purple-600 font-medium text-sm">
                    {mentor.expertise}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {mentor.experience} • {mentor.company}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{mentor.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">דירוג</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{mentor.mentees}</p>
                    <p className="text-xs text-gray-500">מובילים</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mentor.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {mentor.bio}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    פנה למנטור
                  </Button>
                  <Button variant="outline" size="sm">
                    פרופיל
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Mentorship Programs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            תוכניות חונכות מובנות
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentorshipPrograms.map((program, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {program.title}
                </h3>
                <div className="flex items-center justify-center gap-4 mb-3 text-sm text-gray-500">
                  <span>{program.duration}</span>
                  <span>•</span>
                  <span>{program.participants} משתתפים</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {program.description}
                </p>
                <Button variant="outline" size="sm">
                  מידע נוסף
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            חונכות בקהילה במספרים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">95+</div>
              <div className="text-gray-600">מנטורים פעילים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">320+</div>
              <div className="text-gray-600">מובילים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
              <div className="text-gray-600">תוכניות פעילות</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
              <div className="text-gray-600">דירוג ממוצע</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(MentorsPage, { requireApproved: true });