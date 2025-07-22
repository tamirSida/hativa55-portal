/**
 * Client-side Cloudinary service for browser uploads
 * Uses unsigned upload presets for direct client-side uploads
 */

export interface ClientUploadOptions {
  file: File;
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

export interface ClientUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class ClientCloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  }

  private checkConfig(): void {
    if (!this.cloudName || !this.uploadPreset) {
      throw new Error(
        'Missing Cloudinary configuration.\n\n' +
        'Please add to your .env.local file:\n' +
        'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name\n' +
        'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset\n\n' +
        'See .env.example for setup instructions.'
      );
    }
  }

  /**
   * Upload file directly to Cloudinary from the browser
   */
  async uploadImage(options: ClientUploadOptions): Promise<ClientUploadResult> {
    // Check configuration before proceeding
    this.checkConfig();
    
    const { file, folder = 'community-platform/businesses', resourceType = 'image' } = options;

    // Validate file
    this.validateFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);
    formData.append('resource_type', resourceType);

    // Add transformation for optimization
    if (resourceType === 'image') {
      formData.append('transformation', 'w_800,h_600,c_limit,q_auto,f_auto');
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();

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
      if (error instanceof Error) {
        throw new Error(`שגיאה בהעלאת התמונה: ${error.message}`);
      }
      throw new Error('שגיאה בהעלאת התמונה. אנא נסה שוב.');
    }
  }

  /**
   * Delete image from Cloudinary
   * Note: This requires a signed request, so it should be done server-side
   * For now, we'll just remove the reference and let Cloudinary's auto-cleanup handle it
   */
  async deleteImage(publicId: string): Promise<void> {
    // This would need to be implemented as an API route for signed deletion
    // For now, we'll just remove the reference locally
    console.log(`Image ${publicId} marked for cleanup`);
  }

  private validateFile(file: File): void {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('יש להעלות קובץ תמונה בלבד');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('גודל הקובץ לא יכול לעלות על 5MB');
    }

    // Check file extension
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('סוג קובץ לא נתמך. אנא השתמש ב-JPG, PNG, GIF או WebP');
    }
  }
}