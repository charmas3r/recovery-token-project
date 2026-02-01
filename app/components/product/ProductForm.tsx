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
