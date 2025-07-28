'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUser, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from './Button';
import { ClientCloudinaryService } from '@/services/ClientCloudinaryService';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  currentImagePublicId?: string;
  onImageUpload: (url: string, publicId: string) => void;
  onImageRemove: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

const SIZES = {
  small: 'w-16 h-16',
  medium: 'w-24 h-24', 
  large: 'w-32 h-32'
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  currentImagePublicId,
  onImageUpload,
  onImageRemove,
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudinaryService = new ClientCloudinaryService();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await cloudinaryService.uploadImage({
        file,
        folder: CLOUDINARY_CONFIG.FOLDERS.USER_PROFILES,
        resourceType: 'image'
      });

      onImageUpload(result.secureUrl, result.publicId);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'שגיאה בהעלאת התמונה');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveClick = () => {
    if (disabled) return;
    onImageRemove();
    setUploadError(null);
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Profile Picture Display */}
      <div className={`relative ${SIZES[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100`}>
        {currentImageUrl ? (
          <Image
            src={currentImageUrl}
            alt="תמונת פרופיל"
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <FontAwesomeIcon 
              icon={faUser} 
              className={`text-gray-400 ${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-3xl'}`}
            />
          </div>
        )}
        
        {/* Upload Overlay */}
        {!disabled && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200"
            onClick={handleUploadClick}
          >
            {isUploading ? (
              <FontAwesomeIcon icon={faSpinner} className="text-white text-lg animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faCamera} className="text-white text-lg" />
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
            icon={isUploading ? faSpinner : faCamera}
            className={isUploading ? 'animate-spin' : ''}
          >
            {currentImageUrl ? 'החלפת תמונה' : 'הוספת תמונה'}
          </Button>
          
          {currentImageUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveClick}
              disabled={isUploading}
              icon={faTrash}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              הסרה
            </Button>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {uploadError}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};