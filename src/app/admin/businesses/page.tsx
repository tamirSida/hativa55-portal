'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faTrash, 
  faEdit, 
  faEye,
  faToggleOn,
  faToggleOff,
  faSearch,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card } from '@/components/ui';
import { BusinessService } from '@/services/BusinessService';
import { Business } from '@/models/Business';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AdminBusinessesPage() {
  const { isAdmin } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadBusinesses();
    }
  }, [isAdmin]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const businessService = new BusinessService();
      const allBusinesses = await businessService.getAllBusinessesForAdmin();
      setBusinesses(allBusinesses);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return;

    setIsDeleting(true);
    try {
      const businessService = new BusinessService();
      await businessService.deleteBusiness(selectedBusiness.id);
      
      // Remove from local state
      setBusinesses(businesses.filter(b => b.id !== selectedBusiness.id));
      setShowDeleteModal(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert('שגיאה במחיקת העסק. נסה שוב.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (business: Business) => {
    try {
      const businessService = new BusinessService();
      await businessService.toggleBusinessStatus(business.id);
      
      // Update local state
      setBusinesses(businesses.map(b => 
        b.id === business.id 
          ? { ...b, isActive: !b.isActive } 
          : b
      ));
    } catch (error) {
      console.error('Failed to toggle business status:', error);
      alert('שגיאה בשינוי סטטוס העסק. נסה שוב.');
    }
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBuilding} className="w-8 h-8 text-teal-600" />
            <h1 className="text-2xl font-bold text-gray-900">ניהול עסקים</h1>
          </div>
          <div className="text-sm text-gray-600">
            {businesses.length} עסקים בסך הכל
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
            />
            <input
              type="text"
              placeholder="חיפוש עסקים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען עסקים...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {business.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          business.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {business.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                        {(!business.wazeUrl || !business.wazeUrl.trim()) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ללא Waze
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>בעלים:</strong> {business.ownerName}</p>
                      <p><strong>קטגוריה:</strong> {business.metadata?.category || 'לא צוין'}</p>
                      <p><strong>תיאור:</strong> {business.description.slice(0, 100)}...</p>
                      <p><strong>נוצר:</strong> {business.createdAt.toLocaleDateString('he-IL')}</p>
                      {business.metadata?.location && (
                        <p><strong>מיקום:</strong> {
                          business.metadata.location.coordinates 
                            ? `${business.metadata.location.coordinates.lat.toFixed(4)}, ${business.metadata.location.coordinates.lng.toFixed(4)}`
                            : 'לא זמין'
                        }</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/businesses/${business.id}`}>
                      <Button variant="outline" size="sm">
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4 ml-1" />
                        צפה
                      </Button>
                    </Link>
                    
                    <Link href={`/edit-business/${business.id}`}>
                      <Button variant="outline" size="sm">
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4 ml-1" />
                        ערוך
                      </Button>
                    </Link>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(business)}
                    >
                      <FontAwesomeIcon 
                        icon={business.isActive ? faToggleOff : faToggleOn} 
                        className="w-4 h-4 ml-1" 
                      />
                      {business.isActive ? 'השבת' : 'הפעל'}
                    </Button>

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
              </Card>
            ))}

            {filteredBusinesses.length === 0 && !loading && (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faBuilding} className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'לא נמצאו עסקים המתאימים לחיפוש' : 'אין עסקים במערכת'}
                </p>
              </div>
            )}
          </div>
        )}
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