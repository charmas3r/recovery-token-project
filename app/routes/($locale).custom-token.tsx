import {Outlet, useLoaderData, useLocation} from 'react-router';
import type {Route} from './+types/($locale).custom-token';
import {getCustomTokenSession, getCompletedSteps, getSteps} from '~/lib/custom-token-session';
import {WizardProgress} from '~/components/custom-token/WizardProgress';
import type {AppSession} from '~/lib/session';

export async function loader({context}: Route.LoaderArgs) {
  const sessionData = getCustomTokenSession(context.session as AppSession);
  return {sessionData};
}

export type CustomTokenOutletContext = {
  sessionData: ReturnType<typeof getCustomTokenSession>;
};

export default function CustomTokenLayout() {
  const {sessionData} = useLoaderData<typeof loader>();
  const location = useLocation();

  // Derive current step from URL pathname
  // e.g., /custom-token/we-design/occasion → 'occasion'
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentStep = pathSegments.length >= 3 ? pathSegments[pathSegments.length - 1] : '';

  return (
    <div style={{maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '3rem', paddingBottom: '3rem'}}>
      {sessionData?.path && currentStep && (
        <WizardProgress
          steps={getSteps(sessionData.path)}
          currentStep={currentStep}
          completedSteps={getCompletedSteps(sessionData)}
          basePath={`/custom-token/${sessionData.path}`}
        />
      )}
      <Outlet context={{sessionData} satisfies CustomTokenOutletContext} />
    </div>
  );
}
