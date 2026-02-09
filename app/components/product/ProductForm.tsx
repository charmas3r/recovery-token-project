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
import {RecipientSelector, type RecipientSelection, type CircleAddData} from './RecipientSelector';
import type {RecoveryCircleMember} from '~/lib/recoveryCircle';

export function ProductForm({
  productOptions,
  selectedVariant,
  productTitle,
  recoveryCircle = [],
  isLoggedIn = false,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productTitle: string;
  recoveryCircle?: RecoveryCircleMember[];
  isLoggedIn?: boolean;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const fetcher = useFetcher();
  const circleFetcher = useFetcher();

  // Engraving state
  const [engravingData, setEngravingData] = useState<EngravingData>(EMPTY_ENGRAVING_DATA);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Recipient state
  const [recipientSelection, setRecipientSelection] = useState<RecipientSelection>({type: 'self'});

  // Circle add state (from gift flow opt-in)
  const [circleAddData, setCircleAddData] = useState<CircleAddData | null>(null);

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

    // Add recipient attributes
    if (recipientSelection.type === 'circle') {
      attributes.push({
        key: 'Recipient',
        value: recipientSelection.member.name,
      });
      attributes.push({
        key: '_Recipient Circle ID',
        value: recipientSelection.member.id,
      });
    } else if (recipientSelection.type === 'other' && recipientSelection.name.trim()) {
      attributes.push({
        key: 'Recipient',
        value: recipientSelection.name.trim(),
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

    // Fire-and-forget: add recipient to Recovery Circle if opted in
    if (circleAddData && circleAddData.name.trim().length >= 2) {
      const circleFormData = new FormData();
      circleFormData.set('formAction', 'gift-add');
      circleFormData.set('name', circleAddData.name);
      if (circleAddData.relationship) {
        circleFormData.set('relationship', circleAddData.relationship);
      }
      if (circleAddData.cleanDate) {
        circleFormData.set('cleanDate', circleAddData.cleanDate);
      }
      circleFetcher.submit(circleFormData, {
        method: 'POST',
        action: '/account/circle',
      });
    }

    // Close modal and open cart
    setShowConfirmModal(false);
    open('cart');

    // Reset engraving form, recipient, and circle data after successful add
    setEngravingData(EMPTY_ENGRAVING_DATA);
    setRecipientSelection({type: 'self'});
    setCircleAddData(null);
  }, [selectedVariant, engravingData, variantTitle, recipientSelection, circleAddData, fetcher, circleFetcher, open]);

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
                    // Selected state (always show selected styling regardless of availability)
                    'bg-primary text-white border-2 border-primary': selected,
                    // Available but not selected
                    'bg-white text-primary border-2 border-black/10 hover:border-accent/50':
                      !selected && available && exists,
                    // Unavailable and not selected
                    'bg-surface text-secondary/50 border-2 border-transparent cursor-not-allowed':
                      !selected && (!available || !exists),
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

      {/* Recipient Selector */}
      <RecipientSelector
        circle={recoveryCircle}
        selectedRecipient={recipientSelection}
        onChange={setRecipientSelection}
        isLoggedIn={isLoggedIn}
        onCircleAddChange={setCircleAddData}
      />

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
        recipientName={
          recipientSelection.type === 'circle'
            ? recipientSelection.member.name
            : recipientSelection.type === 'other'
              ? recipientSelection.name
              : undefined
        }
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
