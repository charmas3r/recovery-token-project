/**
 * Rating Badge Component
 * 
 * Displays star rating and review count for a product.
 * Used on product pages, collection pages, and search results.
 */

import {Star} from 'lucide-react';

interface RatingBadgeProps {
  rating: number; // 0-5
  reviewCount: number;
  className?: string;
}

export function RatingBadge({rating, reviewCount, className = ''}: RatingBadgeProps) {
  if (reviewCount === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center">
          {Array.from({length: 5}).map((_, i) => (
            <Star key={i} className="h-5 w-5 text-gray-300" />
          ))}
        </div>
        <span className="text-sm text-gray-600">No reviews yet</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center" role="img" aria-label={`${rating} out of 5 stars`}>
        {Array.from({length: 5}).map((_, i) => {
          const isFilled = i < Math.floor(rating);
          const isPartial = i === Math.floor(rating) && rating % 1 !== 0;

          return (
            <Star
              key={i}
              className={`h-5 w-5 ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isPartial
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
