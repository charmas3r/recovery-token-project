/**
 * ProductItem Component - Design System
 * 
 * Product card following Recovery Token Store design system
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

interface ProductItemProps {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  /** Star rating to display (0-5). Shows 5 stars by default */
  rating?: number;
  /** Number of reviews. Shows "New" badge if undefined or 0 */
  reviewCount?: number;
  /** Whether to show the rating display */
  showRating?: boolean;
}

export function ProductItem({
  product,
  loading,
  rating = 5,
  reviewCount,
  showRating = true,
}: ProductItemProps) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  
  return (
    <Link
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      className="group block focus:outline-none"
    >
      <div className="bg-white rounded-xl overflow-hidden border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1">
        {/* Product Image - 4:5 aspect ratio (design system) */}
        {image && (
          <div className="aspect-[4/5] bg-surface relative overflow-hidden">
            <Image
              alt={image.altText || product.title}
              aspectRatio="4/5"
              data={image}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
        )}
        
        {/* Product Content */}
        <div className="p-5">
          {/* Product Title - 2 lines max */}
          <h3 className="text-base md:text-lg font-display font-bold text-primary uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-accent transition-colors duration-200">
            {product.title}
          </h3>
          
          {/* Star Rating */}
          {showRating && (
            <ProductRating rating={rating} reviewCount={reviewCount} />
          )}
          
          {/* Product Price - Bold accent color */}
          <p className="text-lg md:text-xl font-bold text-black">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Product Rating Component
 * Displays star rating with optional review count
 */
function ProductRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  const hasReviews = reviewCount !== undefined && reviewCount > 0;
  
  return (
    <div className="flex items-center gap-2 mb-2">
      {/* Stars */}
      <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
        {Array.from({length: 5}).map((_, i) => {
          const isFilled = i < Math.floor(rating);
          const isPartial = i === Math.floor(rating) && rating % 1 !== 0;
          
          return (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className={`w-4 h-4 ${
                isFilled
                  ? 'text-yellow-400 fill-yellow-400'
                  : isPartial
                  ? 'text-yellow-400 fill-yellow-400/50'
                  : 'text-gray-300 fill-gray-300'
              }`}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          );
        })}
      </div>
      
      {/* Review count or "New" badge */}
      {hasReviews ? (
        <span className="text-xs text-secondary">
          ({reviewCount})
        </span>
      ) : (
        <span className="text-xs font-medium text-accent">
          New
        </span>
      )}
    </div>
  );
}
