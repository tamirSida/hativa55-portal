'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  faTags,
  faTrash,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { BusinessService } from '@/services/BusinessService';
import { Business } from '@/models/Business';

function ProfilePage() {
  const { user, firebaseUser } = useAuth();
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadUserBusinesses = async () => {
      if (!firebaseUser) return;
      
      setLoadingBusinesses(true);
      try {
        const businessService = new BusinessService();
        // Use firebaseUser.uid to match what add-business uses for ownerId
        const businesses = await businessService.getBusinessesByOwner(firebaseUser.uid);
        setUserBusinesses(businesses);
      } catch (error) {
        console.error('Error loading user businesses:', error);
      } finally {
        setLoadingBusinesses(false);
      }
    };

    loadUserBusinesses();
  }, [firebaseUser]);

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return;

    setIsDeleting(true);
    try {
      const businessService = new BusinessService();
      await businessService.deleteBusiness(selectedBusiness.id);
      
      // Remove from local state
      setUserBusinesses(userBusinesses.filter(b => b.id !== selectedBusiness.id));
      setShowDeleteModal(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert('שגיאה במחיקת העסק. נסה שוב.');
    } finally {
      setIsDeleting(false);
    }
  };

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

            {/* My Businesses */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  העסקים שלי
                </h2>
                <Link href="/add-business">
                  <Button variant="outline" size="sm">
                    <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 ml-2" />
                    הוסף עסק
                  </Button>
                </Link>
              </div>

              {loadingBusinesses ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">טוען עסקים...</p>
                </div>
              ) : userBusinesses.length > 0 ? (
                <div className="space-y-4">
                  {userBusinesses.map((business) => (
                    <div 
                      key={business.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Business Logo */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-teal-100 flex items-center justify-center flex-shrink-0">
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
                        
                        {/* Business Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {business.name}
                              </h3>
                              <p className="text-sm text-teal-600 mb-2">
                                {business.metadata?.category || 'עסק'}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {business.description}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 ml-4">
                              <Link href={`/businesses/${business.id}`}>
                                <Button variant="outline" size="sm">
                                  צפייה
                                </Button>
                              </Link>
                              <Link href={`/edit-business/${business.id}`}>
                                <Button variant="outline" size="sm">
                                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 ml-1" />
                                  עריכה
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedBusiness(business);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                              >
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4 ml-1" />
                                מחק
                              </Button>
                            </div>
                          </div>
                          
                          {/* Business Status */}
                          <div className="mt-3 flex items-center gap-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              business.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {business.isActive ? 'פעיל' : 'לא פעיל'}
                            </span>
                            
                            {business.serviceTags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">שירותים:</span>
                                <span className="text-xs text-gray-700">
                                  {business.serviceTags.slice(0, 2).join(', ')}
                                  {business.serviceTags.length > 2 && ` +${business.serviceTags.length - 2}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FontAwesomeIcon icon={faBuilding} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    אין לך עסקים רשומים
                  </h3>
                  <p className="text-gray-600 mb-4">
                    הוסף את העסק הראשון שלך לקהילה
                  </p>
                  <Link href="/add-business">
                    <Button variant="primary">
                      <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 ml-2" />
                      הוסף עסק
                    </Button>
                  </Link>
                </div>
              )}
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
                <Link href="/add-business" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 ml-2" />
                    הוסף עסק
                  </Button>
                </Link>
                <Link href="/profile/education" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4 ml-2" />
                    עדכן השכלה
                  </Button>
                </Link>
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
                    {userBusinesses.length}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">אישור מחיקה</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                האם אתה בטוח שברצונך למחוק את העסק:
              </p>
              <p className="font-semibold text-gray-900">
                "{selectedBusiness.name}"
              </p>
              <p className="text-sm text-red-600 mt-2">
                פעולה זו לא ניתנת לביטול!
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBusiness(null);
                }}
                disabled={isDeleting}
              >
                ביטול
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteBusiness}
                loading={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'מוחק...' : 'מחק'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ProfilePage, { requireApproved: true });