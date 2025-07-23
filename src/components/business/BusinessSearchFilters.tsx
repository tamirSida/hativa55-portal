'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faMapMarkerAlt, 
  faLocationCrosshairs,
  faTimes,
  faFilter,
  faList,
  faMap
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { GeocodingService } from '@/utils/geocodingUtils';
import { getAvailableServiceAreas, type ServiceAreaName } from '@/utils/businessLocationEnhancer';

export interface SearchFilters {
  textQuery: string;
  location: {
    type: 'none' | 'near_me' | 'specific';
    coordinates?: { lat: number; lng: number };
    address?: string;
    radius: number; // km
  };
  categories: string[];
  tags: string[];
  sortBy: 'distance' | 'name' | 'newest';
  viewMode: 'list' | 'map';
}

interface BusinessSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableCategories: string[];
  availableTags: string[];
  businessesCount: number;
  showMapToggle?: boolean;
}

export default function BusinessSearchFilters({
  onFiltersChange,
  availableCategories,
  availableTags,
  businessesCount,
  showMapToggle = true
}: BusinessSearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    textQuery: '',
    location: {
      type: 'none',
      radius: 25
    },
    categories: [],
    tags: [],
    sortBy: 'name',
    viewMode: 'list'
  });

  const [locationInput, setLocationInput] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [geolocationSupported, setGeolocationSupported] = useState(false);

  const serviceAreas = getAvailableServiceAreas();

  // Check if geolocation is supported
  useEffect(() => {
    setGeolocationSupported('geolocation' in navigator);
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleTextSearch = (query: string) => {
    updateFilters({ textQuery: query });
  };

  const handleGetCurrentLocation = async () => {
    if (!geolocationSupported) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      updateFilters({
        location: {
          type: 'near_me',
          coordinates: { lat: latitude, lng: longitude },
          address: 'המיקום שלי',
          radius: filters.location.radius
        }
      });
      
      setLocationInput('המיקום שלי');
      
    } catch (error) {
      console.error('Error getting location:', error);
      alert('לא הצלחנו לקבל את המיקום שלך. אנא בדוק שנתת הרשאה למיקום.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationSearch = async (address: string) => {
    if (!address.trim()) {
      updateFilters({
        location: { type: 'none', radius: filters.location.radius }
      });
      return;
    }

    setLocationLoading(true);
    
    try {
      // First, check if it's a service area
      const serviceArea = serviceAreas.find(area => 
        area.name === address || area.displayName.includes(address)
      );
      
      if (serviceArea) {
        const { ISRAELI_SERVICE_AREAS } = await import('@/utils/businessLocationEnhancer');
        const areaData = ISRAELI_SERVICE_AREAS[serviceArea.name];
        
        updateFilters({
          location: {
            type: 'specific',
            coordinates: { lat: areaData.lat, lng: areaData.lng },
            address: serviceArea.displayName,
            radius: areaData.radius
          }
        });
      } else {
        // Geocode the address
        const result = await GeocodingService.geocodeAddress(address);
        
        if (result) {
          updateFilters({
            location: {
              type: 'specific',
              coordinates: result.coordinates,
              address: result.address,
              radius: filters.location.radius
            }
          });
        } else {
          alert('לא מצאנו את המיקום. נסה כתובת או עיר אחרת.');
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('שגיאה בחיפוש המיקום. נסה שוב.');
    } finally {
      setLocationLoading(false);
    }
  };

  const clearLocation = () => {
    updateFilters({
      location: { type: 'none', radius: filters.location.radius }
    });
    setLocationInput('');
  };

  const handleCategoryToggle = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories });
  };

  const handleTagToggle = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags });
  };

  const clearAllFilters = () => {
    setFilters({
      textQuery: '',
      location: { type: 'none', radius: 25 },
      categories: [],
      tags: [],
      sortBy: 'name',
      viewMode: filters.viewMode // Keep view mode
    });
    setLocationInput('');
  };

  const activeFiltersCount = [
    filters.textQuery,
    filters.location.type !== 'none' ? 1 : 0,
    filters.categories.length,
    filters.tags.length
  ].reduce((sum, count) => sum + (typeof count === 'number' ? count : count ? 1 : 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
      {/* Main Search Row */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 mb-4">
        {/* Text Search */}
        <div className="flex-1 relative">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" 
          />
          <input
            type="text"
            placeholder="חפש עסקים, שירותים..."
            value={filters.textQuery}
            onChange={(e) => handleTextSearch(e.target.value)}
            className="w-full pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Location Search */}
        <div className="flex-1 relative">
          <FontAwesomeIcon 
            icon={faMapMarkerAlt} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" 
          />
          <input
            type="text"
            placeholder="מיקום (תל אביב, גוש דן...)"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLocationSearch(locationInput);
              }
            }}
            className="w-full pl-12 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={locationLoading}
          />
          
          {/* Location Action Buttons */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
            {filters.location.type !== 'none' && (
              <button
                onClick={clearLocation}
                className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                title="נקה מיקום"
              >
                <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            
            {geolocationSupported && (
              <button
                onClick={handleGetCurrentLocation}
                disabled={locationLoading}
                className="p-1.5 sm:p-1 text-teal-500 hover:text-teal-600 transition-colors disabled:opacity-50 touch-manipulation"
                title="השתמש במיקום הנוכחי"
              >
                <FontAwesomeIcon 
                  icon={faLocationCrosshairs} 
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${locationLoading ? 'animate-spin' : ''}`} 
                />
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        {showMapToggle && (
          <div className="flex bg-gray-100 rounded-lg p-1 sm:w-auto w-full">
            <button
              onClick={() => updateFilters({ viewMode: 'list' })}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-colors text-sm ${
                filters.viewMode === 'list'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faList} className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">רשימה</span>
            </button>
            <button
              onClick={() => updateFilters({ viewMode: 'map' })}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-colors text-sm ${
                filters.viewMode === 'map'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faMap} className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">מפה</span>
            </button>
          </div>
        )}
      </div>

      {/* Current Location Display */}
      {filters.location.type !== 'none' && (
        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-teal-800 font-medium text-sm sm:text-base truncate">
                    מציג עסקים ב{filters.location.address}
                  </span>
                  <span className="text-teal-600 text-xs sm:text-sm">
                    (רדיוס {filters.location.radius}ק"מ)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={clearLocation}
              className="text-teal-600 hover:text-teal-800 transition-colors p-1 touch-manipulation flex-shrink-0"
            >
              <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Radius Slider */}
          <div className="mt-3 flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-teal-700 flex-shrink-0">רדיוס:</span>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.location.radius}
              onChange={(e) => updateFilters({
                location: { ...filters.location, radius: parseInt(e.target.value) }
              })}
              className="flex-1 h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer touch-manipulation"
            />
            <span className="text-xs sm:text-sm font-medium text-teal-700 min-w-[35px] sm:min-w-[50px] text-center">
              {filters.location.radius}ק"מ
            </span>
          </div>
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
        >
          <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
          <span className="text-sm sm:text-base">סינון מתקדם</span>
          {activeFiltersCount > 0 && (
            <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {/* Sort Options */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm"
          >
            <option value="name">מיון לפי שם</option>
            <option value="distance" disabled={filters.location.type === 'none'}>
              מיון לפי מרחק
            </option>
            <option value="newest">מיון לפי חדשים</option>
          </select>

          <div className="flex items-center justify-between sm:gap-4">
            {/* Results Count */}
            <span className="text-xs sm:text-sm text-gray-600">
              {businessesCount} עסקים
              {filters.viewMode === 'map' && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  (רק עסקים עם קישור Waze)
                </span>
              )}
            </span>

            {/* Clear All Filters */}
            {activeFiltersCount > 0 && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                נקה הכל
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 space-y-4">
          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">קטגוריות</h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                      filters.categories.includes(category)
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">תגיות</h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {availableTags.slice(0, 12).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                      filters.tags.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {availableTags.length > 12 && (
                  <span className="text-xs sm:text-sm text-gray-500 px-2.5 sm:px-3 py-1.5 sm:py-1">
                    +{availableTags.length - 12} נוספות
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}