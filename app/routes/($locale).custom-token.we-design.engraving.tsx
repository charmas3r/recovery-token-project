import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).custom-token.we-design.engraving';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'engraving')) {
    return redirect('/custom-token/we-design/material');
  }
  return {engraving: session.engraving ?? {}};
}

const SYMBOL_OPTIONS = [
  {value: 'aa', label: 'AA', shape: 'Triangle'},
  {value: 'na', label: 'NA', shape: 'Diamond'},
  {value: 'other', label: 'Other', shape: 'Circle'},
] as const;

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = (formData.get('name') as string)?.trim() ?? '';
  const years = (formData.get('years') as string)?.trim() ?? '';
  const symbol = (formData.get('symbol') as string)?.trim() ?? '';
  const note = (formData.get('note') as string)?.trim() ?? '';

  // At least one engraving field should be filled
  if (!name && !years && !symbol) {
    return {error: 'Please fill in at least one engraving field'};
  }

  updateCustomTokenSession(context.session as AppSession, {
    engraving: {
      name,
      years,
      symbol: symbol === 'aa' || symbol === 'na' || symbol === 'other' ? symbol : undefined,
      note,
    },
  });
  return redirect('/custom-token/we-design/review', {
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

export default function WeDesignEngraving() {
  const {engraving} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 4 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Engraving Details
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          What text should be engraved on your token?
        </p>
      </div>

      <Form
        method="post"
        style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}
        onSubmit={() => trackEvent('custom_token_step', {path: 'we-design', step: 'engraving'})}
      >
        <div>
          <label htmlFor="name" style={labelStyle}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            maxLength={10}
            defaultValue={engraving.name}
            placeholder="e.g., John D."
            style={inputStyle}
          />
          <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem'}}>Max 10 characters</span>
        </div>

        <div>
          <label htmlFor="years" style={labelStyle}>Years</label>
          <input
            id="years"
            name="years"
            type="text"
            maxLength={3}
            defaultValue={engraving.years}
            placeholder="e.g., 5"
            style={inputStyle}
          />
        </div>

        <div>
          <span style={labelStyle}>Recovery Symbol</span>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem'}}>
            {SYMBOL_OPTIONS.map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.375rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '0.75rem 0.5rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="symbol"
                  value={option.value}
                  defaultChecked={engraving.symbol === option.value}
                  style={{accentColor: '#B8764F'}}
                />
                <span style={{color: '#fff', fontSize: '0.875rem', fontWeight: 600}}>{option.label}</span>
                <span style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem'}}>{option.shape}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="note" style={labelStyle}>Special Note (optional, private)</label>
          <textarea
            id="note"
            name="note"
            maxLength={200}
            rows={3}
            defaultValue={engraving.note}
            placeholder="Any special instructions for the engraver..."
            style={{...inputStyle, resize: 'vertical'}}
          />
        </div>

        {actionData?.error && (
          <p style={{color: '#f87171', fontSize: '0.875rem'}}>{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/material" />
      </Form>
    </div>
  );
}
