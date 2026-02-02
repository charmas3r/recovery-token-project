/**
 * ProductForm Component - Design System
 *
 * Variant selector, engraving form, and add to cart
 * @see .cursor/skills/design-system/SKILL.md
 * @see .cursor/skills/product-personalization/SKILL.md
 */

import {useState, useCallback} from 'react';
import {Link, useNavigate, useFetcher} from 'react-router';
import {type MappedProductOptions, CartForm} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {useAside} from '~/components/layout/Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {clsx} from 'clsx';
import {Button} from '~/components/ui';
import {
  EngravingForm,
  type EngravingData,
  EMPTY_ENGRAVING_DATA,
  isEngravingComplete,
  formatEngravingPreview,
} from './EngravingForm';
import {EngravingConfirmModal} from './EngravingConfirmModal';

export function ProductForm({
  productOptions,
  selectedVariant,
  productTitle,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productTitle: string;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const fetcher = useFetcher();

  // Engraving state
  const [engravingData, setEngravingData] = useState<EngravingData>(EMPTY_ENGRAVING_DATA);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isSubmitting = fetcher.state !== 'idle';
  const variantTitle = selectedVariant?.title;
  const hasEngraving = isEngravingComplete(engravingData, variantTitle);

  // Handle add to cart click
  const handleAddToCartClick = useCallback(() => {
    if (hasEngraving) {
      // Show confirmation modal for engraved items
      setShowConfirmModal(true);
    } else {
      // Add to cart directly for non-engraved items
      submitToCart();
    }
  }, [hasEngraving]);

  // Submit to cart (called directly or after modal confirmation)
  const submitToCart = useCallback(() => {
    if (!selectedVariant) return;

    // Build attributes array for engraving - each field as separate attribute
    const attributes: Array<{key: string; value: string}> = [];

    if (engravingData.name.trim()) {
      attributes.push({
        key: 'Engraving Name',
        value: engravingData.name.trim(),
      });
    }

    if (engravingData.years.trim()) {
      attributes.push({
        key: 'Engraving Years',
        value: engravingData.years.trim(),
      });
    }

    if (engravingData.cleanDate.trim()) {
      // Format date for display
      const date = new Date(engravingData.cleanDate);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      attributes.push({
        key: 'Engraving Clean Date',
        value: formattedDate,
      });
    }

    // Also include a combined preview for easy viewing
    const preview = formatEngravingPreview(engravingData, variantTitle);
    if (preview) {
      attributes.push({
        key: 'Engraving Preview',
        value: preview,
      });
    }

    if (engravingData.note.trim()) {
      // Underscore prefix hides from packing slip (private note)
      attributes.push({
        key: '_Engraving Note',
        value: engravingData.note.trim(),
      });
    }

    const lines = [
      {
        merchandiseId: selectedVariant.id,
        quantity: 1,
        attributes: attributes.length > 0 ? attributes : undefined,
      },
    ];

    // Submit via fetcher
    fetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.LinesAdd,
          inputs: {lines},
        }),
      },
      {method: 'POST', action: '/cart'},
    );

    // Close modal and open cart
    setShowConfirmModal(false);
    open('cart');

    // Reset engraving form after successful add
    setEngravingData(EMPTY_ENGRAVING_DATA);
  }, [selectedVariant, engravingData, variantTitle, fetcher, open]);

  // Handle modal confirmation
  const handleConfirmEngraving = useCallback(() => {
    submitToCart();
  }, [submitToCart]);

  return (
    <div className="space-y-6">
      {/* Variant Options */}
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
                    'bg-white text-primary border-2 border-black/10 hover:border-accent/50':
                      !selected && available && exists,
                    // Unavailable
                    'bg-surface text-secondary/50 border-2 border-transparent cursor-not-allowed':
                      !available || !exists,
                  },
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

      {/* Engraving Form */}
      <EngravingForm
        value={engravingData}
        onChange={setEngravingData}
        selectedVariantTitle={variantTitle}
        disabled={!selectedVariant?.availableForSale || isSubmitting}
      />

      {/* Add to Cart Button */}
      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleAddToCartClick}
          disabled={
            !selectedVariant ||
            !selectedVariant.availableForSale ||
            isSubmitting
          }
        >
          {isSubmitting
            ? 'Adding...'
            : selectedVariant?.availableForSale
              ? hasEngraving
                ? 'Review Engraving & Add to Cart'
                : 'Add to Cart'
              : 'Sold Out'}
        </Button>
      </div>

      {/* Engraving Confirmation Modal */}
      <EngravingConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        engravingData={engravingData}
        productTitle={productTitle}
        variantTitle={selectedVariant?.title}
        onConfirm={handleConfirmEngraving}
        isSubmitting={isSubmitting}
      />
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
