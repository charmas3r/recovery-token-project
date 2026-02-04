/**
 * ProductGallery Component - Design System
 * 
 * Image gallery with thumbnails for PDP
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Image} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import type {ProductVariantFragment} from 'storefrontapi.generated';

interface ProductGalleryProps {
  images: Array<{
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  }>;
  selectedImage?: ProductVariantFragment['image'];
}

export function ProductGallery({images, selectedImage}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset to first image (or selected variant image) when images array changes
  // This happens when switching color variants
  useEffect(() => {
    if (selectedImage) {
      const newIndex = images.findIndex(img => img.id === selectedImage.id);
      if (newIndex >= 0) {
        setActiveIndex(newIndex);
        return;
      }
    }
    // Reset to first image when images array changes
    setActiveIndex(0);
  }, [selectedImage?.id, images]);

  // Ensure activeIndex is within bounds (for edge cases)
  const safeIndex = Math.min(Math.max(0, activeIndex), Math.max(0, images.length - 1));
  const activeImage = images[safeIndex] || images[0];
  
  if (!images.length) {
    return (
      <div className="aspect-square bg-surface rounded-2xl flex items-center justify-center">
        <span className="text-secondary">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-surface rounded-2xl overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-8 bg-accent/5 blur-3xl rounded-full" />
        
        <Image
          data={activeImage}
          aspectRatio="1/1"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="relative w-full h-full object-contain"
        />
      </div>
      
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === activeIndex
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-transparent hover:border-accent/30'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                data={image}
                aspectRatio="1/1"
                sizes="80px"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
