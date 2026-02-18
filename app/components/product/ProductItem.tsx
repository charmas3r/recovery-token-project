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
  /** Visual variant — "light" for default white cards, "dark" for sleek dark cards */
  variant?: 'light' | 'dark';
}

export function ProductItem({
  product,
  loading,
  rating = 5,
  reviewCount,
  showRating = true,
  variant = 'light',
}: ProductItemProps) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const isDark = variant === 'dark';

  return (
    <Link
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      className="group block focus:outline-none"
    >
      <div className={
        isDark
          ? 'rounded-2xl overflow-hidden border border-white/[0.08] transition-all duration-300 hover:-translate-y-1'
          : 'bg-white rounded-xl overflow-hidden border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1'
      } style={isDark ? {background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'} : undefined}>
        {/* Product Image - 4:5 aspect ratio (design system) */}
        {image && (
          <div className={`aspect-[4/5] relative overflow-hidden ${isDark ? 'bg-black/40' : 'bg-surface'}`}>
            <Image
              alt={image.altText || product.title}
              aspectRatio="4/5"
              data={image}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Subtle overlay on hover */}
            <div className={`absolute inset-0 transition-colors duration-300 ${isDark ? 'bg-white/0 group-hover:bg-white/[0.03]' : 'bg-black/0 group-hover:bg-black/5'}`} />
          </div>
        )}

        {/* Product Content */}
        <div className="p-5">
          {/* Product Title - 2 lines max */}
          <h3 className={`text-base md:text-lg font-display font-bold uppercase tracking-tight line-clamp-2 mb-2 transition-colors duration-200 ${isDark ? 'text-white group-hover:text-white/80' : 'text-primary group-hover:text-accent'}`}>
            {product.title}
          </h3>

          {/* Star Rating */}
          {showRating && (
            <ProductRating rating={rating} reviewCount={reviewCount} dark={isDark} />
          )}

          {/* Product Price */}
          <p className={`text-lg md:text-xl font-bold ${isDark ? 'text-white/90' : 'text-black'}`}>
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
  dark = false,
}: {
  rating: number;
  reviewCount?: number;
  dark?: boolean;
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
                  : dark
                  ? 'text-white/20 fill-white/20'
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
        <span className={`text-xs ${dark ? 'text-white/40' : 'text-secondary'}`}>
          ({reviewCount})
        </span>
      ) : (
        <span className={`text-xs font-medium ${dark ? 'text-accent' : 'text-accent'}`}>
          New
        </span>
      )}
    </div>
  );
}
