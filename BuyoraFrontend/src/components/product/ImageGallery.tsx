'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProductImage, ProductVariant } from '@/types';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedVariant: ProductVariant | null;
}

export function ImageGallery({ images, productName, selectedVariant }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use variant images if available, otherwise use all images
  const displayImages =
    selectedVariant?.images && selectedVariant.images.length > 0 ? selectedVariant.images : images;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handlePrevious, handleNext]);

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="bg-muted flex aspect-square items-center justify-center rounded-xl">
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  const currentImage = displayImages[currentIndex] ?? displayImages[0];

  return (
    <div className="flex flex-col gap-4 md:flex-row-reverse">
      {/* Main Image */}
      <div className="bg-muted/20 group relative aspect-square flex-1 overflow-hidden rounded-xl">
        <Image
          src={currentImage.url}
          alt={currentImage.altText || productName}
          fill
          priority
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 60vw"
        />

        {/* Mobile Swipe Indicators */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 md:hidden">
          {displayImages.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                i === currentIndex ? 'bg-primary w-4' : 'bg-primary/30'
              )}
            />
          ))}
        </div>

        {/* Zoom Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 hidden opacity-0 transition-opacity group-hover:opacity-100 md:flex"
          onClick={() => setIsFullscreen(true)}
          aria-label="View full size"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="hide-scrollbar flex shrink-0 gap-3 overflow-x-auto pb-2 md:w-24 md:flex-col md:overflow-y-auto md:pb-0">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all md:w-full',
                index === currentIndex
                  ? 'border-primary ring-primary/20 ring-2'
                  : 'hover:border-primary/50 border-transparent'
              )}
            >
              <Image
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="bg-background/95 flex h-[90vh] w-full max-w-7xl flex-col items-center justify-center border-none p-0 backdrop-blur-sm">
          <DialogTitle className="sr-only">Image view</DialogTitle>
          <div className="relative flex h-full w-full items-center justify-center p-8">
            <Image
              src={currentImage.url}
              alt={currentImage.altText || productName}
              fill
              className="object-contain"
              quality={100}
            />

            {displayImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/50 hover:bg-background absolute top-1/2 left-4 -translate-y-1/2 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/50 hover:bg-background absolute top-1/2 right-4 -translate-y-1/2 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="bg-background/50 absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md">
                  {currentIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
          <DialogClose>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/50 hover:bg-background absolute top-4 right-4 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
