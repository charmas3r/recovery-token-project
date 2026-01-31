/**
 * Reviews Widget Component
 * 
 * Loads and displays the Judge.me reviews widget for a product.
 * Uses lazy loading with Intersection Observer for performance.
 */

import {useEffect, useRef, useState} from 'react';

interface ReviewsWidgetProps {
  productId: string;
  shopDomain: string;
}

export function ReviewsWidget({productId, shopDomain}: ReviewsWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Lazy load when scrolled near
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {rootMargin: '200px'} // Load 200px before visible
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  // Load Judge.me script when visible
  useEffect(() => {
    if (!isVisible) return;

    // Check if script already loaded
    if (window.jdgm) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.judge.me/loader.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
      // Trigger Judge.me initialization
      if (window.jdgm) {
        window.jdgm.init();
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isVisible]);

  return (
    <div ref={ref} className="min-h-[400px]">
      {!isLoaded && <ReviewsSkeleton />}
      <div
        id="judgeme_product_reviews"
        className="jdgm-widget jdgm-review-widget"
        data-product-id={productId}
        data-shop-domain={shopDomain}
      />
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      {Array.from({length: 3}).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-32" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Extend Window type for Judge.me
declare global {
  interface Window {
    jdgm?: {
      init: () => void;
    };
  }
}
