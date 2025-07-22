'use client';

import React from 'react';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEdit, 
  faMapMarkerAlt, 
  faPhone,
  faEnvelope,
  faBuilding,
  faGraduationCap,
  faTags
} from '@fortawesome/free-solid-svg-icons';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.name}
          </h1>
          <p className="text-gray-600">
            חבר קהילה • {user.city && `${user.city} • `}
            {user.gdud && `גדוד ${user.gdud}`}
          </p>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  פרטים אישיים
                </h2>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 ml-2" />
                  עריכה
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">אימייל</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">טלפון</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.city && (
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">עיר מגורים</p>
                      <p className="font-medium">{user.city}</p>
                    </div>
                  </div>
                )}
                
                {user.gdud && (
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">גדוד</p>
                      <p className="font-medium">גדוד {user.gdud}</p>
                    </div>
                  </div>
                )}
              </div>

              {user.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אודות</h3>
                  <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                </div>
              )}
            </Card>

            {/* Interests & Skills */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  תחומי עניין וכישורים
                </h2>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 ml-2" />
                  עדכון
                </Button>
              </div>

              <div className="space-y-6">
                {/* Hobby Tags */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    תחביבים ותחומי עניין
                  </h3>
                  {user.hobbyTags && user.hobbyTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.hobbyTags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">לא הוגדרו תחביבים</p>
                  )}
                </div>

                {/* Mentor Tags */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    תחומי מנטורינג
                  </h3>
                  {user.mentorTags && user.mentorTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.mentorTags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">לא הוגדרו תחומי מנטורינג</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                סטטוס חשבון
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">סטטוס:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isApproved() 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.isApproved() ? 'מאושר' : 'ממתין לאישור'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">הצטרפות:</span>
                  <span className="text-sm font-medium">
                    {user.createdAt.toLocaleDateString('he-IL')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                פעולות מהירות
              </h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 ml-2" />
                  ערוך פרופיל
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 ml-2" />
                  הוסף עסק
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4 ml-2" />
                  עדכן השכלה
                </Button>
              </div>
            </Card>

            {/* Activity Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                פעילות בקהילה
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">עסקים:</span>
                  <span className="text-sm font-medium">
                    {user.businessId ? '1' : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">השכלה:</span>
                  <span className="text-sm font-medium">
                    {user.educationIds?.length || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">תגיות:</span>
                  <span className="text-sm font-medium">
                    {(user.hobbyTags?.length || 0) + (user.mentorTags?.length || 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage, { requireApproved: true });