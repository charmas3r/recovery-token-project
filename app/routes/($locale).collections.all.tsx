import type {Route} from './+types/collections.all';
import {useLoaderData, Form} from 'react-router';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/layout/PaginatedResourceSection';
import {ProductItem} from '~/components/product/ProductItem';
import {Button} from '~/components/ui/Button';
import {FEATURE_FLAGS} from '~/lib/feature-flags';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {buildMeta} from '~/lib/meta';

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'All Products | Coinplugz',
    description:
      'Browse our full collection of premium recovery tokens celebrating sobriety milestones.',
  });
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="collection">
      {FEATURE_FLAGS.CUSTOM_TOKEN && <ShopHero />}
      <div className="container-wide py-2xl">
        <h1 className="font-display text-section text-white mb-lg">
          All Products
        </h1>
        <PaginatedResourceSection<CollectionItemFragment>
          connection={products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

/**
 * Compact custom-token conversion hero — sits above the products grid
 * to capture visitors who didn't find what they wanted in the catalog.
 * Two CTAs POST to /custom-token to seed session state, mirroring the
 * landing page hero (commit a9a7c05).
 */
function ShopHero() {
  return (
    <section className="relative bg-black border-b border-white/[0.08]">
      <div className="container-wide">
        <div
          style={{
            textAlign: 'center',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingTop: '4rem',
            paddingBottom: '4rem',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Custom Tokens
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            Don&apos;t see your milestone?
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '2rem',
            }}
          >
            Design a custom token — pick the metal, the symbols, and the
            words that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Form method="post" action="/custom-token">
              <input type="hidden" name="path" value="you-design" />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto !px-10"
              >
                Design It Yourself
              </Button>
            </Form>
            <Form method="post" action="/custom-token">
              <input type="hidden" name="path" value="we-design" />
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Have Us Design It
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
