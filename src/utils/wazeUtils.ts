/**
 * Utility functions for working with Waze URLs
 */

export interface ParsedWazeLocation {
  address?: string;
  lat?: number;
  lng?: number;
  place?: string;
}

/**
 * Extract address information from a Waze URL
 * Supports various Waze URL formats:
 * - https://waze.com/ul/hsv8s4m4fh (short link)
 * - https://waze.com/ul?ll=32.0853,34.7818&navigate=yes
 * - https://waze.com/ul?ll=32.0853,34.7818&q=Tel%20Aviv
 * - https://www.waze.com/live-map/directions/to/...
 */
export function parseWazeUrl(url: string): ParsedWazeLocation | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);
    
    // Handle different Waze URL formats
    if (urlObj.hostname.includes('waze.com')) {
      const params = new URLSearchParams(urlObj.search);
      
      // Extract coordinates if available
      const ll = params.get('ll');
      let lat: number | undefined;
      let lng: number | undefined;
      
      if (ll) {
        const coords = ll.split(',');
        if (coords.length === 2) {
          lat = parseFloat(coords[0]);
          lng = parseFloat(coords[1]);
        }
      }
      
      // Extract place name from 'q' parameter
      let place = params.get('q');
      if (place) {
        place = decodeURIComponent(place);
      }
      
      // Extract address from path (for live-map URLs)
      let address: string | undefined;
      if (urlObj.pathname.includes('/directions/to/')) {
        const pathParts = urlObj.pathname.split('/');
        const toIndex = pathParts.indexOf('to');
        if (toIndex !== -1 && pathParts[toIndex + 1]) {
          address = decodeURIComponent(pathParts[toIndex + 1]).replace(/-/g, ' ');
        }
      }
      
      return {
        address: address || place,
        lat,
        lng,
        place
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to parse Waze URL:', error);
    return null;
  }
}

/**
 * Get display text for a location based on Waze URL and service areas
 */
export function getLocationDisplayText(wazeUrl?: string, serviceAreas?: string[]): string {
  if (wazeUrl) {
    console.log('Processing Waze URL:', wazeUrl);
    const parsed = parseWazeUrl(wazeUrl);
    console.log('Parsed result:', parsed);
    
    if (parsed?.address) {
      console.log('Using address:', parsed.address);
      return parsed.address;
    }
    if (parsed?.place) {
      console.log('Using place:', parsed.place);
      return parsed.place;
    }
    // If we have coordinates but no address, show generic text
    if (parsed?.lat && parsed?.lng) {
      console.log('Using coordinates fallback');
      return 'מיקום מדויק';
    }
  }
  
  if (serviceAreas && serviceAreas.length > 0) {
    console.log('Using service areas:', serviceAreas);
    return serviceAreas.slice(0, 2).join(', ');
  }
  
  console.log('Using fallback text');
  return 'מיקום לא זמין';
}

/**
 * Check if a string looks like a Waze URL
 */
export function isWazeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('waze.com');
  } catch {
    return false;
  }
}

/**
 * Normalize a Waze URL to ensure it's properly formatted
 */
export function normalizeWazeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  console.log('Normalizing Waze URL:', url);

  // Clean the URL of any extra text
  let cleanUrl = url.trim();
  
  // Extract just the Waze URL if there's extra text
  const wazeMatch = cleanUrl.match(/(https?:\/\/(?:www\.)?waze\.com\/[^\s]+)/i);
  if (wazeMatch) {
    cleanUrl = wazeMatch[1];
  } else {
    // If no protocol, check if it starts with waze.com
    const wazeDirectMatch = cleanUrl.match(/(waze\.com\/[^\s]+)/i);
    if (wazeDirectMatch) {
      cleanUrl = 'https://' + wazeDirectMatch[1];
    }
  }

  // If URL doesn't start with http/https, add https://
  if (!cleanUrl.match(/^https?:\/\//)) {
    if (cleanUrl.toLowerCase().includes('waze.com')) {
      cleanUrl = 'https://' + cleanUrl;
    } else {
      console.warn('Not a valid Waze URL:', url);
      return '';
    }
  }

  try {
    const urlObj = new URL(cleanUrl);
    
    // Ensure it's a Waze URL
    if (!urlObj.hostname.toLowerCase().includes('waze.com')) {
      console.warn('URL is not a Waze URL:', cleanUrl);
      return '';
    }

    console.log('Normalized Waze URL:', urlObj.toString());
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to normalize Waze URL:', error);
    return '';
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}