import {Form, redirect, useActionData, useOutletContext} from 'react-router';
import type {Route} from './+types/($locale).custom-token.we-design.occasion';
import {
  getCustomTokenSession,
  updateCustomTokenSession,
} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import type {CustomTokenOutletContext} from './($locale).custom-token';
import type {AppSession} from '~/lib/session';

const OCCASIONS = [
  {value: 'milestone', label: 'Sobriety Milestone', description: 'Celebrate a recovery anniversary or milestone date'},
  {value: 'memorial', label: 'Memorial', description: "Honor someone's memory and their journey"},
  {value: 'gift', label: 'Custom Gift', description: 'A meaningful gift for someone special'},
  {value: 'organization', label: 'Organization / Group', description: 'For a recovery group, meeting, or organization'},
] as const;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design') {
    return redirect('/custom-token');
  }
  return {selectedOccasion: session.occasion};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const occasion = formData.get('occasion') as string;

  if (!['milestone', 'memorial', 'gift', 'organization'].includes(occasion)) {
    return {error: 'Please select an occasion'};
  }

  updateCustomTokenSession(context.session as AppSession, {occasion});
  return redirect('/custom-token/we-design/description', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function WeDesignOccasion() {
  const actionData = useActionData<typeof action>();
  const {sessionData} = useOutletContext<CustomTokenOutletContext>();

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 1 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          What's the occasion?
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Help us understand what this token celebrates.
        </p>
      </div>

      <Form method="post">
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {OCCASIONS.map((occ) => (
            <label
              key={occ.value}
              style={{
                display: 'block',
                borderRadius: '1rem',
                border: sessionData?.occasion === occ.value
                  ? '1px solid #B8764F'
                  : '1px solid rgba(255,255,255,0.08)',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                background:
                  sessionData?.occasion === occ.value
                    ? 'rgba(184,118,79,0.1)'
                    : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              }}
              onMouseEnter={(e) => {
                if (sessionData?.occasion !== occ.value) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (sessionData?.occasion !== occ.value) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }
              }}
            >
              <input
                type="radio"
                name="occasion"
                value={occ.value}
                defaultChecked={sessionData?.occasion === occ.value}
                className="sr-only"
              />
              <h3 style={{color: '#fff', fontWeight: 700}}>{occ.label}</h3>
              <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: '0.25rem'}}>{occ.description}</p>
            </label>
          ))}
        </div>

        {actionData?.error && (
          <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token" />
      </Form>
    </div>
  );
}
