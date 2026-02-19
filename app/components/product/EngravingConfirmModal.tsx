/**
 * EngravingConfirmModal Component - Product Personalization
 *
 * Confirmation modal before adding engraved item to cart
 * Uses Radix Dialog for accessibility
 * @see .cursor/skills/product-personalization/SKILL.md
 * @see prd.md Section 8.2
 */

import {useState, useMemo} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {clsx} from 'clsx';
import {X, AlertTriangle, CheckCircle2, User, Calendar, Hash} from 'lucide-react';
import {Button} from '~/components/ui';
import type {EngravingData} from './EngravingForm';

interface EngravingConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engravingData: EngravingData;
  productTitle: string;
  variantTitle?: string;
  recipientName?: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function EngravingConfirmModal({
  open,
  onOpenChange,
  engravingData,
  productTitle,
  variantTitle,
  recipientName,
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

  // Format clean date for display
  const formattedCleanDate = useMemo(() => {
    if (!engravingData.cleanDate) return null;
    const date = new Date(engravingData.cleanDate);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [engravingData.cleanDate]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/40"
          style={{zIndex: 9998}}
        />

        {/* Modal Content */}
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: 'calc(100% - 2rem)',
            maxWidth: '28rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#0A0A0A',
            borderRadius: '0.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          aria-describedby="engraving-confirm-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
            <Dialog.Title className="font-display text-lg font-bold text-white">
              Confirm Your Engraving
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className={clsx(
                  'p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05]',
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
            <div className="bg-white/[0.05] rounded-lg p-3">
              <p className="font-semibold text-white">{productTitle}</p>
              {variantTitle && variantTitle !== 'Default Title' && (
                <p className="text-body-sm text-white/50">{variantTitle}</p>
              )}
              {recipientName && (
                <p className="text-body-sm text-green-400 font-medium mt-1">
                  🎁 Gift for {recipientName}
                </p>
              )}
            </div>

            {/* Engraving Preview */}
            <div className="border-2 border-accent/30 rounded-lg p-4 bg-accent/5">
              <p className="text-caption font-semibold text-accent mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Your Engraving
              </p>

              {/* Individual Fields */}
              <div className="space-y-2">
                {engravingData.name && (
                  <div className="flex items-center gap-2 text-body-sm">
                    <User className="w-4 h-4 text-accent" />
                    <span className="text-white/50">Name:</span>
                    <span className="text-white font-medium">{engravingData.name}</span>
                  </div>
                )}
                {formattedCleanDate && (
                  <div className="flex items-center gap-2 text-body-sm">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-white/50">Clean Date:</span>
                    <span className="text-white font-medium">{formattedCleanDate}</span>
                  </div>
                )}
                {engravingData.years && (
                  <div className="flex items-center gap-2 text-body-sm">
                    <Hash className="w-4 h-4 text-white/40" />
                    <span className="text-white/50">Years:</span>
                    <span className="text-white font-medium">
                      {engravingData.years} {parseInt(engravingData.years, 10) === 1 ? 'Year' : 'Years'}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Private Note (if present) */}
            {engravingData.note && (
              <div className="bg-white/[0.05] rounded-lg p-3">
                <p className="text-caption font-semibold text-white/50 mb-1">
                  Private Note to Engraver
                </p>
                <p className="text-body-sm text-white/50 italic">
                  "{engravingData.note}"
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
                <p className="font-semibold text-white text-body-sm">
                  Custom engraving is non-refundable
                </p>
                <p className="text-body-sm text-white/50 mt-1">
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
                  : 'border-white/[0.1] hover:border-accent/30',
              )}
            >
              <span
                role="checkbox"
                aria-checked={isConfirmed}
                tabIndex={0}
                onClick={() => setIsConfirmed(!isConfirmed)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setIsConfirmed(!isConfirmed);
                  }
                }}
                className={clsx(
                  'mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors',
                  isConfirmed
                    ? 'bg-emerald-500/20 border-emerald-500/60'
                    : 'border-white/20 bg-white/[0.05]',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
                )}
              >
                {isConfirmed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="sr-only"
                tabIndex={-1}
              />
              <span className="text-body-sm text-white">
                I confirm this engraving is correct and understand it cannot be
                changed after ordering.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 p-4 border-t border-white/[0.08]"
            id="engraving-confirm-description"
          >
            <Dialog.Close asChild>
              <Button variant="secondary" className="flex-1" disabled={isSubmitting}>
                Back & Edit
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              className="flex-1 !h-auto !py-4"
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
