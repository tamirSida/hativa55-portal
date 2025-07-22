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

  console.log('parseWazeUrl called with:', url);

  try {
    // Check if the input contains Hebrew text with address before the URL
    // Pattern: "נסיעה עם Waze אל [address]: https://waze.com/..."
    const hebrewAddressMatch = url.match(/נסיעה עם Waze אל\s+([^:]+):\s*(https?:\/\/[^\s]+)/i);
    let extractedAddress: string | undefined;
    
    if (hebrewAddressMatch) {
      extractedAddress = hebrewAddressMatch[1].trim();
      console.log('Extracted address from Hebrew text:', extractedAddress);
    }
    
    // Normalize URL first to handle malformed URLs
    const normalizedUrl = normalizeWazeUrl(url);
    if (!normalizedUrl) {
      console.log('URL normalization failed');
      return null;
    }
    
    console.log('Normalized URL:', normalizedUrl);
    const urlObj = new URL(normalizedUrl);
    
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
          console.log('Extracted coordinates:', { lat, lng });
        }
      }
      
      // Extract place name from 'q' parameter
      let place = params.get('q');
      if (place) {
        place = decodeURIComponent(place);
        console.log('Extracted place:', place);
      }
      
      // Extract address from path (for live-map URLs)
      let pathAddress: string | undefined;
      if (urlObj.pathname.includes('/directions/to/')) {
        const pathParts = urlObj.pathname.split('/');
        const toIndex = pathParts.indexOf('to');
        if (toIndex !== -1 && pathParts[toIndex + 1]) {
          pathAddress = decodeURIComponent(pathParts[toIndex + 1]).replace(/-/g, ' ');
          console.log('Extracted address from path:', pathAddress);
        }
      }
      
      // Priority: Hebrew text address > path address > place name
      const finalAddress = extractedAddress || pathAddress || place;
      
      const result = {
        address: finalAddress,
        lat,
        lng,
        place
      };
      
      console.log('Parse result:', result);
      
      // Return result even if no specific location data is available
      // This indicates it's a valid Waze URL, even if it's a short link
      return result;
    }
    
    console.log('Not a Waze URL');
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
  console.log('getLocationDisplayText called with:', { wazeUrl, serviceAreas });
  
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
    
    // If we have a valid Waze URL (parsed is not null) but no specific location data,
    // it's likely a short URL - show generic location text
    if (parsed !== null) {
      console.log('Valid Waze URL but no specific location data - using generic text');
      return 'מיקום זמין ב-Waze';
    }
    
    console.log('Waze URL exists but failed to parse');
  } else {
    console.log('No Waze URL provided');
  }
  
  if (serviceAreas && serviceAreas.length > 0) {
    console.log('Using service areas:', serviceAreas);
    return serviceAreas.slice(0, 2).join(', ');
  } else {
    console.log('No service areas provided');
  }
  
  console.log('Using fallback text - no location data available');
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
  
  // Fix common malformed URLs - handle https:/ (single slash)
  cleanUrl = cleanUrl.replace(/^https:\//i, 'https://');
  cleanUrl = cleanUrl.replace(/^http:\//i, 'http://');
  
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