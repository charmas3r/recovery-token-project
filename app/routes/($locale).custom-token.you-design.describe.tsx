import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).custom-token.you-design.describe';
import {getCustomTokenSession, updateCustomTokenSession} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import type {AppSession} from '~/lib/session';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'you-design') {
    return redirect('/custom-token');
  }
  return {designPrompt: session.designPrompt ?? ''};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const theme = (formData.get('theme') as string)?.trim();
  const symbols = (formData.get('symbols') as string)?.trim() ?? '';
  const text = (formData.get('text') as string)?.trim() ?? '';
  const style = (formData.get('style') as string)?.trim() ?? '';

  if (!theme || theme.length < 3) {
    return {error: 'Please describe a theme (at least 3 characters)'};
  }

  const designPrompt = [
    theme,
    symbols && `Symbols: ${symbols}`,
    text && `Text: ${text}`,
    style && `Style: ${style}`,
  ]
    .filter(Boolean)
    .join('. ');

  updateCustomTokenSession(context.session as AppSession, {designPrompt});
  return redirect('/custom-token/you-design/material', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#fff',
  fontSize: '0.875rem',
  fontWeight: 500,
  marginBottom: '0.5rem',
};

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

export default function YouDesignDescribe() {
  const {designPrompt} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

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
          Step 1 of 5
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
          Describe your design
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '0.5rem',
          }}
        >
          Tell us what you want on your token. We'll generate preview designs
          for you to choose from.
        </p>
      </div>

      <Form method="post" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <div>
          <label htmlFor="theme" style={labelStyle}>
            Theme / Main Idea *
          </label>
          <textarea
            id="theme"
            name="theme"
            rows={3}
            maxLength={200}
            placeholder='e.g., "An eagle soaring over mountains with a sunrise, representing freedom in recovery"'
            style={{...inputStyle, resize: 'vertical'}}
          />
        </div>

        <div>
          <label htmlFor="symbols" style={labelStyle}>
            Symbols (optional)
          </label>
          <input
            id="symbols"
            name="symbols"
            type="text"
            maxLength={200}
            placeholder='e.g., "eagle, mountains, sunrise, AA triangle"'
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="text" style={labelStyle}>
            Text on Token (optional)
          </label>
          <input
            id="text"
            name="text"
            type="text"
            maxLength={100}
            placeholder='e.g., "5 Years" or "One Day At A Time"'
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="style" style={labelStyle}>
            Style Preference (optional)
          </label>
          <input
            id="style"
            name="style"
            type="text"
            maxLength={200}
            placeholder='e.g., "minimalist", "ornate Victorian", "modern geometric"'
            style={inputStyle}
          />
        </div>

        {actionData?.error && (
          <p style={{color: '#f87171', fontSize: '0.875rem'}}>{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token" />
      </Form>
    </div>
  );
}
