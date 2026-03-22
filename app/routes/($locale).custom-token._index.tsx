import {Form, redirect, useNavigation} from 'react-router';
import type {Route} from './+types/($locale).custom-token._index';
import {updateCustomTokenSession, clearCustomTokenSession} from '~/lib/custom-token-session';
import type {AppSession} from '~/lib/session';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
        {/* We Design It */}
        <Form method="post">
          <input type="hidden" name="path" value="we-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-left rounded-2xl border border-white/[0.08] hover:border-accent/50 p-xl transition-all group"
            style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
          >
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-sm">
              Option 1
            </span>
            <h2 className="text-white font-display text-xl font-bold mb-sm group-hover:text-accent transition-colors">
              We Design It For You
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Tell us about your vision and we'll create a custom design. Share inspiration images, describe what matters to you, and we'll handle the rest. We'll follow up via email with design proofs.
            </p>
          </button>
        </Form>

        {/* You Design It */}
        <Form method="post">
          <input type="hidden" name="path" value="you-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-left rounded-2xl border border-white/[0.08] hover:border-accent/50 p-xl transition-all group"
            style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
          >
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-sm">
              Option 2
            </span>
            <h2 className="text-white font-display text-xl font-bold mb-sm group-hover:text-accent transition-colors">
              You Design It
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Use our AI-powered design studio to create your token. Describe what you want, preview generated designs, and refine until it's perfect. See your design come to life in real time.
            </p>
          </button>
        </Form>
      </div>
    </div>
  );
}
