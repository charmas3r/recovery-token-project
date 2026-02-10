/**
 * Review Submission Action
 *
 * Handles product review submissions via Judge.me API.
 * Supports optional photo uploads via Shopify staged uploads.
 * Used by WriteReviewModal via useFetcher.
 */

import type {Route} from './+types/reviews.submit';
import {
  reviewFormSchema,
  formatZodErrors,
  validateReviewPhotos,
} from '~/lib/validation';
import {getJudgeMeClient} from '~/lib/judgeme.server';
import {uploadImagesToShopify} from '~/lib/shopify-uploads.server';

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  const data = {
    productId: formData.get('productId')?.toString() || '',
    productHandle: formData.get('productHandle')?.toString() || '',
    rating: parseInt(formData.get('rating')?.toString() || '0', 10),
    title: formData.get('title')?.toString() || '',
    body: formData.get('body')?.toString() || '',
    quality: formData.get('quality')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    honeypot: formData.get('website')?.toString() || '',
  };

  // Honeypot check
  if (data.honeypot) {
    return {success: true};
  }

  // Validate form fields
  const result = reviewFormSchema.safeParse(data);
  if (!result.success) {
    return {fieldErrors: formatZodErrors(result.error)};
  }

  // Extract and validate photo files
  const photoEntries = formData.getAll('photos');
  const photos = photoEntries.filter(
    (entry: FormDataEntryValue): entry is File =>
      entry instanceof File && entry.size > 0,
  );

  if (photos.length > 0) {
    const photoError = validateReviewPhotos(photos);
    if (photoError) {
      return {fieldErrors: {photos: photoError}};
    }
  }

  // Build the review body, optionally appending quality answer
  let reviewBody = result.data.body;
  if (result.data.quality) {
    reviewBody += `\n\nQuality: ${result.data.quality}`;
  }

  try {
    // Upload photos to Shopify if present
    let pictureUrls: string[] | undefined;
    if (photos.length > 0) {
      try {
        pictureUrls = await uploadImagesToShopify(photos, context.env);
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
        return {
          error:
            'Could not upload your photos. Please try again or submit without photos.',
        };
      }
    }

    const judgeme = getJudgeMeClient(context.env);
    await judgeme.createReview({
      product_id: result.data.productId,
      email: result.data.email,
      name: result.data.name,
      rating: result.data.rating,
      title: result.data.title,
      body: reviewBody,
      picture_urls: pictureUrls,
    });

    return {success: true};
  } catch (error) {
    console.error('Judge.me create review error:', error);

    if (
      error instanceof Error &&
      error.message.includes('not configured')
    ) {
      console.warn('Judge.me not configured, review logged only');
      console.log('Review submission:', {
        product: result.data.productHandle,
        rating: result.data.rating,
        title: result.data.title,
      });
      return {success: true};
    }

    return {
      error: 'Could not submit your review right now. Please try again later.',
    };
  }
}

// Action-only route
export function loader() {
  return new Response('Method not allowed', {status: 405});
}
