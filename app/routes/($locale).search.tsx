import {useLoaderData, useSearchParams, useNavigate} from 'react-router';
import type {Route} from './+types/search';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {SearchForm} from '~/components/layout/SearchForm';
import {SearchResults} from '~/components/layout/SearchResults';
import {
  type RegularSearchReturn,
  type PredictiveSearchReturn,
  getEmptyPredictiveSearchResult,
} from '~/lib/search';
import type {
  RegularSearchQuery,
  PredictiveSearchQuery,
} from 'storefrontapi.generated';
import {buildMeta} from '~/lib/meta';

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Search | Coinplugz',
    description: 'Search for recovery tokens, collections, and resources.',
    noIndex: true,
  });
};

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise: Promise<PredictiveSearchReturn | RegularSearchReturn> =
    isPredictive
      ? predictiveSearch({request, context})
      : regularSearch({request, context});

  searchPromise.catch((error: Error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return await searchPromise;
}

const SORT_OPTIONS = [
  {label: 'Relevance', value: 'relevance'},
  {label: 'Price: Low to High', value: 'price-asc'},
  {label: 'Price: High to Low', value: 'price-desc'},
  {label: 'Newest', value: 'newest'},
] as const;

/**
 * Renders the /search route
 */
export default function SearchPage() {
  const {type, term, result, error} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  if (type === 'predictive') return null;

  const currentSort = searchParams.get('sort') || 'relevance';
  const hasResults = term && result?.total;
  const productCount = result?.items?.products?.nodes?.length || 0;

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    navigate(`/search?${newParams.toString()}`);
  }

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <section className="pt-16 pb-10 md:pt-24 md:pb-14 px-4">
        <div style={{textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto'}}>
          <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '1rem'}}>
            Find Your Token
          </span>
          <h1 style={{fontFamily: 'var(--font-display, serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '1rem'}}>
            Search Our Collection
          </h1>
          <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '0.75rem'}}>
            Search by design name to find the perfect token for your milestone.
          </p>
          <p style={{fontSize: '0.875rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.3)', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2rem'}}>
            Try designs like "Mandala," "Sunflower," or "Dia de los Muertos"
          </p>

          {/* Search input */}
          <SearchForm>
            {({inputRef}) => (
              <div style={{maxWidth: '40rem', marginLeft: 'auto', marginRight: 'auto'}}>
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  {/* Search icon */}
                  <div style={{position: 'absolute', left: '1rem', pointerEvents: 'none'}}>
                    <svg style={{width: '1.25rem', height: '1.25rem', color: 'rgba(255,255,255,0.3)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <input
                    defaultValue={term}
                    name="q"
                    placeholder="Search by design name..."
                    ref={inputRef}
                    type="search"
                    style={{
                      width: '100%',
                      height: '3.5rem',
                      paddingLeft: '3rem',
                      paddingRight: '7rem',
                      borderRadius: '0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      border: '1px solid rgba(255,255,255,0.15)',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      height: '2.5rem',
                      paddingLeft: '1.5rem',
                      paddingRight: '1.5rem',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      backgroundColor: '#B8764F',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Search
                  </button>
                </div>
                {/* Keyboard shortcut hint */}
                <p style={{marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap'}}>
                  Press <kbd style={{padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.625rem'}}>⌘K</kbd> to focus search
                </p>
              </div>
            )}
          </SearchForm>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/[0.06]" />

      {/* Results area */}
      <section className="px-4 py-10 md:py-14 max-w-7xl mx-auto">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {hasResults ? (
          <>
            {/* Results header with count and sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-white/50 text-sm">
                  Showing <span className="text-white font-semibold">{productCount}</span> result{productCount !== 1 ? 's' : ''} for{' '}
                  <span className="text-white font-semibold">"{term}"</span>
                </p>
              </div>

              {/* Sort control */}
              <div className="flex items-center gap-3">
                <label htmlFor="sort-select" className="text-sm text-white/40 whitespace-nowrap">
                  Sort by
                </label>
                <div className="relative">
                  <select
                    id="sort-select"
                    value={currentSort}
                    onChange={handleSortChange}
                    className="appearance-none h-10 pl-4 pr-10 rounded-lg bg-white/[0.05] text-white text-sm border border-white/[0.1] hover:border-white/[0.15] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#111] text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <SearchResults result={result} term={term}>
              {({articles, pages, products, term}) => (
                <div>
                  <SearchResults.Products products={products} term={term} />
                  <SearchResults.Pages pages={pages} term={term} />
                  <SearchResults.Articles articles={articles} term={term} />
                </div>
              )}
            </SearchResults>
          </>
        ) : term ? (
          <SearchResults.Empty />
        ) : (
          /* Initial state — no search term yet */
          <InitialSearchState />
        )}
      </section>

      <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
    </div>
  );
}

/**
 * Shown when the user hasn't searched yet
 */
function InitialSearchState() {
  const suggestions = [
    'Mandala',
    'Sunflower',
    '7 Deadly Sinz',
    'Dia de los Muertos',
    'Color Printed',
    'Gift Sets',
  ];

  return (
    <div style={{textAlign: 'center', paddingTop: '2rem', paddingBottom: '4rem'}}>
      <div style={{
        width: '4rem',
        height: '4rem',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem auto',
      }}>
        <svg style={{width: '2rem', height: '2rem', color: 'rgba(255,255,255,0.2)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem'}}>
        Search by design name to find your token
      </p>
      <p style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.75rem'}}>
        Popular Designs
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem',
        maxWidth: '28rem',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {suggestions.map((suggestion) => (
          <a
            key={suggestion}
            href={`/search?q=${encodeURIComponent(suggestion)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            {suggestion}
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
` as const;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
` as const;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
` as const;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
    $sortKey: SearchSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: $sortKey,
      reverse: $reverse,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;

/**
 * Map URL sort param to Shopify SearchSortKeys
 */
function getSortKey(sort: string | null): string {
  switch (sort) {
    case 'price-asc':
    case 'price-desc':
      return 'PRICE';
    case 'newest':
      return 'CREATED_AT';
    default:
      return 'RELEVANCE';
  }
}

function getSortReverse(sort: string | null): boolean {
  return sort === 'price-desc';
}

/**
 * Regular search fetcher
 */
async function regularSearch({
  request,
  context,
}: Pick<
  Route.LoaderArgs,
  'request' | 'context'
>): Promise<RegularSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 12});
  const term = String(url.searchParams.get('q') || '');
  const sort = url.searchParams.get('sort');
  const sortKey = getSortKey(sort);
  const reverse = getSortReverse(sort);

  // Search articles, pages, and products for the `q` term
  const {
    errors,
    ...items
  }: {errors?: Array<{message: string}>} & RegularSearchQuery =
    await storefront.query(SEARCH_QUERY, {
      variables: {...variables, term, sortKey, reverse},
    });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc: number, {nodes}: {nodes: Array<unknown>}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}: {message: string}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
` as const;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
` as const;

/**
 * Predictive search fetcher
 */
async function predictiveSearch({
  request,
  context,
}: Pick<
  Route.ActionArgs,
  'request' | 'context'
>): Promise<PredictiveSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {
    predictiveSearch: items,
    errors,
  }: PredictiveSearchQuery & {errors?: Array<{message: string}>} =
    await storefront.query(PREDICTIVE_SEARCH_QUERY, {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
      },
    });

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors
        .map(({message}: {message: string}) => message)
        .join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc: number, item: Array<unknown>) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}
