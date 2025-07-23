'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Business } from '@/models/Business';
import { EnhancedLocationData } from '@/utils/businessLocationEnhancer';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

interface BusinessMapProps {
  businesses: Array<Business & { distance?: number }>;
  userLocation?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onBusinessClick?: (business: Business) => void;
}

// Default center for Israel (Tel Aviv area)
const DEFAULT_CENTER = { lat: 32.0853, lng: 34.7818 };
const DEFAULT_ZOOM = 8;

export default function BusinessMap({
  businesses,
  userLocation,
  center,
  zoom = DEFAULT_ZOOM,
  height = '400px',
  onBusinessClick
}: BusinessMapProps) {
  const [mapCenter, setMapCenter] = useState(center || userLocation || DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const [hoveredBusiness, setHoveredBusiness] = useState<(Business & { distance?: number }) | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [markerRefs, setMarkerRefs] = useState<{ [key: string]: any }>({});

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Leaflet CSS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css');
      import('leaflet').then(() => {
        setLeafletLoaded(true);
      });
    }
  }, []);

  // Update map center when props change
  useEffect(() => {
    if (center) {
      setMapCenter(center);
      setMapZoom(12);
    } else if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(12);
    } else if (businesses.length > 0) {
      // Calculate bounds from businesses
      const businessesWithLocation = businesses.filter(b => {
        const locationData = b.metadata?.location as EnhancedLocationData | undefined;
        return locationData?.coordinates;
      });

      if (businessesWithLocation.length === 1) {
        const locationData = businessesWithLocation[0].metadata?.location as EnhancedLocationData;
        setMapCenter(locationData.coordinates!);
        setMapZoom(12);
      } else if (businessesWithLocation.length > 1) {
        // Calculate center of all businesses
        const avgLat = businessesWithLocation.reduce((sum, b) => {
          const locationData = b.metadata?.location as EnhancedLocationData;
          return sum + locationData.coordinates!.lat;
        }, 0) / businessesWithLocation.length;

        const avgLng = businessesWithLocation.reduce((sum, b) => {
          const locationData = b.metadata?.location as EnhancedLocationData;
          return sum + locationData.coordinates!.lng;
        }, 0) / businessesWithLocation.length;

        setMapCenter({ lat: avgLat, lng: avgLng });
        setMapZoom(10);
      }
    }
  }, [center, userLocation, businesses]);

  // Don't render until Leaflet is loaded
  if (!leafletLoaded) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500">טוען מפה...</div>
      </div>
    );
  }

  // Custom marker icons
  const createCustomIcon = (color: string, type: 'business' | 'user' = 'business') => {
    if (typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    
    if (type === 'user') {
      return new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
            <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `)}`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      });
    }
    
    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  const businessIcon = createCustomIcon('#059669'); // teal-600
  const userIcon = createCustomIcon('#3B82F6', 'user'); // blue-500

  return (
    <div className="relative rounded-lg overflow-hidden">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        style={{ height, width: '100%' }}
        className="rounded-lg"
        zoomControl={false} // We'll add custom controls
        attributionControl={false} // Clean up for mobile
        eventHandlers={{
          click: () => {
            // Close any open popups when clicking on the map
            if (isMobile) {
              setOpenPopupId(null);
            }
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Marker */}
        {userLocation && userIcon && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>המיקום שלך</strong>
                </div>
              </Popup>
            </Marker>
            
            {/* Optional: Add circle showing search radius */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={25000} // 25km in meters
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}

        {/* Business Markers */}
        {businesses.map((business) => {
          const locationData = business.metadata?.location as EnhancedLocationData | undefined;
          
          if (!locationData?.coordinates || !businessIcon) {
            return null;
          }

          const handleMarkerClick = (e: any) => {
            console.log('Marker clicked:', business.name, 'isMobile:', isMobile, 'openPopupId:', openPopupId);
            
            // Prevent default Leaflet popup behavior
            e.originalEvent.stopPropagation();
            
            if (isMobile) {
              // Mobile: First tap shows popup, second tap goes to business
              if (openPopupId === business.id) {
                console.log('Second tap - navigating to business');
                // Popup is already open, navigate to business
                setOpenPopupId(null); // Close popup first
                window.open(`/businesses/${business.id}`, '_blank');
              } else {
                console.log('First tap - showing popup');
                // Close any other open popups and show this one
                setOpenPopupId(business.id);
                // Force the marker to open its popup
                setTimeout(() => {
                  const marker = e.target;
                  if (marker && marker.openPopup) {
                    marker.openPopup();
                  }
                }, 50);
              }
            } else {
              console.log('Desktop click - navigating directly');
              // Desktop: Click goes directly to business
              window.open(`/businesses/${business.id}`, '_blank');
            }
          };

          const handleMarkerMouseOver = (e: any) => {
            if (!isMobile) {
              // Desktop: Show hover card
              const map = e.target._map;
              const containerPoint = map.latLngToContainerPoint(e.latlng);
              setHoverPosition({ 
                x: containerPoint.x, 
                y: containerPoint.y 
              });
              setHoveredBusiness(business);
            }
          };

          const handleMarkerMouseOut = () => {
            if (!isMobile) {
              // Desktop: Hide hover card with small delay
              setTimeout(() => {
                setHoveredBusiness(null);
                setHoverPosition(null);
              }, 150);
            }
          };

          return (
            <Marker
              key={business.id}
              position={[locationData.coordinates.lat, locationData.coordinates.lng]}
              icon={businessIcon}
              eventHandlers={{
                click: handleMarkerClick,
                mouseover: handleMarkerMouseOver,
                mouseout: handleMarkerMouseOut
              }}
            >
              {/* Popup - always rendered but content varies by device */}
              <Popup
                closeButton={isMobile}
                className={isMobile ? "mobile-popup" : "desktop-popup"}
                eventHandlers={{
                  remove: () => setOpenPopupId(null)
                }}
              >
                {isMobile ? (
                  /* Mobile popup content */
                  <div className="w-full max-w-[300px]">
                    <div className="flex items-start gap-3 mb-3">
                      {business.metadata?.images?.logoUrl && (
                        <img
                          src={business.metadata.images.logoUrl}
                          alt={`לוגו ${business.name}`}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 text-base leading-tight">
                          {business.name}
                        </h3>
                        <p className="text-sm text-teal-600 font-medium">
                          {business.metadata?.category || 'עסק'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                      {business.description}
                    </p>

                    {business.distance !== undefined && (
                      <p className="text-sm text-gray-500 mb-3 font-medium">
                        מרחק: {business.distance < 1 
                          ? `${Math.round(business.distance * 1000)}מ'` 
                          : `${business.distance.toFixed(1)}ק"מ`
                        }
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/businesses/${business.id}`, '_blank');
                        }}
                        className="flex-1 px-4 py-2.5 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors touch-manipulation"
                      >
                        צפה בפרטים
                      </button>
                      
                      {business.wazeUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(business.wazeUrl, '_blank');
                          }}
                          className="flex-1 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors touch-manipulation"
                        >
                          נווט
                        </button>
                      )}
                    </div>

                    {/* Tap again hint */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        או הקש על הסמן שוב כדי לעבור לדף העסק
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Desktop popup content */
                  <div className="w-full max-w-xs">
                    <div className="flex items-start gap-3 mb-2">
                      {business.metadata?.images?.logoUrl && (
                        <img
                          src={business.metadata.images.logoUrl}
                          alt={`לוגו ${business.name}`}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 text-base line-clamp-2">
                          {business.name}
                        </h3>
                        <p className="text-xs text-teal-600 font-medium">
                          {business.metadata?.category || 'עסק'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {business.description}
                    </p>

                    {business.distance !== undefined && (
                      <p className="text-xs text-gray-500 mb-2">
                        מרחק: {business.distance < 1 
                          ? `${Math.round(business.distance * 1000)}מ'` 
                          : `${business.distance.toFixed(1)}ק"מ`
                        }
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/businesses/${business.id}`, '_blank');
                        }}
                        className="flex-1 px-3 py-1 bg-teal-500 text-white text-xs rounded-md hover:bg-teal-600 transition-colors"
                      >
                        פרטים
                      </button>
                      
                      {business.wazeUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(business.wazeUrl, '_blank');
                          }}
                          className="flex-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                        >
                          נווט
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white rounded-lg shadow-md p-2 z-[1000]">
        <div className="text-xs text-gray-600">
          {businesses.length} עסקים
        </div>
      </div>

      {/* Custom Zoom Controls for Mobile */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1 z-[1000]">
        <button
          onClick={() => {
            // Note: This would require accessing the map instance
            // For now, we'll keep the default Leaflet controls but hidden on mobile
          }}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
          title="זום פנימה"
        >
          <span className="text-lg font-bold leading-none">+</span>
        </button>
        <button
          onClick={() => {
            // Note: This would require accessing the map instance
          }}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
          title="זום החוצה"
        >
          <span className="text-lg font-bold leading-none">−</span>
        </button>
      </div>

      {/* Mobile-friendly attribution */}
      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-xs text-gray-500 bg-white bg-opacity-75 px-1.5 py-0.5 rounded">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          © OpenStreetMap
        </a>
      </div>

      {/* Desktop Hover Card */}
      {hoveredBusiness && hoverPosition && !isMobile && (
        <div 
          className="absolute z-[2000] pointer-events-none"
          style={{
            left: hoverPosition.x + 10,
            top: hoverPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border p-3 max-w-xs">
            <div className="flex items-start gap-3 mb-2">
              {hoveredBusiness.metadata?.images?.logoUrl && (
                <img
                  src={hoveredBusiness.metadata.images.logoUrl}
                  alt={`לוגו ${hoveredBusiness.name}`}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">
                  {hoveredBusiness.name}
                </h3>
                <p className="text-xs text-teal-600 font-medium">
                  {hoveredBusiness.metadata?.category || 'עסק'}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {hoveredBusiness.description}
            </p>

            {hoveredBusiness.distance !== undefined && (
              <p className="text-xs text-gray-500 mb-2">
                מרחק: {hoveredBusiness.distance < 1 
                  ? `${Math.round(hoveredBusiness.distance * 1000)}מ'` 
                  : `${hoveredBusiness.distance.toFixed(1)}ק"מ`
                }
              </p>
            )}

            <div className="flex items-center text-xs text-gray-500">
              <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs">
                לחץ לפרטים
              </span>
            </div>

            {/* Arrow pointer */}
            <div 
              className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}