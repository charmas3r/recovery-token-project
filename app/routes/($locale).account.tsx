import {
  data as remixData,
  Outlet,
  useLoaderData,
  redirect,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context, request}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  // Check if user is logged in, redirect to login if not
  const isLoggedIn = await customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    const url = new URL(request.url);
    return redirect(`/account/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayoutRoute() {
  const {customer} = useLoaderData<typeof loader>();

  return <Outlet context={{customer}} />;
}
