/**
 * EngravingConfirmModal Component - Product Personalization
 *
 * Confirmation modal before adding engraved item to cart
 * Uses Radix Dialog for accessibility
 * @see .cursor/skills/product-personalization/SKILL.md
 * @see prd.md Section 8.2
 */

import {useState} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {clsx} from 'clsx';
import {X, AlertTriangle, CheckCircle2} from 'lucide-react';
import {Button} from '~/components/ui';
import type {EngravingData} from './EngravingForm';

interface EngravingConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engravingData: EngravingData;
  productTitle: string;
  variantTitle?: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function EngravingConfirmModal({
  open,
  onOpenChange,
  engravingData,
  productTitle,
  variantTitle,
  onConfirm,
  isSubmitting = false,
}: EngravingConfirmModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset confirmation when modal opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsConfirmed(false);
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={clsx(
            'fixed inset-0 bg-black/40 z-50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />

        {/* Modal Content */}
        <Dialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full max-w-md max-h-[90vh] overflow-y-auto',
            'bg-white rounded-xl shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200',
          )}
          aria-describedby="engraving-confirm-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-black/5">
            <Dialog.Title className="font-display text-lg font-bold text-primary">
              Confirm Your Engraving
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className={clsx(
                  'p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Product Info */}
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="font-semibold text-primary">{productTitle}</p>
              {variantTitle && variantTitle !== 'Default Title' && (
                <p className="text-body-sm text-secondary">{variantTitle}</p>
              )}
            </div>

            {/* Engraving Preview */}
            <div className="border-2 border-accent/30 rounded-lg p-4 bg-accent/5">
              <p className="text-caption font-semibold text-accent mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Your Engraving
              </p>
              <p className="font-display text-xl text-primary text-center tracking-wide py-2">
                {engravingData.engravingText}
              </p>
            </div>

            {/* Private Note (if present) */}
            {engravingData.engravingNote && (
              <div className="bg-surface/50 rounded-lg p-3">
                <p className="text-caption font-semibold text-secondary mb-1">
                  Private Note to Engraver
                </p>
                <p className="text-body-sm text-secondary italic">
                  "{engravingData.engravingNote}"
                </p>
              </div>
            )}

            {/* Warning */}
            <div
              className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg"
              role="alert"
            >
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary text-body-sm">
                  Custom engraving is non-refundable
                </p>
                <p className="text-body-sm text-secondary mt-1">
                  Please double-check the spelling and content before confirming.
                  Engraved items cannot be returned or exchanged.
                </p>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <label
              className={clsx(
                'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors',
                isConfirmed
                  ? 'border-accent bg-accent/5'
                  : 'border-black/10 hover:border-accent/30',
              )}
            >
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className={clsx(
                  'mt-0.5 w-5 h-5 rounded border-2 text-accent',
                  'focus:ring-2 focus:ring-accent focus:ring-offset-2',
                )}
              />
              <span className="text-body-sm text-primary">
                I confirm this engraving is correct and understand it cannot be
                changed after ordering.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 p-4 border-t border-black/5"
            id="engraving-confirm-description"
          >
            <Dialog.Close asChild>
              <Button variant="secondary" className="flex-1" disabled={isSubmitting}>
                Back & Edit
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleConfirm}
              disabled={!isConfirmed || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Confirm & Add to Cart'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
