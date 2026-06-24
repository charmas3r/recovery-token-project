import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).lp.$handle';
import {buildMeta} from '~/lib/meta';
import {getAdLanding} from '~/data/ad-landings';
import {AdLandingTemplate} from '~/components/landing/AdLandingTemplate';

export const meta: Route.MetaFunction = ({data, location}) => {
  if (!data?.landing) {
    return buildMeta({title: 'Custom Milestones', noIndex: true});
  }
  const {landing} = data;
  // Paid/social ad-landing pages: keep them OUT of organic search so they don't
  // compete with or duplicate the SEO pages. `url` is retained for og:url (social
  // shares); noIndex emits robots noindex,nofollow. Not included in any sitemap.
  return buildMeta({
    title: landing.meta.title,
    description: landing.meta.description,
    url: location.pathname,
    noIndex: true,
  });
};

export async function loader({params}: Route.LoaderArgs) {
  const landing = getAdLanding(params.handle);
  if (!landing) {
    throw new Response('Not Found', {status: 404});
  }
  return {landing};
}

export default function AdLandingRoute() {
  const {landing} = useLoaderData<typeof loader>();
  return <AdLandingTemplate landing={landing} />;
}
