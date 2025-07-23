import { parseWazeUrl } from './wazeUtils';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  address: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Free geocoding service using Nominatim (OpenStreetMap)
 * No API key required, rate limited but suitable for our needs
 */
export class GeocodingService {
  private static readonly BASE_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  private static lastRequestTime = 0;

  /**
   * Geocode an address using Nominatim
   */
  static async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      // Rate limiting - ensure 1 second between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();

      const params = new URLSearchParams({
        q: `${address}, Israel`,
        format: 'json',
        limit: '1',
        countrycodes: 'il',
        'accept-language': 'he,en'
      });

      const response = await fetch(`${this.BASE_URL}?${params}`, {
        headers: {
          'User-Agent': 'CommunityPlatform/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.warn(`No geocoding results for address: ${address}`);
        return null;
      }

      const result = data[0];
      
      return {
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        address: result.display_name,
        confidence: this.getConfidenceLevel(result)
      };

    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Extract coordinates from Waze URL using existing parsing + geocoding
   */
  static async geocodeWazeUrl(wazeUrl: string): Promise<GeocodingResult | null> {
    try {
      console.log('Geocoding Waze URL:', wazeUrl);
      
      // Use existing Waze URL parsing to extract address
      const wazeResult = parseWazeUrl(wazeUrl);
      
      if (!wazeResult.address) {
        console.warn('No address found in Waze URL:', wazeUrl);
        return null;
      }

      console.log('Extracted address from Waze URL:', wazeResult.address);

      // If we already have coordinates from Waze parsing, use them
      if (wazeResult.lat && wazeResult.lng) {
        return {
          coordinates: {
            lat: wazeResult.lat,
            lng: wazeResult.lng
          },
          address: wazeResult.address,
          confidence: 'high'
        };
      }

      // Otherwise, geocode the extracted address
      const geocodingResult = await this.geocodeAddress(wazeResult.address);
      
      if (geocodingResult) {
        // Enhance confidence since we got the address from Waze
        geocodingResult.confidence = 'high';
        geocodingResult.address = wazeResult.address; // Use original Hebrew address
      }

      return geocodingResult;

    } catch (error) {
      console.error('Error geocoding Waze URL:', error);
      return null;
    }
  }

  /**
   * Determine confidence level based on Nominatim result
   */
  private static getConfidenceLevel(result: any): 'high' | 'medium' | 'low' {
    const importance = parseFloat(result.importance || '0');
    const type = result.type || '';
    
    // High confidence for exact addresses and important places
    if (type === 'house' || importance > 0.6) {
      return 'high';
    }
    
    // Medium confidence for streets and neighborhoods
    if (type === 'residential' || type === 'primary' || importance > 0.4) {
      return 'medium';
    }
    
    // Low confidence for general areas
    return 'low';
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in kilometers
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}מ'`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}ק"מ`;
    } else {
      return `${Math.round(distanceKm)}ק"מ`;
    }
  }
}

/**
 * Batch geocode multiple addresses with rate limiting
 */
export async function batchGeocode(addresses: string[]): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];
  
  for (const address of addresses) {
    const result = await GeocodingService.geocodeAddress(address);
    results.push(result);
    
    // Add delay between batch requests
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  
  return results;
}

/**
 * Batch geocode Waze URLs with rate limiting
 */
export async function batchGeocodeWazeUrls(wazeUrls: string[]): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];
  
  console.log(`Starting batch geocoding of ${wazeUrls.length} Waze URLs`);
  
  for (let i = 0; i < wazeUrls.length; i++) {
    const wazeUrl = wazeUrls[i];
    console.log(`Geocoding ${i + 1}/${wazeUrls.length}: ${wazeUrl}`);
    
    const result = await GeocodingService.geocodeWazeUrl(wazeUrl);
    results.push(result);
    
    // Add delay between batch requests to respect rate limits
    if (i < wazeUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }
  
  console.log(`Batch geocoding completed. ${results.filter(r => r !== null).length}/${wazeUrls.length} successful`);
  
  return results;
}