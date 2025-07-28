'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUser, faSpinner, faTrash, faEdit, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { Button } from './Button';
import { ImageCropModal } from './ImageCropModal';
import { ClientCloudinaryService } from '@/services/ClientCloudinaryService';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  currentImagePublicId?: string;
  originalImageUrl?: string;
  originalImagePublicId?: string;
  onImageUpload: (url: string, publicId: string, originalUrl: string, originalPublicId: string) => void;
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
  originalImageUrl,
  originalImagePublicId,
  onImageUpload,
  onImageRemove,
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudinaryService = new ClientCloudinaryService();

  const processFile = async (originalFile: File, croppedFile: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload original image first
      const originalResult = await cloudinaryService.uploadImage({
        file: originalFile,
        folder: CLOUDINARY_CONFIG.FOLDERS.USER_PROFILES + '/originals',
        resourceType: 'image'
      });

      // Upload cropped image
      const croppedResult = await cloudinaryService.uploadImage({
        file: croppedFile,
        folder: CLOUDINARY_CONFIG.FOLDERS.USER_PROFILES,
        resourceType: 'image'
      });

      onImageUpload(
        croppedResult.secureUrl, 
        croppedResult.publicId,
        originalResult.secureUrl,
        originalResult.publicId
      );
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Show crop modal instead of directly processing
    setSelectedFile(file);
    setShowCropModal(true);
  };

  const handleUploadClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!selectedFile) return;
    setShowCropModal(false);
    const originalFile = selectedFile;
    setSelectedFile(null);
    await processFile(originalFile, croppedFile);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditClick = () => {
    if (disabled || isUploading) return;
    
    // Use original image if available, fallback to current image
    const imageUrlToEdit = originalImageUrl || currentImageUrl;
    if (!imageUrlToEdit) return;
    
    // Convert original image URL to file for editing
    fetch(imageUrlToEdit)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'profile-picture-original.jpg', { type: blob.type });
        setSelectedFile(file);
        setShowCropModal(true);
      })
      .catch(error => {
        console.error('Error loading image for editing:', error);
        setUploadError('שגיאה בטעינת התמונה לעריכה');
      });
  };

  const handleRemoveClick = () => {
    if (disabled) return;
    onImageRemove();
    setUploadError(null);
  };

  // Drag and drop handlers (desktop only)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer?.files || []);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Show crop modal instead of directly processing
      setSelectedFile(imageFile);
      setShowCropModal(true);
    }
  };

  // Check if device supports drag and drop (desktop)
  const supportsDragDrop = typeof window !== 'undefined' && 
    'draggable' in document.createElement('div') && 
    !('ontouchstart' in window); // Exclude touch devices

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Profile Picture Display */}
      <div 
        className={`relative ${SIZES[size]} rounded-full overflow-hidden border-2 transition-all duration-200 bg-gray-100 ${
          isDragOver 
            ? 'border-teal-400 border-dashed bg-teal-50' 
            : 'border-gray-200'
        }`}
        onDragOver={supportsDragDrop ? handleDragOver : undefined}
        onDragLeave={supportsDragDrop ? handleDragLeave : undefined}
        onDrop={supportsDragDrop ? handleDrop : undefined}
      >
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
        
        {/* Upload Overlay - Only show during drag or upload */}
        {!disabled && (isDragOver || isUploading) && (
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
              isDragOver 
                ? 'bg-teal-500 bg-opacity-80 opacity-100' 
                : 'bg-black bg-opacity-50 opacity-100'
            }`}
          >
            {isUploading ? (
              <FontAwesomeIcon icon={faSpinner} className="text-white text-lg animate-spin" />
            ) : isDragOver ? (
              <div className="text-center text-white">
                <FontAwesomeIcon icon={faCamera} className="text-xl mb-1" />
                <div className="text-xs font-medium">שחרר לכאן</div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex gap-2 justify-center">
          {!currentImageUrl ? (
            // Upload button for new images
            <Button
              variant="primary"
              size="sm"
              onClick={handleUploadClick}
              disabled={isUploading}
              icon={isUploading ? faSpinner : faCamera}
              className={isUploading ? 'animate-spin' : ''}
            >
              {supportsDragDrop ? 'הוספת תמונה או גרירה' : 'הוספת תמונה'}
            </Button>
          ) : (
            // Edit controls for existing images
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                disabled={isUploading}
                icon={faPencilAlt}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300"
                title="עריכת התמונה"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
                icon={faCamera}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                title="החלפת תמונה"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveClick}
                disabled={isUploading}
                icon={faTrash}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
                title="הסרת התמונה"
              />
            </div>
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
      
      {/* Crop Modal */}
      {showCropModal && selectedFile && (
        <ImageCropModal
          isOpen={showCropModal}
          imageFile={selectedFile}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};