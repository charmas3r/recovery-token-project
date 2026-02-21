import {redirect} from 'react-router';
import type {Route} from './+types/account_.authorize';

export async function loader({context}: Route.LoaderArgs) {
  try {
    return await context.customerAccount.authorize();
  } catch (error) {
    // If the OAuth code exchange fails (e.g., expired/invalid code,
    // stale session, or cross-context login), redirect back to login
    // so the user can seamlessly re-authenticate.
    if (error instanceof Response && error.status >= 400 && error.status < 500) {
      console.error(
        'Customer Account authorize failed, redirecting to login:',
        error.status,
      );
      return redirect('/account/login');
    }
    throw error;
  }
}
