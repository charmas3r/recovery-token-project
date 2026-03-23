import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useEffect, useRef} from 'react';
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

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'review')
  ) {
    return redirect('/custom-token/you-design/material');
  }

  // Resolve final design ID to URL for display
  let finalDesignUrl = '';
  if (session.finalDesignId) {
    const resolved = await resolveShopifyFileIds(
      [session.finalDesignId],
      context.env,
    );
    finalDesignUrl = resolved[session.finalDesignId] ?? '';
  }

  return {session, finalDesignUrl};
}

export async function action({request, context}: Route.ActionArgs) {
  const session = getCustomTokenSession(context.session as AppSession)!;

  // Resolve final design ID to URL for line item property
  let finalDesignUrl = '';
  if (session.finalDesignId) {
    const resolved = await resolveShopifyFileIds(
      [session.finalDesignId],
      context.env,
    );
    finalDesignUrl = resolved[session.finalDesignId] ?? '';
  }

  // Build line item attributes
  const attributes: Array<{key: string; value: string}> = [
    {key: 'Custom Design Path', value: 'You Design It'},
    {key: 'Design Description', value: session.designPrompt ?? ''},
    {key: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
  ];
  if (finalDesignUrl) {
    attributes.push({key: 'Final Design Image', value: finalDesignUrl});
  }
  attributes.push({key: '_Design Prompt', value: session.designPrompt ?? ''});
  attributes.push({
    key: '_Refinement History',
    value: JSON.stringify(session.refinementPrompts ?? []),
  });
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
      },
    });
  } catch {
    // Fail silently — order data is in line item properties as backup
  }

  // Clear wizard session
  clearCustomTokenSession(context.session as AppSession);

  return Response.json(
    {attributes, variantId: session.variantId},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

export default function YouDesignReview() {
  const {session, finalDesignUrl} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

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
    ...(session.refinementPrompts?.length
      ? [
          {
            label: 'Refinements Made',
            value: `${session.refinementPrompts.length} refinement(s)`,
          },
        ]
      : []),
  ].filter((item) => item.value);

  // If action returned attributes, auto-submit to cart
  if (actionData?.attributes && actionData?.variantId) {
    return (
      <CartFormAutoSubmit
        variantId={actionData.variantId}
        attributes={actionData.attributes}
      />
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
          Step 5 of 5
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

      <div className="space-y-lg">
        <ReviewSummary path="you-design" items={reviewItems} />

        <Form method="post">
          <WizardNav
            backTo="/custom-token/you-design/material"
            nextLabel="Add to Cart"
          />
        </Form>
      </div>
    </div>
  );
}

function CartFormAutoSubmit({
  variantId,
  attributes,
}: {
  variantId: string;
  attributes: Array<{key: string; value: string}>;
}) {
  const submittedRef = useRef(false);

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{
        lines: [{merchandiseId: variantId, quantity: 1, attributes}],
      }}
    >
      {(fetcher) => {
        useEffect(() => {
          if (
            fetcher.state === 'idle' &&
            !fetcher.data &&
            !submittedRef.current
          ) {
            submittedRef.current = true;
            fetcher.submit(null);
          }
        }, [fetcher]);

        return (
          <div className="text-center py-2xl">
            <p className="text-white text-lg">Adding to cart...</p>
          </div>
        );
      }}
    </CartForm>
  );
}
