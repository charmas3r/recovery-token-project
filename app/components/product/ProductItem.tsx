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

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
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
          
          {/* Product Price - Bold accent color */}
          <p className="text-lg md:text-xl font-bold text-black">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
        </div>
      </div>
    </Link>
  );
}
