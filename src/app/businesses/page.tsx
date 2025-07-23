'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faUserPlus,
  faSignInAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { BusinessService } from '@/services/BusinessService';
import { Business } from '@/models/Business';
import BusinessSearchFilters, { type SearchFilters } from '@/components/business/BusinessSearchFilters';
import BusinessMap from '@/components/business/BusinessMap';
import EnhancedBusinessCard from '@/components/business/EnhancedBusinessCard';
import { findBusinessesNearLocation, type EnhancedLocationData } from '@/utils/businessLocationEnhancer';

export default function BusinessesPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const isApproved = isAuthenticated && (isAdmin || (user && user.isApproved()));
  
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    textQuery: '',
    location: { type: 'none', radius: 25 },
    categories: [],
    tags: [],
    sortBy: 'name',
    viewMode: 'list'
  });

  // Load all businesses
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        console.log('Loading businesses - User status:', { 
          isAuthenticated, 
          isApproved, 
          isAdmin,
          userId: user?.id,
          userStatus: user?.status 
        });
        
        const businessService = new BusinessService();
        const allBusinesses = await businessService.getActiveBusinesses();
        console.log('Successfully loaded businesses:', allBusinesses.length);
        
        setAllBusinesses(allBusinesses);
      } catch (error) {
        console.error('Error loading businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinesses();
  }, [isAuthenticated, isApproved, isAdmin]);

  // Extract available categories and tags
  const { availableCategories, availableTags } = useMemo(() => {
    const categories = new Set<string>();
    const tags = new Set<string>();

    allBusinesses.forEach(business => {
      if (business.metadata?.category) {
        categories.add(business.metadata.category);
      }
      if (business.tags) {
        business.tags.forEach(tag => tags.add(tag));
      }
    });

    return {
      availableCategories: Array.from(categories).sort(),
      availableTags: Array.from(tags).sort()
    };
  }, [allBusinesses]);

  // Filter and sort businesses based on current filters
  const filteredBusinesses = useMemo(() => {
    let filtered = [...allBusinesses];

    // Text search
    if (filters.textQuery.trim()) {
      const query = filters.textQuery.toLowerCase();
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.description.toLowerCase().includes(query) ||
        business.metadata?.category?.toLowerCase().includes(query) ||
        business.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(business => 
        business.metadata?.category && filters.categories.includes(business.metadata.category)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(business => 
        business.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Location-based filtering
    if (filters.location.type !== 'none' && filters.location.coordinates) {
      const businessesWithDistance = findBusinessesNearLocation(
        filtered,
        filters.location.coordinates,
        filters.location.radius
      );
      filtered = businessesWithDistance;
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          if ('distance' in a && 'distance' in b) {
            return (a as any).distance - (b as any).distance;
          }
          return 0;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'he');
      }
    });

    return filtered;
  }, [allBusinesses, filters]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              טוען עסקים...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            עסקים מהקהילה
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            גלה עסקים מקומיים מחברי הקהילה שלנו, חפש לפי מיקום ותמוך בעסקים קטנים
          </p>
        </div>

        {/* Access Level Notice for Pending/Non-logged Users */}
        {!isApproved && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <p className="text-blue-700 mb-3">
                    משתמשים לא מאומתים יכולים לצפות בדף העסקים בלבד.
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
                          <Button size="sm" variant="outline" className="border-blue-300 text-blue-800">
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

        {/* Search and Filters */}
        <BusinessSearchFilters
          onFiltersChange={handleFiltersChange}
          availableCategories={availableCategories}
          availableTags={availableTags}
          businessesCount={filteredBusinesses.length}
          showMapToggle={true}
        />

        {/* Map View */}
        {filters.viewMode === 'map' && (
          <div className="mb-8">
            <BusinessMap
              businesses={filteredBusinesses}
              userLocation={filters.location.coordinates}
              height="500px"
              onBusinessClick={(business) => {
                window.open(`/businesses/${business.id}`, '_blank');
              }}
            />
          </div>
        )}

        {/* List View */}
        {filters.viewMode === 'list' && (
          <>
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBuilding} className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {filters.textQuery || filters.categories.length > 0 || filters.tags.length > 0 || filters.location.type !== 'none'
                    ? 'לא נמצאו עסקים התואמים לחיפוש'
                    : 'אין עסקים זמינים'
                  }
                </h3>
                {(filters.textQuery || filters.categories.length > 0 || filters.tags.length > 0 || filters.location.type !== 'none') && (
                  <p className="text-gray-600">נסה לשנות את פרמטרי החיפוש או לנקות את הסינון</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {filteredBusinesses.map((business) => (
                  <EnhancedBusinessCard
                    key={business.id}
                    business={business}
                    isApproved={isApproved}
                    showDistance={filters.location.type !== 'none'}
                    size="normal"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            הקהילה שלנו במספרים
          </h2>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">
              {allBusinesses.length}
            </div>
            <div className="text-gray-600">עסקים רשומים</div>
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