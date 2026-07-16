import {Form, redirect, useNavigation} from 'react-router';
import type {Route} from './+types/($locale).custom-token._index';
import {updateCustomTokenSession, clearCustomTokenSession} from '~/lib/custom-token-session';
import type {AppSession} from '~/lib/session';
import {buildMeta} from '~/lib/meta';
import {ReviewsCallout} from '~/components/reviews/ReviewsCallout';
import {trackEvent} from '~/lib/ga4';

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
    title: 'Create Your Own Token | Custom Recovery Tokens | Custom Milestones',
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
      <div style={{textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.75rem'}}>
          Custom Tokens
        </span>
        <h1 style={{fontFamily: 'var(--font-display, serif)', fontSize: 'clamp(1.875rem, 5vw, 2.5rem)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '0.75rem'}}>
          Create Your Own Token
        </h1>
        <p style={{fontSize: '1rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto'}}>
          Choose how you&apos;d like to create your one-of-a-kind token.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* We Design It */}
        <Form method="post" action="?index">
          <input type="hidden" name="path" value="we-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => trackEvent('custom_token_start', {path: 'we-design'})}
            className="p-5 sm:p-8"
            style={{
              width: '100%',
              textAlign: 'left',
              borderRadius: '1rem',
              border: '1px solid rgba(0,0,0,0.08)',
              transition: 'transform 0.15s, filter 0.15s',
              background: '#FFFF93',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)';
              e.currentTarget.style.filter = 'brightness(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <span style={{display: 'inline-block', color: 'rgba(0,0,0,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, marginBottom: '0.375rem'}}>
              Option 1
            </span>
            <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.25rem', fontWeight: 700, color: '#000000', marginBottom: '0.375rem'}}>
              We Design It For You
            </h2>
            <p style={{fontSize: '0.8125rem', lineHeight: 1.45, color: 'rgba(0,0,0,0.7)'}}>
              Tell us your vision — we&apos;ll design it and email you proofs to approve.
            </p>
          </button>
        </Form>

        {/* AI Generated Design */}
        <Form method="post" action="?index">
          <input type="hidden" name="path" value="you-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => trackEvent('custom_token_start', {path: 'you-design'})}
            className="p-5 sm:p-8"
            style={{
              width: '100%',
              textAlign: 'left',
              borderRadius: '1rem',
              border: '1px solid rgba(0,0,0,0.08)',
              transition: 'transform 0.15s, filter 0.15s',
              background: '#FFFF93',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)';
              e.currentTarget.style.filter = 'brightness(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <span style={{display: 'inline-block', color: 'rgba(0,0,0,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, marginBottom: '0.375rem'}}>
              Option 2
            </span>
            <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.25rem', fontWeight: 700, color: '#000000', marginBottom: '0.375rem'}}>
              AI Generated Design
            </h2>
            <p style={{fontSize: '0.8125rem', lineHeight: 1.45, color: 'rgba(0,0,0,0.7)'}}>
              Describe your design and watch AI generate it — preview and refine in real time.
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
