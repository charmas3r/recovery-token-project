# Feature: Product Detail Page (PDP) Redesign

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Transform the existing basic Product Detail Page into a world-class, design-system-compliant experience that matches the premium quality established on the homepage. The PDP will showcase recovery tokens with beautiful imagery, clear variant selection, trust-building elements, and a seamless path to purchase.

## User Story

As a **recovery celebrant or gift giver**
I want to **view detailed product information with high-quality images, clear pricing, and easy variant selection**
So that **I can confidently purchase the perfect recovery token for my milestone celebration**

## Problem Statement

The current PDP uses basic/default styling with generic CSS classes (`.product`, `.product-main`) and lacks the premium visual design, proper typography hierarchy, and trust-building elements established in the homepage design. This creates a jarring experience when users navigate from the beautifully designed homepage to a basic product page.

## Solution Statement

Redesign the PDP to follow the established design system patterns with:
- **Image Gallery**: Hero image with thumbnail navigation and zoom capability
- **Product Info Section**: Proper typography hierarchy (eyebrow, title, rating, price)
- **Styled Variant Selector**: Design-system-compliant option buttons
- **Trust Section**: Trust badges below add-to-cart for confidence
- **Related Products**: Cross-sell recommendations at page bottom
- **Breadcrumb Navigation**: Clear wayfinding back to collections
- **Mobile Sticky CTA**: Fixed add-to-cart button on mobile scroll

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium-High
**Primary Systems Affected**: 
- `app/routes/($locale).products.$handle.tsx`
- `app/components/product/*`
- `app/styles/tailwind.css` (may need minor additions)
**Dependencies**: 
- Existing design system tokens
- Hydrogen Image component
- Existing ProductForm, ProductPrice, RatingBadge components

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

**Route & Core Components:**
- `app/routes/($locale).products.$handle.tsx` (entire file) - **Current PDP implementation to redesign**
- `app/components/product/ProductForm.tsx` (entire file) - **Variant selector to restyle**
- `app/components/product/ProductImage.tsx` (entire file) - **Replace with gallery component**
- `app/components/product/ProductPrice.tsx` (entire file) - **Restyle with design tokens**
- `app/components/product/AddToCartButton.tsx` (entire file) - **Already uses Button component**
- `app/components/product/ProductItem.tsx` (entire file) - **Reference for product card styling**

**Design System:**
- `DESIGN-SYSTEM.md` (entire file) - **CRITICAL: Follow all patterns here**
- `.cursor/skills/design-system/SKILL.md` (entire file) - **Typography, colors, spacing tokens**
- `app/styles/tailwind.css` (lines 1-120) - **Design token definitions**
- `app/components/ui/Button.tsx` (entire file) - **Button styling reference**
- `app/components/ui/Card.tsx` (entire file) - **Card compound component pattern**

**Homepage Patterns:**
- `app/routes/($locale)._index.tsx` (lines 66-145) - **Hero section pattern**
- `app/routes/($locale)._index.tsx` (lines 147-197) - **Trust bar pattern for trust section**
- `app/routes/($locale)._index.tsx` (lines 318-374) - **Products grid pattern**

**Reviews Integration:**
- `app/components/reviews/RatingBadge.tsx` (entire file) - **Already integrated**
- `app/components/reviews/ReviewsWidget.tsx` - **Already integrated in PDP**

**Related Skills:**
- `.cursor/skills/cart-management/SKILL.md` - Cart patterns
- `.cursor/skills/product-personalization/SKILL.md` - Engraving form patterns (future)

### New Files to Create

- `app/components/product/ProductGallery.tsx` - Image gallery with thumbnails
- `app/components/product/ProductDetails.tsx` - Main product info section (optional refactor)
- `app/components/product/TrustBadges.tsx` - Trust indicators section
- `app/components/product/RelatedProducts.tsx` - Related products section
- `app/components/ui/Breadcrumbs.tsx` - Breadcrumb navigation component

### Files to Modify

- `app/routes/($locale).products.$handle.tsx` - Complete redesign of layout
- `app/components/product/ProductForm.tsx` - Restyle variant selector
- `app/components/product/ProductPrice.tsx` - Apply design tokens
- `app/styles/tailwind.css` - Add any missing utility classes (if needed)

### Relevant Documentation - YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Shopify Hydrogen Image Component](https://shopify.dev/docs/api/hydrogen/2025-01/components/image)
  - Image optimization and responsive sizing
  - Why: Used for gallery images
- [Hydrogen Product Variant Patterns](https://shopify.dev/docs/storefronts/headless/hydrogen/building/products-collections)
  - Variant selection best practices
  - Why: Reference for variant selector UX

### Patterns to Follow

**Typography Hierarchy (from DESIGN-SYSTEM.md):**

```tsx
// Eyebrow text pattern
<span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
  Recovery Token
</span>

// Product title
<h1 className="font-display text-page-title text-primary">
  {product.title}
</h1>

// Body text
<p className="text-body-lg text-secondary leading-relaxed">
  {product.description}
</p>
```

**Color Token Usage:**
- `text-primary` (#1A202C) - Headings, product title
- `text-secondary` (#4A5568) - Body text, descriptions
- `text-accent` (#B8764F) - Eyebrow text, price, highlights
- `bg-surface` (#F7FAFC) - Section backgrounds
- `bg-white` - Cards, primary backgrounds

**Spacing System (8px grid):**
- `gap-4` (16px) - Between small elements
- `gap-6` (24px) - Between medium elements
- `gap-8` (32px) - Between major sections
- `py-20 md:py-28` - Section vertical padding

**Button on Light Background:**
```tsx
<Button variant="primary" size="lg" className="w-full">
  Add to Cart
</Button>
```

**Container Classes:**
- `container-standard` (max-width: 1280px) - Standard pages
- `container-wide` (max-width: 1440px) - Visual-heavy pages

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation Components

Create reusable components that will be used in the PDP redesign.

**Tasks:**
1. Create `ProductGallery` component with thumbnail navigation
2. Create `TrustBadges` component for trust indicators
3. Create `Breadcrumbs` component for navigation
4. Create `RelatedProducts` component for cross-selling

### Phase 2: Core PDP Redesign

Redesign the main PDP route with proper layout and styling.

**Tasks:**
1. Update PDP route with new two-column layout
2. Integrate ProductGallery in left column
3. Create styled product info section in right column
4. Add breadcrumbs above product content

### Phase 3: Component Styling Updates

Update existing components to use design system tokens.

**Tasks:**
1. Restyle `ProductForm` variant selector
2. Restyle `ProductPrice` with design tokens
3. Add trust badges section below add-to-cart
4. Style reviews section with proper spacing

### Phase 4: Related Products & Polish

Add related products section and final polish.

**Tasks:**
1. Query for related products in loader
2. Add RelatedProducts section at page bottom
3. Add mobile sticky add-to-cart bar
4. Final responsive adjustments

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Task 1: CREATE `app/components/ui/Breadcrumbs.tsx`

- **IMPLEMENT**: Breadcrumb navigation component following design system
- **PATTERN**: Reference `app/components/product/ProductItem.tsx` for Link usage
- **IMPORTS**: 
  ```tsx
  import {Link} from 'react-router';
  import {ChevronRight} from 'lucide-react';
  ```

**Implementation:**

```tsx
/**
 * Breadcrumbs Component - Design System
 * 
 * Navigation breadcrumbs following Recovery Token Store design patterns
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Link} from 'react-router';
import {ChevronRight} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({items, className = ''}: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-body-sm ${className}`}
    >
      <Link 
        to="/" 
        className="text-secondary hover:text-accent transition-colors"
      >
        Home
      </Link>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-secondary/50" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="text-secondary hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

- **VALIDATE**: `npm run typecheck`

---

### Task 2: CREATE `app/components/product/ProductGallery.tsx`

- **IMPLEMENT**: Image gallery with main image and thumbnail strip
- **PATTERN**: Use Hydrogen Image component like `ProductItem.tsx`
- **IMPORTS**:
  ```tsx
  import {Image} from '@shopify/hydrogen';
  import {useState} from 'react';
  import type {ProductFragment} from 'storefrontapi.generated';
  ```

**Implementation:**

```tsx
/**
 * ProductGallery Component - Design System
 * 
 * Image gallery with thumbnails for PDP
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Image} from '@shopify/hydrogen';
import {useState} from 'react';
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
  // Use selected variant image or first image
  const initialIndex = selectedImage 
    ? images.findIndex(img => img.id === selectedImage.id) 
    : 0;
  const [activeIndex, setActiveIndex] = useState(Math.max(0, initialIndex));
  
  const activeImage = images[activeIndex] || images[0];
  
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
```

- **GOTCHA**: Handle case where selected variant image isn't in images array
- **VALIDATE**: `npm run typecheck`

---

### Task 3: CREATE `app/components/product/TrustBadges.tsx`

- **IMPLEMENT**: Trust indicators section (free shipping, secure checkout, etc.)
- **PATTERN**: Mirror `TrustBar` from homepage (`app/routes/($locale)._index.tsx` lines 150-196)
- **IMPORTS**:
  ```tsx
  import {Truck, ShieldCheck, RefreshCw, Award} from 'lucide-react';
  ```

**Implementation:**

```tsx
/**
 * TrustBadges Component - Design System
 * 
 * Trust indicators for product pages
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Truck, ShieldCheck, RefreshCw, Award} from 'lucide-react';

interface TrustBadge {
  icon: React.ReactNode;
  label: string;
}

const badges: TrustBadge[] = [
  {icon: <Truck className="w-5 h-5" />, label: 'Free shipping over $50'},
  {icon: <ShieldCheck className="w-5 h-5" />, label: 'Secure checkout'},
  {icon: <RefreshCw className="w-5 h-5" />, label: '30-day returns'},
  {icon: <Award className="w-5 h-5" />, label: 'Premium quality'},
];

export function TrustBadges({className = ''}: {className?: string}) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 text-body-sm text-secondary"
        >
          <span className="text-accent">{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
```

- **VALIDATE**: `npm run typecheck`

---

### Task 4: CREATE `app/components/product/RelatedProducts.tsx`

- **IMPLEMENT**: Related products section using ProductItem cards
- **PATTERN**: Follow `FeaturedProducts` from homepage (`app/routes/($locale)._index.tsx` lines 318-374)
- **IMPORTS**:
  ```tsx
  import {ProductItem} from './ProductItem';
  import type {RecommendedProductFragment} from 'storefrontapi.generated';
  ```

**Implementation:**

```tsx
/**
 * RelatedProducts Component - Design System
 * 
 * Related/recommended products section for PDP
 * @see .cursor/skills/design-system/SKILL.md
 */

import {ProductItem} from './ProductItem';
import type {RecommendedProductFragment} from 'storefrontapi.generated';
import {Link} from 'react-router';
import {Button} from '~/components/ui/Button';

interface RelatedProductsProps {
  products: RecommendedProductFragment[];
  currentProductId: string;
}

export function RelatedProducts({products, currentProductId}: RelatedProductsProps) {
  // Filter out current product and limit to 4
  const filteredProducts = products
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);
  
  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container-standard">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              You May Also Like
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
              Related Tokens
            </h2>
          </div>
          <Link to="/collections" className="hidden md:block">
            <Button variant="secondary" size="md">
              View All Tokens
            </Button>
          </Link>
        </div>
        
        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              loading="lazy"
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-10 md:hidden">
          <Link to="/collections">
            <Button variant="secondary" size="md">
              View All Tokens
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- **VALIDATE**: `npm run typecheck`

---

### Task 5: UPDATE `app/components/product/ProductPrice.tsx`

- **IMPLEMENT**: Apply design system typography tokens
- **PATTERN**: Use `text-page-title` for price, `text-secondary` for compare price

**Replace entire file with:**

```tsx
/**
 * ProductPrice Component - Design System
 * 
 * Price display with sale price support
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

interface ProductPriceProps {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
}

export function ProductPrice({
  price,
  compareAtPrice,
  className = '',
}: ProductPriceProps) {
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || '0');

  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      {price ? (
        <span className={`font-display text-2xl md:text-3xl font-bold ${isOnSale ? 'text-error' : 'text-primary'}`}>
          <Money data={price} />
        </span>
      ) : (
        <span className="font-display text-2xl md:text-3xl font-bold text-primary">
          &nbsp;
        </span>
      )}
      
      {isOnSale && compareAtPrice && (
        <span className="text-body text-secondary line-through">
          <Money data={compareAtPrice} />
        </span>
      )}
    </div>
  );
}
```

- **VALIDATE**: `npm run typecheck`

---

### Task 6: UPDATE `app/components/product/ProductForm.tsx`

- **IMPLEMENT**: Restyle variant selector with design system tokens
- **PATTERN**: Use design system Button-like styling for option buttons
- **IMPORTS**: Add `clsx` if not present

**Replace entire file with:**

```tsx
/**
 * ProductForm Component - Design System
 * 
 * Variant selector and add to cart form
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from '~/components/layout/Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {clsx} from 'clsx';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  
  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name} className="space-y-3">
            <h3 className="font-display text-base font-bold text-primary">
              {option.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const baseClasses = clsx(
                  'px-4 py-2 rounded-lg text-body font-medium transition-all duration-200',
                  'min-w-[44px] min-h-[44px]', // Touch target
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  {
                    // Selected state
                    'bg-primary text-white border-2 border-primary': selected,
                    // Available but not selected
                    'bg-white text-primary border-2 border-black/10 hover:border-accent/50': !selected && available && exists,
                    // Unavailable
                    'bg-surface text-secondary/50 border-2 border-transparent cursor-not-allowed': !available || !exists,
                  }
                );

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={baseClasses}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={baseClasses}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected && exists) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      
      {/* Add to Cart */}
      <div className="pt-4">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <span>{name}</span>;

  return (
    <div
      aria-label={name}
      className="w-6 h-6 rounded-full border border-black/10"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && (
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full rounded-full object-cover"
        />
      )}
    </div>
  );
}
```

- **VALIDATE**: `npm run typecheck`

---

### Task 7: UPDATE `app/components/ui/index.ts`

- **IMPLEMENT**: Export Breadcrumbs component
- **PATTERN**: Follow existing export pattern

**Add to exports:**

```tsx
export {Breadcrumbs} from './Breadcrumbs';
```

- **VALIDATE**: `npm run typecheck`

---

### Task 8: UPDATE `app/routes/($locale).products.$handle.tsx` - Query Updates

- **IMPLEMENT**: Add images and related products to GraphQL query
- **PATTERN**: Follow existing query structure

**Add to PRODUCT_FRAGMENT after line 345 (after `vendor`):**

```graphql
images(first: 10) {
  nodes {
    id
    url
    altText
    width
    height
  }
}
```

**Add to loadDeferredData function (line ~120-135):**

```typescript
// Fetch related products (same collection or recommended)
const relatedProducts = context.storefront
  .query(RECOMMENDED_PRODUCTS_QUERY)
  .catch((error: Error) => {
    console.error('Failed to fetch related products:', error);
    return null;
  });

return {reviewsSummary, hasJudgeme, relatedProducts};
```

**Add RECOMMENDED_PRODUCTS_QUERY at end of file:**

```typescript
const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
```

- **VALIDATE**: `npm run typecheck`

---

### Task 9: UPDATE `app/routes/($locale).products.$handle.tsx` - Complete Redesign

- **IMPLEMENT**: Redesign Product component with design system layout
- **PATTERN**: Two-column layout with proper spacing and hierarchy
- **IMPORTS**: Add at top of file:
  ```tsx
  import {Suspense} from 'react';
  import {Await} from 'react-router';
  import {ProductGallery} from '~/components/product/ProductGallery';
  import {TrustBadges} from '~/components/product/TrustBadges';
  import {RelatedProducts} from '~/components/product/RelatedProducts';
  import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
  import type {RecommendedProductsQuery} from 'storefrontapi.generated';
  ```

**Replace the Product component (starting at line ~180) with:**

```tsx
export default function Product() {
  const {product, reviewsSummary, hasJudgeme, relatedProducts} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, description, vendor, images} = product;
  const productId = extractProductId(product.id);

  // Build breadcrumb items
  const breadcrumbItems = [
    {label: 'Shop', href: '/collections'},
    {label: title},
  ];

  // Build product schema with reviews
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: selectedVariant?.image?.url,
    sku: selectedVariant?.sku,
    brand: {
      '@type': 'Brand',
      name: vendor || 'Recovery Token Store',
    },
    offers: {
      '@type': 'Offer',
      price: selectedVariant?.price.amount,
      priceCurrency: selectedVariant?.price.currencyCode,
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://recoverytoken.store/products/${product.handle}`,
    },
    aggregateRating: reviewsSummary && reviewsSummary.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: reviewsSummary.rating,
      reviewCount: reviewsSummary.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={productSchema} />

      {/* Main Product Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-standard">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-8" />

          {/* Two-Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Column - Gallery */}
            <div>
              <ProductGallery 
                images={images?.nodes || []}
                selectedImage={selectedVariant?.image}
              />
            </div>

            {/* Right Column - Product Info */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Eyebrow */}
              <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold">
                Recovery Token
              </span>

              {/* Product Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
                {title}
              </h1>

              {/* Rating Badge */}
              {reviewsSummary && reviewsSummary.reviewCount > 0 && (
                <RatingBadge
                  rating={reviewsSummary.rating}
                  reviewCount={reviewsSummary.reviewCount}
                />
              )}

              {/* Price */}
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />

              {/* Variant Selector & Add to Cart */}
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />

              {/* Trust Badges */}
              <TrustBadges className="pt-4 border-t border-black/5" />

              {/* Description */}
              <div className="pt-6 border-t border-black/5">
                <h2 className="font-display text-lg font-bold text-primary mb-4">
                  About This Token
                </h2>
                <div 
                  className="text-body text-secondary leading-relaxed prose prose-sm"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {hasJudgeme && (
        <section className="py-16 md:py-20 bg-surface">
          <div className="container-standard">
            <div className="text-center mb-12">
              <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
                Testimonials
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
                Customer Reviews
              </h2>
            </div>
            <ErrorBoundary FallbackComponent={ReviewsFallback}>
              <ReviewsWidget
                productId={productId}
                shopDomain={PUBLIC_JUDGEME_SHOP_DOMAIN}
              />
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* Related Products Section */}
      <Suspense fallback={null}>
        <Await resolve={relatedProducts}>
          {(resolvedProducts: RecommendedProductsQuery | null) => 
            resolvedProducts && (
              <RelatedProducts 
                products={resolvedProducts.products.nodes}
                currentProductId={product.id}
              />
            )
          }
        </Await>
      </Suspense>

      {/* Analytics */}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}
```

- **GOTCHA**: Make sure to import `Suspense` from 'react' and `Await` from 'react-router'
- **GOTCHA**: Update the loader return type to include `relatedProducts`
- **VALIDATE**: `npm run typecheck && npm run dev`

---

### Task 10: Remove Legacy CSS Classes

- **IMPLEMENT**: Remove or update legacy `.product` and `.product-main` CSS if they conflict
- **PATTERN**: The new implementation uses Tailwind classes exclusively

**In `app/styles/tailwind.css`, locate the Product Detail Page section (lines ~513-527) and update:**

```css
/* Product Detail Page - Legacy (can be removed once redesign is complete) */
/* Keep for backward compatibility during transition */
.product {
  display: grid;
  gap: var(--spacing-2xl);
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-4xl);
  }
}

.product-main {
  align-self: start;
  position: sticky;
  top: calc(var(--header-height) + var(--spacing-xl));
}
```

- **NOTE**: These classes are no longer used in the new implementation. Can be removed entirely or kept for reference.
- **VALIDATE**: `npm run dev` - check PDP renders correctly

---

## TESTING STRATEGY

### Manual Testing

1. **Desktop View**:
   - Verify two-column layout with gallery on left, info on right
   - Check sticky behavior of product info on scroll
   - Verify image gallery thumbnail navigation works
   - Test variant selection updates URL and image
   - Verify add to cart opens cart drawer

2. **Mobile View (< 768px)**:
   - Gallery stacks above product info
   - Thumbnail strip scrolls horizontally
   - All touch targets are minimum 44px
   - Full-width add to cart button

3. **Typography & Design**:
   - Eyebrow text uses accent color, uppercase, letter spacing
   - Product title uses `font-display`, proper size
   - Price is prominent with design tokens
   - Trust badges display correctly

4. **Related Products**:
   - Section appears below reviews
   - Current product is filtered out
   - Products use ProductItem component styling

### Edge Cases

- Product with no images
- Product with single variant (no selector shown)
- Product with no reviews
- Product sold out
- Compare at price (sale pricing)

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Type Checking

```bash
npm run typecheck
```

### Level 2: Linting

```bash
npm run lint
```

### Level 3: Build

```bash
npm run build
```

### Level 4: Development Server

```bash
npm run dev
```

### Level 5: Manual Validation

1. Navigate to a product page (e.g., `/products/sunflower-token`)
2. Verify design matches design system patterns
3. Test variant selection
4. Test add to cart
5. Check mobile responsiveness
6. Verify related products section

---

## ACCEPTANCE CRITERIA

- [ ] PDP uses design system typography tokens (eyebrow, title, body)
- [ ] PDP uses design system color tokens (primary, secondary, accent, surface)
- [ ] Image gallery displays with thumbnail navigation
- [ ] Variant selector styled with design system buttons
- [ ] Trust badges section appears below add to cart
- [ ] Related products section appears at bottom
- [ ] Breadcrumbs provide navigation context
- [ ] Mobile layout is responsive and usable
- [ ] All touch targets minimum 44px
- [ ] Rating badge displays when reviews exist
- [ ] Add to cart opens cart drawer
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Builds successfully

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met
- [ ] Code follows project conventions and patterns

---

## NOTES

### Design Decisions

1. **Sticky Product Info**: Right column is sticky on desktop for better UX when scrolling
2. **Gallery First on Mobile**: Image gallery appears above product info on mobile (natural flow)
3. **Trust Badges Position**: Placed below add-to-cart to reinforce purchase confidence
4. **Related Products**: Uses deferred loading to not block initial page render

### Future Enhancements (Not in Scope)

1. **Engraving Form**: Will be added in a future task using `.cursor/skills/product-personalization/SKILL.md`
2. **Image Zoom**: Could add lightbox/zoom on click
3. **Sticky Mobile CTA**: Could add fixed add-to-cart bar at bottom on mobile scroll
4. **Product Tabs**: Could organize description/specs/reviews in tabs

### Breaking Changes

None - this is an enhancement to existing functionality. All GraphQL queries are additive.

### Performance Considerations

- Related products are deferred (don't block LCP)
- Images use Hydrogen's optimized Image component
- Thumbnails use small `sizes` attribute (80px)
