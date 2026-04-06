/**
 * SEOProductCard
 *
 * Product card for SEO landing pages. Renders product with image, title,
 * price, and "Shop Now" link. Uses live Storefront API data passed from
 * route loader.
 */

import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

interface SEOProductCardProps {
  product: {
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      id?: string;
      altText?: string | null;
      url: string;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
  };
  loading?: 'eager' | 'lazy';
}

export function SEOProductCard({product, loading}: SEOProductCardProps) {
  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-2xl"
    >
      <div
        className="rounded-2xl overflow-hidden border border-white/[0.08] transition-all duration-300 hover:border-white/[0.15] hover:-translate-y-1"
        style={{
          background:
            'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
        }}
      >
        {product.featuredImage && (
          <div className="aspect-[4/5] relative overflow-hidden bg-black/40">
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="4/5"
              data={product.featuredImage}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        <div className="p-5">
          <h3 className="text-base md:text-lg font-display font-bold uppercase tracking-tight line-clamp-2 mb-2 text-white group-hover:text-white/80 transition-colors">
            {product.title}
          </h3>
          <p className="text-lg md:text-xl font-bold text-white/90 mb-3">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
          <span className="inline-block text-accent text-sm font-semibold group-hover:underline">
            Shop Now &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
