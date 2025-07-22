export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  
  // Resource limits per business (based on 2500 total users, using 1/1500 of free tier)
  LIMITS: {
    // Per business storage limit: ~17 MB
    MAX_STORAGE_PER_BUSINESS: 17 * 1024 * 1024, // 17 MB in bytes
    
    // Per business monthly bandwidth: ~17 MB
    MAX_BANDWIDTH_PER_BUSINESS_MONTHLY: 17 * 1024 * 1024, // 17 MB in bytes
    
    // Per business monthly transformations: ~17
    MAX_TRANSFORMATIONS_PER_BUSINESS_MONTHLY: 17,
    
    // Per user profile picture limit: 2 MB (reasonable for profile pics)
    MAX_PROFILE_PICTURE_SIZE: 2 * 1024 * 1024, // 2 MB in bytes
    
    // Per business image limit: 5 MB (for logos/photos)
    MAX_BUSINESS_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB in bytes
    
    // Maximum images per business
    MAX_IMAGES_PER_BUSINESS: 5, // Logo + 4 photos
    
    // Maximum images per job posting
    MAX_IMAGES_PER_JOB: 2
  },
  
  // Upload presets (configured in Cloudinary dashboard)
  UPLOAD_PRESETS: {
    USER_PROFILES: 'user_profiles',
    BUSINESS_IMAGES: 'business_images',
    JOB_IMAGES: 'job_images'
  },
  
  // Folder structure
  FOLDERS: {
    USER_PROFILES: 'community-platform/users',
    BUSINESS_IMAGES: 'community-platform/businesses',
    JOB_IMAGES: 'community-platform/jobs',
    SYSTEM: 'community-platform/system'
  }
} as const;

export type CloudinaryResourceType = 'user_profile' | 'business_image' | 'job_image';