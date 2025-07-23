/**
 * Script to enhance all existing businesses with location data
 * This should be run once to add coordinates to existing businesses
 * 
 * Usage:
 * 1. Open browser console on your app
 * 2. Copy and paste this code
 * 3. Call: await enhanceAllBusinesses()
 */

import { batchEnhanceBusinessLocations } from '@/utils/businessLocationEnhancer';

/**
 * Main function to enhance all business locations
 * Call this from the browser console
 */
export async function enhanceAllBusinesses() {
  console.log('🚀 Starting business location enhancement...');
  console.log('This may take a few minutes due to rate limiting.');
  console.log('Please do not close this tab while the process is running.');
  
  try {
    await batchEnhanceBusinessLocations();
    console.log('✅ All done! Businesses have been enhanced with location data.');
  } catch (error) {
    console.error('❌ Error during batch enhancement:', error);
  }
}

// For browser console usage
if (typeof window !== 'undefined') {
  (window as any).enhanceAllBusinesses = enhanceAllBusinesses;
  console.log('💡 Business location enhancer loaded!');
  console.log('💡 Run: await enhanceAllBusinesses() to start enhancement');
}

/**
 * Test function to enhance a single business
 */
export async function testSingleBusiness(businessId: string) {
  const { BusinessService } = await import('@/services/BusinessService');
  const { enhanceBusinessLocation } = await import('@/utils/businessLocationEnhancer');
  
  try {
    const businessService = new BusinessService();
    const business = await businessService.getById(businessId);
    
    if (!business) {
      console.error('Business not found:', businessId);
      return;
    }
    
    console.log('Testing enhancement for:', business.name);
    const result = await enhanceBusinessLocation(business);
    console.log('Enhancement result:', result);
    
    return result;
  } catch (error) {
    console.error('Error testing single business:', error);
  }
}

// Also expose test function for debugging
if (typeof window !== 'undefined') {
  (window as any).testSingleBusiness = testSingleBusiness;
}