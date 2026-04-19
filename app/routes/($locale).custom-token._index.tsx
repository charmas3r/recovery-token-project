import {Form, redirect, useNavigation} from 'react-router';
import type {Route} from './+types/($locale).custom-token._index';
import {updateCustomTokenSession, clearCustomTokenSession} from '~/lib/custom-token-session';
import type {AppSession} from '~/lib/session';
import {buildMeta} from '~/lib/meta';
import {ReviewsCallout} from '~/components/reviews/ReviewsCallout';

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const path = formData.get('path') as 'we-design' | 'you-design';

  if (path !== 'we-design' && path !== 'you-design') {
    return {error: 'Please select a design path'};
  }

  const session = context.session as AppSession;
  // Clear any previous session and start fresh
  clearCustomTokenSession(session);
  updateCustomTokenSession(session, {
    path,
    startedAt: new Date().toISOString(),
  });

  const firstStep = path === 'we-design' ? 'occasion' : 'describe';
  return redirect(`/custom-token/${path}/${firstStep}`, {
    headers: {'Set-Cookie': await session.commit()},
  });
}

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Create Your Own Token | Custom Recovery Tokens | Coinplugz',
    description:
      'Design a custom recovery token with our guided wizard — choose materials, engraving, and occasion for a one-of-a-kind sobriety milestone keepsake.',
    canonical: '/custom-token',
  });
};

export default function CustomTokenLanding() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div>
      <div style={{textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '3rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '1rem'}}>
          Custom Tokens
        </span>
        <h1 style={{fontFamily: 'var(--font-display, serif)', fontSize: '2.5rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '1rem'}}>
          Create Your Own Token
        </h1>
        <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto'}}>
          Design a one-of-a-kind recovery token that tells your unique story. Choose how you'd like to create it.
        </p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem'}}>
        {/* We Design It */}
        <Form method="post" action="?index">
          <input type="hidden" name="path" value="we-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              textAlign: 'left',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '2rem',
              transition: 'border-color 0.2s',
              background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(184,118,79,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
              Option 1
            </span>
            <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem'}}>
              We Design It For You
            </h2>
            <p style={{fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)'}}>
              Tell us about your vision and we&apos;ll create a custom design. Share inspiration images, describe what matters to you, and we&apos;ll handle the rest. We&apos;ll follow up via email with design proofs.
            </p>
          </button>
        </Form>

        {/* You Design It */}
        <Form method="post" action="?index">
          <input type="hidden" name="path" value="you-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              textAlign: 'left',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '2rem',
              transition: 'border-color 0.2s',
              background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(184,118,79,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
              Option 2
            </span>
            <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem'}}>
              You Design It
            </h2>
            <p style={{fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)'}}>
              Use our AI-powered design studio to create your token. Describe what you want, preview generated designs, and refine until it&apos;s perfect. See your design come to life in real time.
            </p>
          </button>
        </Form>
      </div>

      <div style={{marginTop: '3rem'}}>
        <ReviewsCallout variant="banner" />
      </div>
    </div>
  );
}
