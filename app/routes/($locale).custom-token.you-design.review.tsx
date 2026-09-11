import {Form, redirect, useActionData, useLoaderData, useFetcher} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.review';
import {
  getCustomTokenSession,
  clearCustomTokenSession,
  canProceedToStep,
} from '~/lib/custom-token-session';
import {resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import {ReviewSummary} from '~/components/custom-token/ReviewSummary';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {CartForm} from '@shopify/hydrogen';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'review')
  ) {
    return redirect('/custom-token/you-design/material');
  }

  const idsToResolve = [session.finalDesignId, session.backFinalDesignId].filter(
    (id): id is string => Boolean(id),
  );
  const resolved = idsToResolve.length
    ? await resolveShopifyFileIds(idsToResolve, context.env)
    : {};

  const finalDesignUrl = session.finalDesignId ? resolved[session.finalDesignId] ?? '' : '';
  const backFinalDesignUrl = session.backFinalDesignId ? resolved[session.backFinalDesignId] ?? '' : '';

  return {session, finalDesignUrl, backFinalDesignUrl};
}

export async function action({request, context}: Route.ActionArgs) {
  const session = getCustomTokenSession(context.session as AppSession)!;

  const idsToResolve = [session.finalDesignId, session.backFinalDesignId].filter(
    (id): id is string => Boolean(id),
  );
  const resolved = idsToResolve.length
    ? await resolveShopifyFileIds(idsToResolve, context.env)
    : {};

  const finalDesignUrl = session.finalDesignId ? resolved[session.finalDesignId] ?? '' : '';
  const backFinalDesignUrl = session.backFinalDesignId ? resolved[session.backFinalDesignId] ?? '' : '';

  // Build line item attributes
  const attributes: Array<{key: string; value: string}> = [
    {key: 'Custom Design Path', value: 'AI Generated Design'},
    {key: 'Design Description', value: session.designPrompt ?? ''},
    {key: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
  ];
  if (finalDesignUrl) {
    attributes.push({key: 'Final Design Image', value: finalDesignUrl});
  }
  if (backFinalDesignUrl) {
    attributes.push({key: 'Final Design Image (Back)', value: backFinalDesignUrl});
    attributes.push({
      key: 'Back Design Source',
      value: session.backMode === 'custom' ? 'Custom' : 'Preset',
    });
  }
  attributes.push({key: '_Design Prompt', value: session.designPrompt ?? ''});
  attributes.push({
    key: '_Refinement History',
    value: JSON.stringify(session.refinementPrompts ?? []),
  });
  if (session.backMode === 'custom') {
    attributes.push({key: '_Design Prompt (Back)', value: session.backDesignPrompt ?? ''});
    attributes.push({
      key: '_Refinement History (Back)',
      value: JSON.stringify(session.backRefinementPrompts ?? []),
    });
  }
  attributes.push({key: '_AI Provider', value: 'openai/dall-e-3'});
  attributes.push({
    key: '_Generation Cost',
    value: `$${((session.generationCount ?? 0) * 0.04).toFixed(2)}`,
  });

  // Fire Klaviyo event (fire-and-forget)
  try {
    const {getKlaviyoClient} = await import('~/lib/klaviyo.server');
    const klaviyo = getKlaviyoClient(context.env);
    klaviyo.createEvent({
      event: 'Custom Token Order - You Design',
      email: 'admin@recoverytokenstore.com',
      properties: {
        designPrompt: session.designPrompt,
        material: session.material,
        finalDesignUrl,
        refinementHistory: JSON.stringify(session.refinementPrompts ?? []),
        generationCount: session.generationCount,
        aiProvider: 'openai/dall-e-3',
        backDesignUrl: backFinalDesignUrl,
        backMode: session.backMode ?? 'preset',
        backDesignPrompt: session.backDesignPrompt,
        backRefinementHistory: JSON.stringify(session.backRefinementPrompts ?? []),
      },
    });
  } catch {
    // Fail silently — order data is in line item properties as backup
  }

  // Clear wizard session
  clearCustomTokenSession(context.session as AppSession);

  return Response.json(
    {success: true, attributes, variantId: session.variantId},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

export default function YouDesignReview() {
  const {session, finalDesignUrl, backFinalDesignUrl} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const cartFetcher = useFetcher();
  const [addedToCart, setAddedToCart] = useState(false);

  const reviewItems = [
    {label: 'Design Description', value: session.designPrompt ?? ''},
    {
      label: 'Material',
      value: session.material === 'brass' ? 'Brass' : 'Color',
    },
    ...(finalDesignUrl
      ? [
          {
            label: 'Final Design',
            value: finalDesignUrl,
            type: 'image' as const,
          },
        ]
      : []),
    ...(backFinalDesignUrl
      ? [{label: 'Back Design', value: backFinalDesignUrl, type: 'image' as const}]
      : []),
    ...(session.refinementPrompts?.length
      ? [
          {
            label: 'Refinements Made',
            value: `${session.refinementPrompts.length} refinement(s)`,
          },
        ]
      : []),
  ].filter((item) => item.value);

  // When action returns success, submit to cart via fetcher
  useEffect(() => {
    if (actionData?.success && actionData?.variantId && actionData?.attributes && !addedToCart) {
      setAddedToCart(true);
      trackEvent('custom_token_step', {path: 'you-design', step: 'review'});
      cartFetcher.submit(
        {
          [CartForm.INPUT_NAME]: JSON.stringify({
            action: CartForm.ACTIONS.LinesAdd,
            inputs: {
              lines: [{
                merchandiseId: actionData.variantId,
                quantity: 1,
                attributes: actionData.attributes,
              }],
            },
          }),
        },
        {method: 'POST', action: '/cart'},
      );
    }
  }, [actionData, addedToCart, cartFetcher]);

  if (addedToCart) {
    return (
      <div style={{textAlign: 'center', padding: '3rem 0'}}>
        <p style={{color: '#fff', fontSize: '1.125rem', marginBottom: '1rem'}}>
          {cartFetcher.state !== 'idle' ? 'Adding to cart...' : 'Added to cart!'}
        </p>
        {cartFetcher.state === 'idle' && (
          <a href="/cart" style={{color: '#B8764F', fontSize: '0.875rem', textDecoration: 'underline'}}>
            View Cart
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span
          style={{
            display: 'inline-block',
            color: '#B8764F',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          Step 6 of 6
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
          }}
        >
          Review & Order
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '0.5rem',
          }}
        >
          Review your custom token design. Once ordered, our team will engrave
          this design and ship your token.
        </p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <ReviewSummary path="you-design" items={reviewItems} />

        <Form method="post">
          <WizardNav
            backTo="/custom-token/you-design/back"
            nextLabel="Add to Cart"
          />
        </Form>
      </div>
    </div>
  );
}
