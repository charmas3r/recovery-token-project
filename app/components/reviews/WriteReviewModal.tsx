/**
 * WriteReviewModal - Product review submission form
 *
 * Radix Dialog modal with star rating, quality pills, photo upload,
 * and useFetcher. Matches EngravingConfirmModal pattern for consistency.
 */

import {useState, useEffect, useRef, useCallback} from 'react';
import {useFetcher} from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {clsx} from 'clsx';
import {X, CheckCircle2, Camera, Plus} from 'lucide-react';
import {Button} from '~/components/ui';
import {StarRatingInput} from './StarRatingInput';
import {
  QUALITY_OPTIONS,
  REVIEW_PHOTO_MAX_COUNT,
  REVIEW_PHOTO_MAX_SIZE,
  REVIEW_PHOTO_ACCEPTED_TYPES,
} from '~/lib/validation';

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

const ACCEPTED_INPUT = REVIEW_PHOTO_ACCEPTED_TYPES.join(',');
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

/**
 * Client-side image compression via Canvas API.
 * Resizes to max 1200px on longest side and re-encodes as JPEG at 80%.
 */
function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let {width, height} = img;

      // Only resize if larger than MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback — return original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const compressedName = file.name.replace(/\.\w+$/, '.jpg');
          resolve(
            new File([blob], compressedName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }),
          );
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not load image: ${file.name}`));
    };

    img.src = url;
  });
}

export function WriteReviewModal({
  open,
  onOpenChange,
  productId,
  productHandle,
  productTitle,
}: WriteReviewModalProps) {
  const fetcher = useFetcher<ActionData>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(0);
  const [quality, setQuality] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const isSubmitting = fetcher.state !== 'idle';
  const isSuccess = fetcher.data?.success === true;
  const fieldErrors = fetcher.data?.fieldErrors;
  const serverError = fetcher.data?.error;

  // Clean up object URLs
  const revokeAllPreviews = useCallback(() => {
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [photoPreviews]);

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRating(0);
      setQuality('');
      revokeAllPreviews();
      setPhotos([]);
      setPhotoPreviews([]);
      setPhotoError(null);
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

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handlePhotosSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    // Reset input so the same file can be re-selected
    e.target.value = '';

    setPhotoError(null);

    const remaining = REVIEW_PHOTO_MAX_COUNT - photos.length;
    if (remaining <= 0) {
      setPhotoError(`Maximum ${REVIEW_PHOTO_MAX_COUNT} photos allowed`);
      return;
    }

    const toAdd = selected.slice(0, remaining);

    // Validate types and sizes before compression
    for (const file of toAdd) {
      if (!REVIEW_PHOTO_ACCEPTED_TYPES.includes(file.type)) {
        setPhotoError(
          `"${file.name}" is not supported. Use JPEG, PNG, or WebP.`,
        );
        return;
      }
      if (file.size > REVIEW_PHOTO_MAX_SIZE) {
        setPhotoError(`"${file.name}" exceeds the 5 MB size limit`);
        return;
      }
    }

    // Compress each image
    try {
      const compressed = await Promise.all(toAdd.map(compressImage));
      const newPreviews = compressed.map((f) => URL.createObjectURL(f));

      setPhotos((prev) => [...prev, ...compressed]);
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    } catch {
      setPhotoError('Could not process one or more images. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotoError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Append compressed photo files
    for (const photo of photos) {
      formData.append('photos', photo);
    }

    fetcher.submit(formData, {
      method: 'post',
      action: '/reviews/submit',
      encType: 'multipart/form-data',
    });
  };

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
          <form onSubmit={handleSubmit} className="p-4 space-y-5">
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

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Photos
                <span className="ml-2 text-xs font-normal text-secondary">
                  Optional &middot; Up to {REVIEW_PHOTO_MAX_COUNT}
                </span>
              </label>

              {/* Preview grid + add button */}
              <div className="flex flex-wrap gap-2">
                {photoPreviews.map((preview, index) => (
                  <div
                    key={preview}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-black/10 group"
                  >
                    <img
                      src={preview}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className={clsx(
                        'absolute top-0.5 right-0.5 w-5 h-5 rounded-full',
                        'bg-black/60 text-white flex items-center justify-center',
                        'opacity-0 group-hover:opacity-100 transition-opacity',
                        'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent',
                      )}
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {photos.length < REVIEW_PHOTO_MAX_COUNT && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className={clsx(
                      'w-20 h-20 rounded-lg border-2 border-dashed border-black/10',
                      'flex flex-col items-center justify-center gap-1',
                      'text-secondary hover:border-accent/40 hover:text-accent',
                      'transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Add photo"
                  >
                    {photos.length === 0 ? (
                      <>
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px]">Add</span>
                      </>
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_INPUT}
                multiple
                onChange={handlePhotosSelected}
                className="sr-only"
                aria-label="Select photos"
              />

              {/* Photo errors */}
              {(photoError || fieldErrors?.photos) && (
                <p className="text-sm text-red-600 mt-1">
                  {photoError || fieldErrors?.photos}
                </p>
              )}
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
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
