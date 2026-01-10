'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/image-crop';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Square, Maximize2 } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  fileName: string;
  onCropComplete: (croppedFile: File) => void;
  currentIndex?: number;
  totalImages?: number;
}

type AspectRatioOption = 'original' | 'square' | '4:3' | '3:4' | '16:9';

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  fileName,
  onCropComplete,
  currentIndex = 0,
  totalImages = 1,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('original');
  const [imageAspect, setImageAspect] = useState<number>(4 / 3);

  // Calculate image aspect ratio when image loads
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        setImageAspect(aspect);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const getAspectValue = (ratio: AspectRatioOption): number => {
    switch (ratio) {
      case 'square': return 1;
      case '4:3': return 4 / 3;
      case '3:4': return 3 / 4;
      case '16:9': return 16 / 9;
      case 'original': return imageAspect;
      default: return imageAspect;
    }
  };

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileName
      );
      onCropComplete(croppedFile);
      // Don't call onClose() here - let the parent control the modal state
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-4 sm:p-6 gap-3">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl">Crop & Adjust Your Photo</DialogTitle>
            {totalImages > 1 && (
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Photo {currentIndex + 1} of {totalImages}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Drag to reposition, scroll to zoom, and adjust the crop area
          </p>
        </DialogHeader>

        {/* Aspect Ratio Selector */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={aspectRatio === 'original' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAspectRatio('original')}
            className="gap-1.5 text-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Original
          </Button>
          <Button
            variant={aspectRatio === 'square' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAspectRatio('square')}
            className="gap-1.5 text-xs"
          >
            <Square className="h-3.5 w-3.5" />
            Square
          </Button>
          <Button
            variant={aspectRatio === '4:3' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAspectRatio('4:3')}
            className="text-xs"
          >
            4:3
          </Button>
          <Button
            variant={aspectRatio === '3:4' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAspectRatio('3:4')}
            className="text-xs"
          >
            3:4
          </Button>
          <Button
            variant={aspectRatio === '16:9' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAspectRatio('16:9')}
            className="text-xs"
          >
            16:9
          </Button>
        </div>

        {/* Cropper Area - Flexible height */}
        <div className="relative flex-1 min-h-[250px] bg-gray-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={getAspectValue(aspectRatio)}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            showGrid={true}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                backgroundColor: '#111827',
              },
            }}
          />
        </div>

        {/* Controls - Compact */}
        <div className="space-y-3">
          {/* Zoom Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <ZoomOut className="h-3.5 w-3.5" />
                Zoom
              </label>
              <span className="text-xs text-gray-600">{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Rotation Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <RotateCw className="h-3.5 w-3.5" />
                Rotation
              </label>
              <span className="text-xs text-gray-600">{rotation}°</span>
            </div>
            <Slider
              value={[rotation]}
              onValueChange={(values) => setRotation(values[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom, always visible */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
            className="gap-2 flex-1 order-2 sm:order-1"
          >
            <X className="h-4 w-4" />
            {totalImages > 1 ? 'Cancel Remaining' : 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="gap-2 flex-1 order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Check className="h-4 w-4" />
            {isProcessing ? 'Processing...' : (totalImages > 1 ? `Confirm (${currentIndex + 1}/${totalImages})` : 'Confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
