/**
 * WriteReviewModal - Product review submission form
 *
 * Radix Dialog modal with star rating, quality pills, and useFetcher.
 * Matches EngravingConfirmModal pattern for consistency.
 */

import {useState, useEffect} from 'react';
import {useFetcher} from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {clsx} from 'clsx';
import {X, CheckCircle2, Camera} from 'lucide-react';
import {Button} from '~/components/ui';
import {StarRatingInput} from './StarRatingInput';
import {QUALITY_OPTIONS} from '~/lib/validation';

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productHandle: string;
  productTitle: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export function WriteReviewModal({
  open,
  onOpenChange,
  productId,
  productHandle,
  productTitle,
}: WriteReviewModalProps) {
  const fetcher = useFetcher<ActionData>();

  const [rating, setRating] = useState(0);
  const [quality, setQuality] = useState('');

  const isSubmitting = fetcher.state !== 'idle';
  const isSuccess = fetcher.data?.success === true;
  const fieldErrors = fetcher.data?.fieldErrors;
  const serverError = fetcher.data?.error;

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRating(0);
      setQuality('');
    }
    onOpenChange(newOpen);
  };

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => handleOpenChange(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 bg-black/40"
            style={{zIndex: 9998}}
          />
          <Dialog.Content
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: 'calc(100% - 2rem)',
              maxWidth: '28rem',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <Dialog.Title className="sr-only">Review Submitted</Dialog.Title>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-primary mb-2">
              Thank You!
            </h3>
            <p className="text-body text-secondary">
              Your review for{' '}
              <span className="font-semibold text-primary">{productTitle}</span>{' '}
              has been submitted and will appear after moderation.
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/40"
          style={{zIndex: 9998}}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: 'calc(100% - 2rem)',
            maxWidth: '32rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
          aria-describedby="write-review-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-black/5">
            <Dialog.Title className="font-display text-lg font-bold text-primary">
              Write a Review
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
          <fetcher.Form method="post" action="/reviews/submit" className="p-4 space-y-5">
            {/* Hidden fields */}
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="productHandle" value={productHandle} />
            <input type="hidden" name="rating" value={rating} />
            <input type="hidden" name="quality" value={quality} />

            {/* Honeypot */}
            <div style={{position: 'absolute', left: '-9999px'}} aria-hidden="true">
              <label htmlFor="review-website">Website</label>
              <input
                type="text"
                id="review-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Product name context */}
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="font-semibold text-primary text-sm">{productTitle}</p>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <StarRatingInput
                value={rating}
                onChange={setRating}
                error={fieldErrors?.rating}
              />
            </div>

            {/* Headline */}
            <div>
              <label
                htmlFor="review-title"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Headline <span className="text-red-500">*</span>
              </label>
              <input
                id="review-title"
                name="title"
                type="text"
                placeholder="Summarize your experience"
                maxLength={150}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-primary',
                  'placeholder:text-secondary/50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
                  fieldErrors?.title ? 'border-red-400' : 'border-black/10',
                )}
              />
              {fieldErrors?.title && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.title}</p>
              )}
            </div>

            {/* Review Body */}
            <div>
              <label
                htmlFor="review-body"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="review-body"
                name="body"
                rows={4}
                placeholder="What did you think of this token? How does it feel in your hand?"
                maxLength={5000}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-primary resize-y',
                  'placeholder:text-secondary/50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
                  fieldErrors?.body ? 'border-red-400' : 'border-black/10',
                )}
              />
              {fieldErrors?.body && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.body}</p>
              )}
            </div>

            {/* Quality Question */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                How would you describe the quality?
              </label>
              <div className="flex flex-wrap gap-2">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setQuality(quality === option ? '' : option)
                    }
                    className={clsx(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all',
                      'border focus:outline-none focus:ring-2 focus:ring-accent',
                      quality === option
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-secondary border-black/10 hover:border-accent/40 hover:text-primary',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload Placeholder */}
            <div className="opacity-50 pointer-events-none">
              <label className="block text-sm font-semibold text-primary mb-2">
                Photos
                <span className="ml-2 text-xs font-normal text-secondary">
                  Coming soon
                </span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-black/10 text-sm text-secondary">
                <Camera className="w-4 h-4" />
                Photo upload coming soon
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="review-name"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-name"
                name="name"
                type="text"
                placeholder="How should we display your name?"
                maxLength={100}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-primary',
                  'placeholder:text-secondary/50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
                  fieldErrors?.name ? 'border-red-400' : 'border-black/10',
                )}
              />
              {fieldErrors?.name && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="review-email"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="review-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-primary',
                  'placeholder:text-secondary/50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
                  fieldErrors?.email ? 'border-red-400' : 'border-black/10',
                )}
              />
              <p className="text-xs text-secondary mt-1">
                Your email will not be published.
              </p>
              {fieldErrors?.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Submit */}
            <div
              className="flex gap-3 pt-2"
              id="write-review-description"
            >
              <Dialog.Close asChild>
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
