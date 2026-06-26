import {Await, Link} from 'react-router';
import {Suspense, useId, useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/layout/Aside';
import {Footer} from '~/components/layout/Footer';
import {Header, HeaderMenu} from '~/components/layout/Header';
import {CartMain} from '~/components/cart/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/layout/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/layout/SearchResultsPredictive';
import type {AnnouncementBarData} from '~/lib/sanity.queries';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  announcement?: AnnouncementBarData | null;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  announcement,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} cart={cart} />
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar data={announcement} />
        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
      </div>
      {/* Padding for fixed header + announcement bar */}
      <main className="pt-24">{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

/**
 * Announcement Bar Component
 * Displays promotional messages at the top of the page.
 * Content is managed via Sanity CMS.
 */
function AnnouncementBar({data}: {data?: AnnouncementBarData | null}) {
  if (!data || !data.enabled || !data.message) {
    return null;
  }

  const style: React.CSSProperties = {};
  if (data.backgroundColor) style.backgroundColor = data.backgroundColor;
  if (data.textColor) style.color = data.textColor;

  return (
    <div
      className="bg-primary text-white py-3 px-4 text-center"
      style={style}
    >
      <p className="text-sm font-medium tracking-wide">
        {data.message}
        {data.linkText && data.linkUrl && (
          <>
            {' '}
            <Link
              to={data.linkUrl}
              className="underline underline-offset-2 hover:opacity-80"
            >
              {data.linkText}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  // Ref lives here, in the STABLE aside component, so it survives the inner
  // child remounting when the cart promise settles — otherwise the guard resets
  // and cart_viewed fires more than once per open.
  const firedForThisOpen = useRef(false);
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => (
            <>
              <CartMain cart={cart} layout="aside" />
              <CartViewAnalytics cart={cart} firedRef={firedForThisOpen} />
            </>
          )}
        </Await>
      </Suspense>
    </Aside>
  );
}

/**
 * Publishes Hydrogen's `cart_viewed` event (→ GA4 `view_cart`, and PostHog)
 * exactly once each time the cart aside opens.
 *
 * Two traps this avoids: (1) `Aside` always renders its children (it toggles a
 * CSS class, not mounting), so an unconditional `Analytics.CartView` would fire
 * on every page load; (2) `Analytics.CartView`'s own effect re-fires as the cart
 * data settles on open, which produced THREE `cart_viewed` events per open in
 * testing. Publishing manually behind an open-transition ref guard gives a clean
 * one-per-open, while still routing through Hydrogen so every subscriber
 * (PostHog included) receives it.
 */
function CartViewAnalytics({
  cart,
  firedRef,
}: {
  cart: CartApiQueryFragment | null;
  firedRef: React.MutableRefObject<boolean>;
}) {
  const {type} = useAside();
  const {publish} = useAnalytics();
  const open = type === 'cart';

  useEffect(() => {
    if (!open) {
      firedRef.current = false; // reset so the next open fires once
      return;
    }
    if (cart && !firedRef.current) {
      firedRef.current = true;
      publish('cart_viewed', {cart});
    }
  }, [open, cart, publish, firedRef]);

  return null;
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
  cart,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
  cart: PageLayoutProps['cart'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          cart={cart}
        />
      </Aside>
    )
  );
}
