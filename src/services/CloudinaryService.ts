import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG, CloudinaryResourceType } from '@/config/cloudinary';
import { BaseService } from './BaseService';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
});

export interface CloudinaryUploadOptions {
  userId: string;
  resourceType: CloudinaryResourceType;
  businessId?: string;
  jobId?: string;
  file: File;
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface MediaUsage {
  id?: string;
  userId: string;
  businessId?: string;
  jobId?: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  bytes: number;
  uploadedAt: Timestamp;
  month: string; // YYYY-MM format for monthly tracking
}

export class CloudinaryService extends BaseService {
  private mediaUsageCollection = 'media_usage';

  constructor() {
    super();
  }

  /**
   * Upload image to Cloudinary with usage tracking and limits
   */
  async uploadImage(options: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> {
    const { userId, resourceType, businessId, jobId, file } = options;

    // Validate file size
    await this.validateFileSize(file, resourceType);

    // Check usage limits
    await this.checkUsageLimits(userId, resourceType, businessId, file.size);

    try {
      // Convert File to base64 for upload
      const base64 = await this.fileToBase64(file);
      
      // Determine upload preset and folder
      const uploadPreset = this.getUploadPreset(resourceType);
      const folder = this.getFolder(resourceType, userId, businessId, jobId);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64, {
        upload_preset: uploadPreset,
        folder: folder,
        resource_type: 'image',
        transformation: this.getTransformation(resourceType),
      });

      // Track usage in Firestore
      await this.trackUsage({
        userId,
        businessId,
        jobId,
        publicId: result.public_id,
        resourceType,
        bytes: result.bytes,
        uploadedAt: Timestamp.now(),
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
      });

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('שגיאה בהעלאת התמונה');
    }
  }

  /**
   * Delete image from Cloudinary and remove usage tracking
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId);

      // Remove usage tracking
      const usageQuery = query(
        collection(this.db, this.mediaUsageCollection),
        where('publicId', '==', publicId)
      );
      
      const usageDocs = await getDocs(usageQuery);
      const deletePromises = usageDocs.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('שגיאה במחיקת התמונה');
    }
  }

  /**
   * Get usage statistics for a user or business
   */
  async getUsageStats(userId: string, businessId?: string): Promise<{
    currentMonthStorage: number;
    currentMonthTransformations: number;
    totalImages: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    let usageQuery = query(
      collection(this.db, this.mediaUsageCollection),
      where('userId', '==', userId),
      where('month', '==', currentMonth)
    );

    if (businessId) {
      usageQuery = query(
        collection(this.db, this.mediaUsageCollection),
        where('businessId', '==', businessId),
        where('month', '==', currentMonth)
      );
    }

    const usageDocs = await getDocs(usageQuery);
    
    const currentMonthStorage = usageDocs.docs.reduce(
      (total, doc) => total + doc.data().bytes, 
      0
    );
    
    const currentMonthTransformations = usageDocs.docs.length;
    
    // Get total images (all time)
    let totalQuery = query(
      collection(this.db, this.mediaUsageCollection),
      where('userId', '==', userId)
    );

    if (businessId) {
      totalQuery = query(
        collection(this.db, this.mediaUsageCollection),
        where('businessId', '==', businessId)
      );
    }

    const totalDocs = await getDocs(totalQuery);
    const totalImages = totalDocs.docs.length;

    return {
      currentMonthStorage,
      currentMonthTransformations,
      totalImages
    };
  }

  /**
   * Get images for a specific resource
   */
  async getResourceImages(userId: string, resourceType: CloudinaryResourceType, resourceId?: string): Promise<MediaUsage[]> {
    let usageQuery = query(
      collection(this.db, this.mediaUsageCollection),
      where('userId', '==', userId),
      where('resourceType', '==', resourceType)
    );

    if (resourceId && resourceType === 'business_image') {
      usageQuery = query(usageQuery, where('businessId', '==', resourceId));
    }

    if (resourceId && resourceType === 'job_image') {
      usageQuery = query(usageQuery, where('jobId', '==', resourceId));
    }

    const usageDocs = await getDocs(usageQuery);
    return usageDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaUsage));
  }

  private async validateFileSize(file: File, resourceType: CloudinaryResourceType): Promise<void> {
    const maxSize = resourceType === 'user_profile' 
      ? CLOUDINARY_CONFIG.LIMITS.MAX_PROFILE_PICTURE_SIZE
      : CLOUDINARY_CONFIG.LIMITS.MAX_BUSINESS_IMAGE_SIZE;

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new Error(`גודל הקובץ חורג מהמגבלה של ${maxSizeMB}MB`);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('יש לבחור קובץ תמונה בלבד');
    }
  }

  private async checkUsageLimits(
    userId: string, 
    resourceType: CloudinaryResourceType, 
    businessId?: string, 
    fileSize?: number
  ): Promise<void> {
    const stats = await this.getUsageStats(userId, businessId);

    // Check storage limit
    if (businessId) {
      const newStorage = stats.currentMonthStorage + (fileSize || 0);
      if (newStorage > CLOUDINARY_CONFIG.LIMITS.MAX_STORAGE_PER_BUSINESS_MONTHLY) {
        throw new Error('חרגת ממגבלת האחסון החודשית לעסק');
      }
    }

    // Check transformations limit
    if (businessId && stats.currentMonthTransformations >= CLOUDINARY_CONFIG.LIMITS.MAX_TRANSFORMATIONS_PER_BUSINESS_MONTHLY) {
      throw new Error('חרגת ממגבלת ההעלאות החודשית לעסק');
    }

    // Check maximum images per business
    if (resourceType === 'business_image' && businessId) {
      const businessImages = await this.getResourceImages(userId, 'business_image', businessId);
      if (businessImages.length >= CLOUDINARY_CONFIG.LIMITS.MAX_IMAGES_PER_BUSINESS) {
        throw new Error(`עסק יכול להעלות עד ${CLOUDINARY_CONFIG.LIMITS.MAX_IMAGES_PER_BUSINESS} תמונות`);
      }
    }
  }

  private async trackUsage(usage: MediaUsage): Promise<void> {
    await addDoc(collection(this.db, this.mediaUsageCollection), usage);
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private getUploadPreset(resourceType: CloudinaryResourceType): string {
    switch (resourceType) {
      case 'user_profile':
        return CLOUDINARY_CONFIG.UPLOAD_PRESETS.USER_PROFILES;
      case 'business_image':
        return CLOUDINARY_CONFIG.UPLOAD_PRESETS.BUSINESS_IMAGES;
      case 'job_image':
        return CLOUDINARY_CONFIG.UPLOAD_PRESETS.JOB_IMAGES;
      default:
        return CLOUDINARY_CONFIG.UPLOAD_PRESETS.USER_PROFILES;
    }
  }

  private getFolder(
    resourceType: CloudinaryResourceType, 
    userId: string, 
    businessId?: string, 
    jobId?: string
  ): string {
    switch (resourceType) {
      case 'user_profile':
        return `${CLOUDINARY_CONFIG.FOLDERS.USER_PROFILES}/${userId}`;
      case 'business_image':
        return `${CLOUDINARY_CONFIG.FOLDERS.BUSINESS_IMAGES}/${businessId}`;
      case 'job_image':
        return `${CLOUDINARY_CONFIG.FOLDERS.JOB_IMAGES}/${jobId}`;
      default:
        return CLOUDINARY_CONFIG.FOLDERS.SYSTEM;
    }
  }

  private getTransformation(resourceType: CloudinaryResourceType) {
    switch (resourceType) {
      case 'user_profile':
        return [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { format: 'auto' }
        ];
      case 'business_image':
        return [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ];
      case 'job_image':
        return [
          { width: 600, height: 400, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ];
      default:
        return [{ quality: 'auto' }, { format: 'auto' }];
    }
  }
}