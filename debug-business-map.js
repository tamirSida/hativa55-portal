/**
 * Debug script to investigate why "פיצה סלייס" business is not appearing on the map
 * This script can be run in the browser console on the businesses page
 */

// Debug function to check business location data
async function debugBusinessMapIssue() {
  console.log('🔍 Starting debug investigation for business map issue...');
  
  try {
    // Import required services and utilities
    const { BusinessService } = await import('./src/services/BusinessService.js');
    const { GeocodingService } = await import('./src/utils/geocodingUtils.js');
    const { parseWazeUrl } = await import('./src/utils/wazeUtils.js');
    const { enhanceBusinessLocation } = await import('./src/utils/businessLocationEnhancer.js');
    
    const businessService = new BusinessService();
    
    // Get all businesses
    console.log('📋 Loading all businesses...');
    const allBusinesses = await businessService.getActiveBusinesses();
    console.log(`Found ${allBusinesses.length} active businesses`);
    
    // Find "פיצה סלייס" business
    const pizzaSlice = allBusinesses.find(b => b.name.includes('פיצה סלייס'));
    if (!pizzaSlice) {
      console.error('❌ "פיצה סלייס" business not found in active businesses');
      console.log('Available business names:', allBusinesses.map(b => b.name));
      return;
    }
    
    console.log('✅ Found "פיצה סלייס" business:', pizzaSlice);
    
    // Check business basic properties
    console.log('\n🔍 Business Properties:');
    console.log('- ID:', pizzaSlice.id);
    console.log('- Name:', pizzaSlice.name);
    console.log('- IsActive:', pizzaSlice.isActive);
    console.log('- WazeUrl:', pizzaSlice.wazeUrl);
    console.log('- ServiceAreas:', pizzaSlice.serviceAreas);
    console.log('- Metadata:', pizzaSlice.metadata);
    
    // Check if business has location data in metadata
    const locationData = pizzaSlice.metadata?.location;
    console.log('\n📍 Location Data in Metadata:');
    console.log(locationData);
    
    if (locationData?.coordinates) {
      console.log('✅ Business has coordinates:', locationData.coordinates);
    } else {
      console.log('❌ Business missing coordinates in metadata');
      
      // Try to enhance location data
      console.log('\n🔧 Attempting to enhance location data...');
      
      if (pizzaSlice.wazeUrl) {
        console.log('Testing Waze URL parsing...');
        const parsedWaze = parseWazeUrl(pizzaSlice.wazeUrl);
        console.log('Parsed Waze result:', parsedWaze);
        
        if (parsedWaze?.address) {
          console.log('Testing geocoding of extracted address...');
          const geocodingResult = await GeocodingService.geocodeWazeUrl(pizzaSlice.wazeUrl);
          console.log('Geocoding result:', geocodingResult);
        }
      }
      
      // Test full enhancement
      const enhancementResult = await enhanceBusinessLocation(pizzaSlice);
      console.log('Enhancement result:', enhancementResult);
    }
    
    // Compare with working businesses
    console.log('\n🔍 Checking other businesses for comparison...');
    const workingBusinesses = allBusinesses.filter(b => {
      const locData = b.metadata?.location;
      return locData?.coordinates;
    });
    
    console.log(`Found ${workingBusinesses.length} businesses with coordinates`);
    workingBusinesses.slice(0, 3).forEach(b => {
      console.log(`- ${b.name}: has coordinates ${b.metadata.location.coordinates.lat}, ${b.metadata.location.coordinates.lng}`);
    });
    
    // Check filtering logic
    console.log('\n🔍 Testing map filtering logic...');
    const businessesWithCoords = allBusinesses.filter(b => {
      const locationData = b.metadata?.location;
      return locationData?.coordinates;
    });
    
    const pizzaSliceInFiltered = businessesWithCoords.find(b => b.name.includes('פיצה סלייס'));
    if (pizzaSliceInFiltered) {
      console.log('✅ "פיצה סלייס" passes coordinate filter');
    } else {
      console.log('❌ "פיצה סלייס" fails coordinate filter - this is why it\'s not showing on map');
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Check map rendering logic
function debugMapRendering() {
  console.log('\n🗺️ Checking map rendering logic...');
  
  // Find the map component in the page
  const mapElements = document.querySelectorAll('[class*="leaflet"]');
  console.log('Map elements found:', mapElements.length);
  
  // Check if BusinessMap component is rendered
  const businessCards = document.querySelectorAll('[class*="business"]');
  console.log('Business-related elements:', businessCards.length);
}

// Make functions available globally
window.debugBusinessMapIssue = debugBusinessMapIssue;
window.debugMapRendering = debugMapRendering;

console.log('🚀 Debug script loaded!');
console.log('Run: await debugBusinessMapIssue() - to investigate the issue');
console.log('Run: debugMapRendering() - to check map rendering');