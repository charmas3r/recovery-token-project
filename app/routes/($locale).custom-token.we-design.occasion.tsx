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
        <div className="space-y-md">
          {OCCASIONS.map((occ) => (
            <label
              key={occ.value}
              className={`block rounded-2xl border p-lg cursor-pointer transition-colors ${
                sessionData?.occasion === occ.value
                  ? 'border-accent bg-accent/10'
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
              style={{
                background:
                  sessionData?.occasion === occ.value
                    ? undefined
                    : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              }}
            >
              <input
                type="radio"
                name="occasion"
                value={occ.value}
                defaultChecked={sessionData?.occasion === occ.value}
                className="sr-only"
              />
              <h3 className="text-white font-bold">{occ.label}</h3>
              <p className="text-white/50 text-sm mt-xs">{occ.description}</p>
            </label>
          ))}
        </div>

        {actionData?.error && (
          <p className="text-red-400 text-sm mt-md">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token" />
      </Form>
    </div>
  );
}
