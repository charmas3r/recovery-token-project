import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/layout/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="bg-white border-b border-black/5">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo - Left */}
        <NavLink 
          prefetch="intent" 
          to="/" 
          end
          className="font-display text-xl font-bold text-primary uppercase tracking-wide hover:text-accent transition-colors"
        >
          {shop.name}
        </NavLink>

        {/* Navigation Menu - Center (Desktop only) */}
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />

        {/* CTAs - Right */}
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();

  // URL rewrites for custom routes that replace Shopify CMS pages
  const URL_REWRITES: Record<string, string> = {
    '/pages/contact': '/contact',
  };

  const getUrl = (itemUrl: string) => {
    let url =
      itemUrl.includes('myshopify.com') ||
      itemUrl.includes(publicStoreDomain) ||
      itemUrl.includes(primaryDomainUrl)
        ? new URL(itemUrl).pathname
        : itemUrl;

    // Apply URL rewrites for custom routes
    if (URL_REWRITES[url]) {
      url = URL_REWRITES[url];
    }

    return url;
  };

  if (viewport === 'mobile') {
    return (
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <nav className="flex-1 px-6 py-8" role="navigation">
          <div className="space-y-1">
            {(menu || FALLBACK_HEADER_MENU).items.map((item, index) => {
              if (!item.url) return null;
              const url = getUrl(item.url);
              return (
                <NavLink
                  end
                  key={item.id}
                  onClick={close}
                  prefetch="intent"
                  to={url}
                  className={({isActive}) =>
                    `group flex items-center justify-between py-4 border-b border-black/5 transition-all duration-200 ${
                      isActive
                        ? 'text-accent'
                        : 'text-primary hover:text-accent'
                    }`
                  }
                  style={{animationDelay: `${index * 50}ms`}}
                >
                  {({isActive}) => (
                    <>
                      <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {item.title}
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-accent' : 'text-secondary/40 group-hover:text-accent group-hover:translate-x-1'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </NavLink>
              );
            })}
            <NavLink
              onClick={close}
              prefetch="intent"
              to="/resources"
              className={({isActive}) =>
                `group flex items-center justify-between py-4 border-b border-black/5 transition-all duration-200 ${
                  isActive
                    ? 'text-accent'
                    : 'text-primary hover:text-accent'
                }`
              }
            >
              {({isActive}) => (
                <>
                  <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    Resources
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-accent' : 'text-secondary/40 group-hover:text-accent group-hover:translate-x-1'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </NavLink>
            <NavLink
              onClick={close}
              prefetch="intent"
              to="/support"
              className={({isActive}) =>
                `group flex items-center justify-between py-4 border-b border-black/5 transition-all duration-200 ${
                  isActive
                    ? 'text-accent'
                    : 'text-primary hover:text-accent'
                }`
              }
            >
              {({isActive}) => (
                <>
                  <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    Support
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-accent' : 'text-secondary/40 group-hover:text-accent group-hover:translate-x-1'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-black/10 px-6 py-6 bg-surface/50">
          <div className="flex items-center gap-4">
            <NavLink
              to="/account"
              onClick={close}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-black/10 rounded-lg text-primary hover:border-accent hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="font-medium">Account</span>
            </NavLink>
            <NavLink
              to="/search"
              onClick={close}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-black/10 rounded-lg text-primary hover:border-accent hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="font-medium">Search</span>
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2" role="navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;
        const url = getUrl(item.url);
        return (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            to={url}
            className={({isActive}) =>
              `text-base font-medium transition-colors ${
                isActive ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
              }`
            }
          >
            {item.title}
          </NavLink>
        );
      })}
      <NavLink
        prefetch="intent"
        to="/resources"
        className={({isActive}) =>
          `text-base font-medium transition-colors ${
            isActive ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
          }`
        }
      >
        Resources
      </NavLink>
      <NavLink
        prefetch="intent"
        to="/support"
        className={({isActive}) =>
          `text-base font-medium transition-colors ${
            isActive ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
          }`
        }
      >
        Support
      </NavLink>
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="flex items-center gap-6" role="navigation">
      <HeaderMenuMobileToggle />
      <div className="hidden lg:flex items-center gap-6">
        <SearchToggle />
        <CartToggle cart={cart} />
        <NavLink 
          prefetch="intent" 
          to="/account"
          className="text-primary hover:text-accent transition-colors"
          aria-label="Account"
        >
          <Suspense fallback={<AccountIcon />}>
            <Await resolve={isLoggedIn} errorElement={<AccountIcon />}>
              {() => <AccountIcon />}
            </Await>
          </Suspense>
        </NavLink>
      </div>
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="lg:hidden text-primary hover:text-accent transition-colors p-2"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button 
      className="text-primary hover:text-accent transition-colors p-2" 
      onClick={() => open('search')}
      aria-label="Search"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="relative text-primary hover:text-accent transition-colors p-2"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      aria-label={`Cart with ${count ?? 0} items`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count !== null && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function AccountIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
