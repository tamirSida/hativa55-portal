'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faSearchPlus, faSearchMinus, faRedo } from '@fortawesome/free-solid-svg-icons';
import { Button } from './Button';

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

interface ImageState {
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

const MIN_SCALE = 0.1; // Allow much more zoom out
const MAX_SCALE = 3;
const CANVAS_SIZE = 400; // Size of the circular crop area

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageFile,
  onCrop,
  onCancel
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0
  });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image when modal opens
  useEffect(() => {
    if (isOpen && imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        // Auto-fit image to circle
        const minDimension = Math.min(img.width, img.height);
        const initialScale = CANVAS_SIZE / minDimension;
        setImageState({
          scale: Math.max(initialScale, MIN_SCALE),
          x: 0,
          y: 0,
          rotation: 0
        });
      };
      img.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [isOpen, imageFile]);

  // Draw image on canvas
  const drawImage = useCallback(() => {
    if (!canvasRef.current || !imageElement) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    
    // Calculate image position and size
    const scaledWidth = imageElement.width * imageState.scale;
    const scaledHeight = imageElement.height * imageState.scale;
    
    const drawX = (CANVAS_SIZE - scaledWidth) / 2 + imageState.x;
    const drawY = (CANVAS_SIZE - scaledHeight) / 2 + imageState.y;
    
    // Apply rotation if needed
    if (imageState.rotation !== 0) {
      ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.rotate((imageState.rotation * Math.PI) / 180);
      ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
    }
    
    // Draw image
    ctx.drawImage(imageElement, drawX, drawY, scaledWidth, scaledHeight);
    ctx.restore();
    
    // Draw circle border
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [imageElement, imageState]);

  // Redraw when image state changes
  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Mouse/touch event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - imageState.x,
        y: e.clientY - rect.top - imageState.y
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !canvasRef.current) return;
    
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    setImageState(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setImageState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale + delta))
    }));
  };

  // Reset to initial state
  const handleReset = () => {
    if (imageElement) {
      const minDimension = Math.min(imageElement.width, imageElement.height);
      const initialScale = CANVAS_SIZE / minDimension;
      setImageState({
        scale: Math.max(initialScale, MIN_SCALE),
        x: 0,
        y: 0,
        rotation: 0
      });
    }
  };

  // Generate cropped image
  const handleCrop = async () => {
    if (!canvasRef.current || !imageElement) return;
    
    setIsProcessing(true);
    
    try {
      // Create a new canvas for the final output
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = CANVAS_SIZE;
      outputCanvas.height = CANVAS_SIZE;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) return;
      
      // Draw the cropped image
      outputCtx.save();
      outputCtx.beginPath();
      outputCtx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
      outputCtx.clip();
      
      const scaledWidth = imageElement.width * imageState.scale;
      const scaledHeight = imageElement.height * imageState.scale;
      const drawX = (CANVAS_SIZE - scaledWidth) / 2 + imageState.x;
      const drawY = (CANVAS_SIZE - scaledHeight) / 2 + imageState.y;
      
      if (imageState.rotation !== 0) {
        outputCtx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
        outputCtx.rotate((imageState.rotation * Math.PI) / 180);
        outputCtx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
      }
      
      outputCtx.drawImage(imageElement, drawX, drawY, scaledWidth, scaledHeight);
      outputCtx.restore();
      
      // Convert to blob and create file
      outputCanvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: 'image/png',
            lastModified: Date.now()
          });
          onCrop(croppedFile);
        }
      }, 'image/png', 0.9);
      
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            עריכת תמונת פרופיל
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative mx-auto mb-4 select-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="border border-gray-200 rounded-full cursor-move touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
            
            {/* Instructions */}
            <div className="text-center text-sm text-gray-500 mt-2">
              {typeof window !== 'undefined' && 'ontouchstart' in window 
                ? 'גע וגרור להזזה • השתמש בכפתורים לזום'
                : 'גרור להזזה • השתמש בכפתורים לזום'
              }
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(-0.1)}
              disabled={imageState.scale <= MIN_SCALE}
            >
              <FontAwesomeIcon icon={faSearchMinus} className="w-4 h-4" />
            </Button>
            
            <div className="text-sm text-gray-600 min-w-16 text-center">
              {Math.round(imageState.scale * 100)}%
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(0.1)}
              disabled={imageState.scale >= MAX_SCALE}
            >
              <FontAwesomeIcon icon={faSearchPlus} className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="mr-2"
            >
              <FontAwesomeIcon icon={faRedo} className="w-4 h-4 ml-1" />
              איפוס
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            ביטול
          </Button>
          <Button
            variant="primary"
            onClick={handleCrop}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'מעבד...' : 'שמור'}
            {!isProcessing && <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};