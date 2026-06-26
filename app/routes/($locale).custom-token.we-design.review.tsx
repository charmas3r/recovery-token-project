import {Form, useActionData, useLoaderData, useFetcher} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.review';
import {getCustomTokenSession, updateCustomTokenSession, clearCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {ReviewSummary} from '~/components/custom-token/ReviewSummary';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {CartForm} from '@shopify/hydrogen';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'review')) {
    return {redirect: '/custom-token/we-design/engraving'};
  }
  return {session, redirect: null};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const contactEmail = (formData.get('contactEmail') as string)?.trim();

  if (!contactEmail || !contactEmail.includes('@')) {
    return {error: 'Please enter a valid email address so we can send design proofs', success: false};
  }

  const session = getCustomTokenSession(context.session as AppSession)!;
  updateCustomTokenSession(context.session as AppSession, {contactEmail});

  // Build line item attributes
  const attributes: Array<{key: string; value: string}> = [
    {key: 'Custom Design Path', value: 'We Design It For You'},
  ];
  if (session.occasion) attributes.push({key: 'Occasion', value: session.occasion});
  if (session.description) attributes.push({key: 'Design Description', value: session.description});
  if (session.material) attributes.push({key: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'});
  if (session.engraving?.name) attributes.push({key: 'Engraving Name', value: session.engraving.name});
  if (session.engraving?.years) attributes.push({key: 'Engraving Years', value: session.engraving.years});
  if (session.engraving?.cleanDate) attributes.push({key: 'Engraving Clean Date', value: session.engraving.cleanDate});
  if (session.engraving?.note) attributes.push({key: '_Engraving Note', value: session.engraving.note});
  if (session.inspirationImageIds?.length) {
    attributes.push({key: '_Inspiration Images', value: session.inspirationImageIds.join(', ')});
  }
  attributes.push({key: '_Contact Email', value: contactEmail});

  // Fire Klaviyo event (fire-and-forget)
  try {
    const {getKlaviyoClient} = await import('~/lib/klaviyo.server');
    const klaviyo = getKlaviyoClient(context.env);
    klaviyo.createEvent({
      event: 'Custom Token Order - We Design',
      email: contactEmail,
      properties: {
        occasion: session.occasion,
        description: session.description,
        material: session.material,
        engravingName: session.engraving?.name,
        engravingYears: session.engraving?.years,
        engravingCleanDate: session.engraving?.cleanDate,
        engravingNote: session.engraving?.note,
        inspirationImages: session.inspirationImageIds?.join(', '),
      },
    });
  } catch {
    // Fail silently — order data is in line item properties as backup
  }

  // Clear wizard session
  clearCustomTokenSession(context.session as AppSession);

  // Return attributes and variantId for client-side cart submission
  return Response.json(
    {success: true, attributes, variantId: session.variantId},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.75rem',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
  padding: '0.5rem 1rem',
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  boxSizing: 'border-box',
};

export default function WeDesignReview() {
  const {session} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const cartFetcher = useFetcher();
  const [email, setEmail] = useState(session.contactEmail ?? '');
  const [addedToCart, setAddedToCart] = useState(false);

  const reviewItems = [
    {label: 'Occasion', value: session.occasion ?? ''},
    {label: 'Design Description', value: session.description ?? ''},
    {label: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
    ...(session.engraving?.name ? [{label: 'Engraving Name', value: session.engraving.name}] : []),
    ...(session.engraving?.years ? [{label: 'Engraving Years', value: session.engraving.years}] : []),
    ...(session.engraving?.cleanDate ? [{label: 'Engraving Clean Date', value: session.engraving.cleanDate}] : []),
  ].filter((item) => item.value);

  // When action returns success, submit to cart via fetcher
  useEffect(() => {
    if (actionData?.success && actionData?.variantId && actionData?.attributes && !addedToCart) {
      setAddedToCart(true);
      trackEvent('custom_token_step', {path: 'we-design', step: 'review'});
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
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 5 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Review & Order
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Review your custom token details. We&apos;ll follow up at your email with design proofs.
        </p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <ReviewSummary path="we-design" items={reviewItems} />

        <Form method="post" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div>
            <label htmlFor="contactEmail" style={{display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem'}}>
              Contact Email (for design follow-up)
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={inputStyle}
            />
          </div>

          {actionData?.error && (
            <p style={{color: '#f87171', fontSize: '0.875rem'}}>{actionData.error}</p>
          )}

          <WizardNav backTo="/custom-token/we-design/engraving" nextLabel="Add to Cart" />
        </Form>
      </div>
    </div>
  );
}
