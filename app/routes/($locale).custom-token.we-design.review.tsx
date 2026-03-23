import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState, useRef, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.review';
import {getCustomTokenSession, updateCustomTokenSession, clearCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {ReviewSummary} from '~/components/custom-token/ReviewSummary';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {CartForm} from '@shopify/hydrogen';
import type {AppSession} from '~/lib/session';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'review')) {
    return redirect('/custom-token/we-design/engraving');
  }
  return {session};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const contactEmail = (formData.get('contactEmail') as string)?.trim();

  if (!contactEmail || !contactEmail.includes('@')) {
    return {error: 'Please enter a valid email address so we can send design proofs'};
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

  // Return attributes for client-side CartForm submission
  return Response.json(
    {attributes, variantId: session.variantId},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

export default function WeDesignReview() {
  const {session} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [email, setEmail] = useState(session.contactEmail ?? '');

  const reviewItems = [
    {label: 'Occasion', value: session.occasion ?? ''},
    {label: 'Design Description', value: session.description ?? ''},
    {label: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
    ...(session.engraving?.name ? [{label: 'Engraving Name', value: session.engraving.name}] : []),
    ...(session.engraving?.years ? [{label: 'Engraving Years', value: session.engraving.years}] : []),
    ...(session.engraving?.cleanDate ? [{label: 'Engraving Clean Date', value: session.engraving.cleanDate}] : []),
  ].filter((item) => item.value);

  // If action returned attributes, submit to cart
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
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 5 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Review & Order
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Review your custom token details. We'll follow up at your email with design proofs.
        </p>
      </div>

      <div className="space-y-lg">
        <ReviewSummary path="we-design" items={reviewItems} />

        <Form method="post" className="space-y-lg">
          <div>
            <label htmlFor="contactEmail" className="block text-white text-sm font-medium mb-sm">
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
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          {actionData?.error && (
            <p className="text-red-400 text-sm">{actionData.error}</p>
          )}

          <WizardNav backTo="/custom-token/we-design/engraving" nextLabel="Add to Cart" />
        </Form>
      </div>
    </div>
  );
}

function CartFormAutoSubmit({variantId, attributes}: {variantId: string; attributes: Array<{key: string; value: string}>}) {
  const submittedRef = useRef(false);

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines: [{merchandiseId: variantId, quantity: 1, attributes}]}}
    >
      {(fetcher) => {
        useEffect(() => {
          if (fetcher.state === 'idle' && !fetcher.data && !submittedRef.current) {
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
