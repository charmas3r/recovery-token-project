import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl font-bold text-white mb-4 uppercase tracking-tight">
        Articles
      </h2>
      <div className="grid gap-3">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <Link
              key={article.id}
              prefetch="intent"
              to={articleUrl}
              className="block rounded-xl border border-white/[0.08] px-5 py-4 text-white hover:border-white/[0.15] transition-colors duration-200"
              style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
            >
              <span className="font-medium">{article.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl font-bold text-white mb-4 uppercase tracking-tight">
        Pages
      </h2>
      <div className="grid gap-3">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <Link
              key={page.id}
              prefetch="intent"
              to={pageUrl}
              className="block rounded-xl border border-white/[0.08] px-5 py-4 text-white hover:border-white/[0.15] transition-colors duration-200"
              style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
            >
              <span className="font-medium">{page.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="mt-8">
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          return (
            <div>
              {/* Previous page */}
              <div className="flex justify-center mb-6">
                <PreviousLink>
                  {isLoading ? (
                    <span className="text-white/40 text-sm">Loading...</span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors duration-200 border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-5 py-2.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                      Load previous
                    </span>
                  )}
                </PreviousLink>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {nodes.map((product) => {
                  const productUrl = urlWithTrackingParams({
                    baseUrl: `/products/${product.handle}`,
                    trackingParams: product.trackingParameters,
                    term,
                  });

                  const price = product?.selectedOrFirstAvailableVariant?.price;
                  const image = product?.selectedOrFirstAvailableVariant?.image;

                  return (
                    <Link
                      key={product.id}
                      prefetch="intent"
                      to={productUrl}
                      className="group block focus:outline-none"
                    >
                      <div
                        className="rounded-2xl overflow-hidden border border-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15]"
                        style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
                      >
                        {/* Product image */}
                        {image && (
                          <div className="aspect-[4/5] relative overflow-hidden bg-black/40">
                            <Image
                              data={image}
                              alt={product.title}
                              aspectRatio="4/5"
                              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 transition-colors duration-300 bg-white/0 group-hover:bg-white/[0.03]" />
                          </div>
                        )}

                        {/* Product info */}
                        <div className="p-4 md:p-5">
                          <h3 className="text-sm md:text-base font-display font-bold uppercase tracking-tight text-white line-clamp-2 mb-2 group-hover:text-white/80 transition-colors duration-200">
                            {product.title}
                          </h3>
                          {price && (
                            <p className="text-base md:text-lg font-bold text-white/90">
                              <Money data={price} />
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Next page */}
              <div className="flex justify-center mt-8">
                <NextLink>
                  {isLoading ? (
                    <span className="text-white/40 text-sm">Loading...</span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors duration-200 border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-5 py-2.5">
                      Load more
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <div style={{textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem'}}>
      {/* Search icon */}
      <div className="mx-auto w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '24rem', marginLeft: 'auto', marginRight: 'auto'}}>
        No results found. Try a different search term or browse our collections.
      </p>
      <Link
        to="/collections"
        className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-accent hover:text-accent/80 transition-colors duration-200"
      >
        Browse Collections
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}
