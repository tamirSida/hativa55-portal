import { Business } from '@/models/Business';
import { BusinessService } from '@/services/BusinessService';
import { GeocodingService, type GeocodingResult } from './geocodingUtils';

export interface EnhancedLocationData {
  coordinates?: { lat: number; lng: number };
  searchRadius?: number;
  locationType: 'specific' | 'service_areas';
  locationConfidence?: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

/**
 * Service areas mapping for Israeli regions
 * This will be used for businesses that serve general areas rather than specific locations
 */
export const ISRAELI_SERVICE_AREAS = {
  // Major Cities (Tier 1 - Most Precise)
  "תל אביב": { lat: 32.0853, lng: 34.7818, radius: 8 },
  "ירושלים": { lat: 31.7683, lng: 35.2137, radius: 12 },
  "חיפה": { lat: 32.7940, lng: 34.9896, radius: 10 },
  "באר שבע": { lat: 31.2518, lng: 34.7915, radius: 12 },
  "נתניה": { lat: 32.3215, lng: 34.8532, radius: 7 },
  "פתח תקווה": { lat: 32.0917, lng: 34.8878, radius: 6 },
  "רמת גן": { lat: 32.0804, lng: 34.8144, radius: 5 },
  "רעננה": { lat: 32.1847, lng: 34.8708, radius: 4 },
  "כפר סבא": { lat: 32.1742, lng: 34.9063, radius: 4 },
  "הוד השרון": { lat: 32.1614, lng: 34.8889, radius: 3 },
  "רחובות": { lat: 31.8947, lng: 34.8096, radius: 5 },
  "בת ים": { lat: 32.0178, lng: 34.7542, radius: 4 },
  "אשדוד": { lat: 31.7940, lng: 34.6446, radius: 7 },
  "אשקלון": { lat: 31.6688, lng: 34.5742, radius: 6 },
  
  // Regions (Tier 2 - Medium Coverage)
  "גוש דן": { lat: 32.0853, lng: 34.7818, radius: 25 },
  "השרון": { lat: 32.2500, lng: 34.9000, radius: 30 },
  "הגליל": { lat: 32.9000, lng: 35.3000, radius: 40 },
  "הנגב": { lat: 31.0000, lng: 34.8000, radius: 60 },
  "השפלה": { lat: 31.8500, lng: 34.8500, radius: 25 },
  "עמק יזרעאל": { lat: 32.6000, lng: 35.3000, radius: 20 },
  "אזור ירושלים": { lat: 31.7683, lng: 35.2137, radius: 20 },
  
  // Special Areas (Tier 3)
  "כל הארץ": { lat: 31.5, lng: 35.0, radius: 200 },
  "אזור המרכז": { lat: 32.0, lng: 34.8, radius: 35 },
  "אזור הצפון": { lat: 32.8, lng: 35.2, radius: 50 },
  "אזור הדרום": { lat: 31.2, lng: 34.8, radius: 80 }
} as const;

export type ServiceAreaName = keyof typeof ISRAELI_SERVICE_AREAS;

/**
 * Enhance a single business with location data
 */
export async function enhanceBusinessLocation(business: Business): Promise<EnhancedLocationData | null> {
  try {
    console.log(`Enhancing location for business: ${business.name}`);

    // Case 1: Business has a specific Waze URL
    if (business.wazeUrl) {
      console.log('Business has Waze URL, geocoding...');
      const geocodingResult = await GeocodingService.geocodeWazeUrl(business.wazeUrl);
      
      if (geocodingResult) {
        return {
          coordinates: geocodingResult.coordinates,
          searchRadius: 5, // 5km radius for specific locations
          locationType: 'specific',
          locationConfidence: geocodingResult.confidence,
          lastUpdated: new Date().toISOString()
        };
      }
      
      console.warn(`Failed to geocode Waze URL for business: ${business.name}`);
    }

    // Case 2: Business serves specific service areas
    if (business.serviceAreas && business.serviceAreas.length > 0) {
      console.log('Business has service areas:', business.serviceAreas);
      
      // Use the first service area as primary location
      const primaryArea = business.serviceAreas[0] as ServiceAreaName;
      const areaData = ISRAELI_SERVICE_AREAS[primaryArea];
      
      if (areaData) {
        return {
          coordinates: { lat: areaData.lat, lng: areaData.lng },
          searchRadius: areaData.radius,
          locationType: 'service_areas',
          locationConfidence: 'medium',
          lastUpdated: new Date().toISOString()
        };
      } else {
        console.warn(`Unknown service area: ${primaryArea} for business: ${business.name}`);
      }
    }

    console.warn(`No location data available for business: ${business.name}`);
    return null;

  } catch (error) {
    console.error(`Error enhancing location for business ${business.name}:`, error);
    return null;
  }
}

/**
 * Batch enhance all businesses with location data
 */
export async function batchEnhanceBusinessLocations(): Promise<void> {
  try {
    console.log('Starting batch location enhancement for all businesses...');
    
    const businessService = new BusinessService();
    const businesses = await businessService.getAll();
    
    console.log(`Found ${businesses.length} businesses to enhance`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];
      console.log(`Processing ${i + 1}/${businesses.length}: ${business.name}`);

      try {
        const locationData = await enhanceBusinessLocation(business);
        
        if (locationData) {
          // Add location data to business metadata
          const updatedMetadata = {
            ...business.metadata,
            location: locationData
          };

          // Update the business in Firestore
          await businessService.update(business.id, { metadata: updatedMetadata });
          
          console.log(`✅ Enhanced location for: ${business.name}`);
          successCount++;
        } else {
          console.log(`⚠️ No location data for: ${business.name}`);
        }

        // Add delay to respect rate limits
        if (i < businesses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }

      } catch (error) {
        console.error(`❌ Error processing ${business.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Batch enhancement completed!`);
    console.log(`✅ Successfully enhanced: ${successCount} businesses`);
    console.log(`❌ Errors: ${errorCount} businesses`);
    console.log(`⚠️ No location data: ${businesses.length - successCount - errorCount} businesses`);

  } catch (error) {
    console.error('Error in batch location enhancement:', error);
  }
}

/**
 * Find businesses near a specific location
 */
export function findBusinessesNearLocation(
  businesses: Business[],
  userLocation: { lat: number; lng: number },
  maxDistanceKm: number = 25
): Array<Business & { distance: number }> {
  const nearbyBusinesses: Array<Business & { distance: number }> = [];

  for (const business of businesses) {
    const locationData = business.metadata?.location as EnhancedLocationData | undefined;
    
    if (!locationData?.coordinates) {
      continue; // Skip businesses without location data
    }

    const distance = GeocodingService.calculateDistance(
      userLocation,
      locationData.coordinates
    );

    // Check if business is within range
    if (distance <= maxDistanceKm) {
      nearbyBusinesses.push({
        ...business,
        distance
      });
    }
  }

  // Sort by distance
  return nearbyBusinesses.sort((a, b) => a.distance - b.distance);
}

/**
 * Get all available service areas for the UI
 */
export function getAvailableServiceAreas(): Array<{ name: ServiceAreaName; displayName: string; tier: number }> {
  return [
    // Tier 1 - Major Cities
    { name: "תל אביב", displayName: "תל אביב", tier: 1 },
    { name: "ירושלים", displayName: "ירושלים", tier: 1 },
    { name: "חיפה", displayName: "חיפה", tier: 1 },
    { name: "באר שבע", displayName: "באר שבע", tier: 1 },
    { name: "נתניה", displayName: "נתניה", tier: 1 },
    { name: "פתח תקווה", displayName: "פתח תקווה", tier: 1 },
    { name: "רמת גן", displayName: "רמת גן", tier: 1 },
    { name: "רעננה", displayName: "רעננה", tier: 1 },
    { name: "כפר סבא", displayName: "כפר סבא", tier: 1 },
    { name: "הוד השרון", displayName: "הוד השרון", tier: 1 },
    { name: "רחובות", displayName: "רחובות", tier: 1 },
    { name: "בת ים", displayName: "בת ים", tier: 1 },
    { name: "אשדוד", displayName: "אשדוד", tier: 1 },
    { name: "אשקלון", displayName: "אשקלון", tier: 1 },
    
    // Tier 2 - Regions
    { name: "גוש דן", displayName: "גוש דן", tier: 2 },
    { name: "השרון", displayName: "השרון", tier: 2 },
    { name: "הגליל", displayName: "הגליל", tier: 2 },
    { name: "הנגב", displayName: "הנגב", tier: 2 },
    { name: "השפלה", displayName: "השפלה", tier: 2 },
    { name: "עמק יזרעאל", displayName: "עמק יזרעאל", tier: 2 },
    { name: "אזור ירושלים", displayName: "אזור ירושלים", tier: 2 },
    
    // Tier 3 - Special Areas
    { name: "כל הארץ", displayName: "כל הארץ", tier: 3 },
    { name: "אזור המרכז", displayName: "אזור המרכז", tier: 3 },
    { name: "אזור הצפון", displayName: "אזור הצפון", tier: 3 },
    { name: "אזור הדרום", displayName: "אזור הדרום", tier: 3 }
  ];
}