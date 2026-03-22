import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).custom-token.we-design.engraving';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import type {AppSession} from '~/lib/session';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'engraving')) {
    return redirect('/custom-token/we-design/material');
  }
  return {engraving: session.engraving ?? {}};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = (formData.get('name') as string)?.trim() ?? '';
  const years = (formData.get('years') as string)?.trim() ?? '';
  const cleanDate = (formData.get('cleanDate') as string)?.trim() ?? '';
  const note = (formData.get('note') as string)?.trim() ?? '';

  // At least one engraving field should be filled
  if (!name && !years && !cleanDate) {
    return {error: 'Please fill in at least one engraving field'};
  }

  updateCustomTokenSession(context.session as AppSession, {
    engraving: {name, years, cleanDate, note},
  });
  return redirect('/custom-token/we-design/review', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

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

      <Form method="post" className="space-y-lg">
        <div>
          <label htmlFor="name" className="block text-white text-sm font-medium mb-sm">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            maxLength={10}
            defaultValue={engraving.name}
            placeholder="e.g., John D."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <span className="text-white/30 text-xs">Max 10 characters</span>
        </div>

        <div>
          <label htmlFor="years" className="block text-white text-sm font-medium mb-sm">Years</label>
          <input
            id="years"
            name="years"
            type="text"
            maxLength={3}
            defaultValue={engraving.years}
            placeholder="e.g., 5"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cleanDate" className="block text-white text-sm font-medium mb-sm">Clean Date</label>
          <input
            id="cleanDate"
            name="cleanDate"
            type="date"
            defaultValue={engraving.cleanDate}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-white text-sm font-medium mb-sm">Special Note (optional, private)</label>
          <textarea
            id="note"
            name="note"
            maxLength={200}
            rows={3}
            defaultValue={engraving.note}
            placeholder="Any special instructions for the engraver..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        {actionData?.error && (
          <p className="text-red-400 text-sm">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/material" />
      </Form>
    </div>
  );
}
