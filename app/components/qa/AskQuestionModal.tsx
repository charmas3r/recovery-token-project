/**
 * AskQuestionModal - Product question submission form
 *
 * Radix Dialog modal with name, email, question fields.
 * Follows WriteReviewModal pattern for consistency.
 */

import {useEffect, useState} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {clsx} from 'clsx';
import {X, CheckCircle2, MessageCircleQuestion} from 'lucide-react';
import {Button} from '~/components/ui';
import {trackEvent} from '~/lib/ga4';
import {useRecaptcha} from '~/lib/useRecaptcha';
import type {RootLoader} from '~/root';

/** reCAPTCHA action name — must match the value checked in questions.submit. */
const RECAPTCHA_ACTION = 'question';

interface AskQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productHandle: string;
  productTitle: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export function AskQuestionModal({
  open,
  onOpenChange,
  productHandle,
  productTitle,
}: AskQuestionModalProps) {
  const fetcher = useFetcher<ActionData>();
  const recaptchaSiteKey = useRouteLoaderData<RootLoader>('root')?.recaptchaSiteKey;
  // The hook only mounts while the modal is open, so the reCAPTCHA script
  // loads on first open rather than on every product page view.
  const {getToken} = useRecaptcha(recaptchaSiteKey);
  // Covers the token round-trip, which happens before fetcher.state flips.
  const [isVerifying, setIsVerifying] = useState(false);

  const isSubmitting = fetcher.state !== 'idle' || isVerifying;
  const isSuccess = fetcher.data?.success === true;
  const fieldErrors = fetcher.data?.fieldErrors;
  const serverError = fetcher.data?.error;

  /**
   * Fetch a reCAPTCHA token, then submit with it attached. When the script is
   * blocked or unconfigured the token is null and the form posts without it —
   * the server decides what that means.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsVerifying(true);
    try {
      const token = await getToken(RECAPTCHA_ACTION);
      if (token) {
        formData.set('g-recaptcha-response', token);
      }
    } finally {
      setIsVerifying(false);
    }

    void fetcher.submit(formData, {
      method: 'post',
      action: '/questions/submit',
    });
  };

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      trackEvent('submit_question', {});
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
              backgroundColor: '#0A0A0A',
              borderRadius: '0.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <Dialog.Title className="sr-only">Question Submitted</Dialog.Title>
            <Dialog.Description className="sr-only">
              Your question has been submitted successfully.
            </Dialog.Description>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              Question Submitted!
            </h3>
            <p className="text-body text-white/50">
              We&apos;ll review your question about{' '}
              <span className="font-semibold text-white">{productTitle}</span>{' '}
              and post an answer soon.
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
            backgroundColor: '#0A0A0A',
            borderRadius: '0.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
            <Dialog.Title className="font-display text-lg font-bold text-white flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-accent" />
              Ask a Question
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Submit a question about this product.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                className={clsx(
                  'p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05]',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <fetcher.Form
            method="post"
            action="/questions/submit"
            onSubmit={(event) => void handleSubmit(event)}
            className="p-4 space-y-5"
          >
            {/* Hidden fields */}
            <input type="hidden" name="productHandle" value={productHandle} />
            <input type="hidden" name="productTitle" value={productTitle} />

            {/* Honeypot */}
            <div style={{position: 'absolute', left: '-9999px'}} aria-hidden="true">
              <label htmlFor="question-website">Website</label>
              <input
                type="text"
                id="question-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Product name context */}
            <div className="bg-white/[0.05] rounded-lg p-3">
              <p className="font-semibold text-white text-sm">{productTitle}</p>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {serverError}
              </div>
            )}

            {/* Question */}
            <div>
              <label
                htmlFor="question-text"
                className="block text-sm font-semibold text-white mb-2"
              >
                Your Question <span className="text-red-500">*</span>
              </label>
              <textarea
                id="question-text"
                name="question"
                rows={3}
                placeholder="What would you like to know about this product?"
                maxLength={1000}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05] resize-y',
                  'placeholder:text-white/25 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
                  fieldErrors?.question ? 'border-red-400' : 'border-white/[0.08]',
                )}
              />
              {fieldErrors?.question && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.question}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="question-name"
                className="block text-sm font-semibold text-white mb-2"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="question-name"
                name="name"
                type="text"
                placeholder="How should we display your name?"
                maxLength={100}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05]',
                  'placeholder:text-white/25 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
                  fieldErrors?.name ? 'border-red-400' : 'border-white/[0.08]',
                )}
              />
              {fieldErrors?.name && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="question-email"
                className="block text-sm font-semibold text-white mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="question-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05]',
                  'placeholder:text-white/25 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
                  fieldErrors?.email ? 'border-red-400' : 'border-white/[0.08]',
                )}
              />
              <p className="text-xs text-white/40 mt-1">
                We&apos;ll notify you when your question is answered. Your email will not be published.
              </p>
              {fieldErrors?.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Question'}
              </Button>
            </div>

            {/* reCAPTCHA attribution — required by Google's terms while the
                floating badge is hidden (see .grecaptcha-badge in app.css) */}
            {recaptchaSiteKey && (
              <p className="text-xs text-white/40 leading-relaxed">
                This site is protected by reCAPTCHA and the Google{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/60"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/60"
                >
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            )}
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
