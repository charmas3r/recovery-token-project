import {Suspense, useState, useEffect, useRef, useCallback} from 'react';
import {Await, NavLink, useAsyncValue, useNavigate} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/layout/Aside';
import {CoinPlugzLogo} from '~/components/layout/CoinPlugzLogo';

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll(); // check initial position
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.7)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo - Left */}
        <CoinPlugzLogo />

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
  cart,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  cart?: Promise<CartApiQueryFragment | null>;
}) {
  const {close} = useAside();

  // Title rewrites for menu items
  const TITLE_REWRITES: Record<string, string> = {
    Catalog: 'Shop',
  };

  // URL rewrites for custom routes that replace Shopify CMS pages
  const URL_REWRITES: Record<string, string> = {
    '/pages/contact': '/contact',
    '/pages/about': '/about',
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
      <MobileNav
        menu={menu}
        fallbackMenu={FALLBACK_HEADER_MENU}
        getUrl={getUrl}
        titleRewrites={TITLE_REWRITES}
        close={close}
        cart={cart}
      />
    );
  }

  // Build unified nav items: CMS items (filtered) + hardcoded items
  const HIDDEN_TITLES = new Set(['Contact', 'About']);
  const cmsItems = (menu || FALLBACK_HEADER_MENU).items
    .filter((item) => item.url && !HIDDEN_TITLES.has(item.title))
    .map((item) => ({
      title: TITLE_REWRITES[item.title] || item.title,
      url: getUrl(item.url!),
      id: item.id,
    }));

  const NAV_ITEMS: NavItem[] = [
    ...cmsItems.map((item) => ({
      title: item.title,
      url: item.url,
      children: NAV_CHILDREN[item.title],
    })),
    {title: 'About', url: '/about', children: NAV_CHILDREN['About']},
    {title: 'Resources', url: '/resources', children: NAV_CHILDREN['Resources']},
    {title: 'Support', url: '/support', children: NAV_CHILDREN['Support']},
  ];

  return (
    <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2" role="navigation">
      {NAV_ITEMS.map((item) => (
        <DesktopNavItem key={item.title} item={item} />
      ))}
    </nav>
  );
}

// --- Navigation dropdown types & data ---

interface NavChild {
  title: string;
  url: string;
  description?: string;
}

interface NavItem {
  title: string;
  url: string;
  children?: NavChild[];
}

const NAV_CHILDREN: Record<string, NavChild[]> = {
  About: [
    {title: 'Our Story', url: '/about/our-story', description: 'How Recovery Token began'},
    {title: 'Why Tokens Matter', url: '/about/why-tokens-matter', description: 'The power of tangible milestones'},
    {title: 'Testimonials', url: '/about/testimonials', description: 'Stories from our community'},
  ],
  Resources: [
    {title: 'Articles', url: '/resources/articles', description: 'Guides and inspiration'},
    {title: 'Glossary', url: '/resources/glossary', description: 'Recovery terminology'},
    {title: 'Milestone Calculator', url: '/resources/milestone-calculator', description: 'Track your journey'},
  ],
  Support: [
    {title: 'FAQ', url: '/support/faq', description: 'Common questions answered'},
    {title: 'Shipping & Returns', url: '/support/shipping-returns', description: 'Policies and timelines'},
  ],
};

function ChevronDownIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

function MobileSearchInput({navFont, close}: {navFont: string; close: () => void}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    close();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{marginTop: '12px', position: 'relative'}}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
        style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'}}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        autoComplete="off"
        style={{
          width: '100%',
          padding: '12px 16px 12px 42px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          color: '#fff',
          fontFamily: navFont,
          fontSize: '0.875rem',
          fontWeight: 400,
          outline: 'none',
        }}
      />
    </form>
  );
}

function MobileCartQuickView({
  cart,
  expanded,
  onToggle,
  close,
  navFont,
}: {
  cart?: Promise<CartApiQueryFragment | null>;
  expanded: boolean;
  onToggle: () => void;
  close: () => void;
  navFont: string;
}) {
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      {/* Cart toggle button */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px 20px',
          background: expanded ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
          borderRadius: expanded ? '12px 12px 0 0' : '12px',
          color: '#fff',
          border: expanded ? '1px solid rgba(255,255,147,0.3)' : '1px solid transparent',
          borderBottom: expanded ? '1px solid transparent' : '1px solid transparent',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: navFont,
          fontSize: '0.9375rem',
          fontWeight: 500,
          position: 'relative',
          transition: 'background 200ms ease, border-radius 200ms ease, border-color 200ms ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        Cart
        {cart && (
          <Suspense fallback={null}>
            <Await resolve={cart}>
              {(resolvedCart) => {
                const count = resolvedCart?.totalQuantity ?? 0;
                if (count === 0) return null;
                return (
                  <span
                    style={{
                      background: '#FFFF93',
                      color: '#1A202C',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      minWidth: '20px',
                      height: '20px',
                      padding: '0 5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {count}
                  </span>
                );
              }}
            </Await>
          </Suspense>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            marginLeft: 'auto',
            transition: 'transform 200ms ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.5,
          }}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {/* Expandable quick view panel */}
      <div
        style={{
          maxHeight: expanded ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 300ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '0 0 12px 12px',
            border: '1px solid rgba(255,255,147,0.3)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px',
          }}
        >
          {cart ? (
            <Suspense
              fallback={
                <p style={{color: 'rgba(255,255,255,0.4)', fontFamily: navFont, fontSize: '0.8125rem', textAlign: 'center', padding: '8px 0'}}>
                  Loading...
                </p>
              }
            >
              <Await resolve={cart}>
                {(resolvedCart) => (
                  <MobileCartItems cart={resolvedCart} close={close} navFont={navFont} />
                )}
              </Await>
            </Suspense>
          ) : (
            <p style={{color: 'rgba(255,255,255,0.4)', fontFamily: navFont, fontSize: '0.8125rem', textAlign: 'center', padding: '8px 0'}}>
              Your cart is empty
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileCartItems({
  cart,
  close,
  navFont,
}: {
  cart: CartApiQueryFragment | null;
  close: () => void;
  navFont: string;
}) {
  const lines = cart?.lines?.nodes ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;

  if (totalQuantity === 0 || lines.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '8px 0'}}>
        <p style={{color: 'rgba(255,255,255,0.4)', fontFamily: navFont, fontSize: '0.8125rem'}}>
          Your cart is empty
        </p>
        <NavLink
          to="/collections"
          onClick={close}
          style={{
            color: '#FFFF93',
            fontFamily: navFont,
            fontSize: '0.8125rem',
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-block',
            marginTop: '8px',
          }}
        >
          Start shopping →
        </NavLink>
      </div>
    );
  }

  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <div>
      {/* Cart items list (scrollable) */}
      <div style={{maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'}}>
        {lines.map((line) => {
          const {merchandise} = line;
          const {product, image} = merchandise;
          return (
            <div
              key={line.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              {/* Thumbnail */}
              {image?.url && (
                <img
                  src={`${image.url}&width=80`}
                  alt={image.altText || product.title}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
              )}
              {/* Details */}
              <div style={{flex: 1, minWidth: 0}}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontFamily: navFont,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    margin: 0,
                  }}
                >
                  {product.title}
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: navFont,
                    fontSize: '0.75rem',
                    margin: 0,
                  }}
                >
                  Qty: {line.quantity}
                  {line.cost?.totalAmount && (
                    <span style={{marginLeft: '8px'}}>
                      ${parseFloat(line.cost.totalAmount.amount).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtotal + View Cart */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px'}}>
          <span style={{color: 'rgba(255,255,255,0.4)', fontFamily: navFont, fontSize: '0.75rem'}}>
            Subtotal
          </span>
          <span style={{color: '#fff', fontFamily: navFont, fontSize: '0.875rem', fontWeight: 600}}>
            {subtotal ? `$${parseFloat(subtotal.amount).toFixed(2)}` : '—'}
          </span>
        </div>
        <NavLink
          to="/cart"
          onClick={close}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '10px 16px',
            background: '#FFFF93',
            color: '#1A202C',
            borderRadius: '8px',
            fontFamily: navFont,
            fontSize: '0.8125rem',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          View Cart →
        </NavLink>
      </div>
    </div>
  );
}

function MobileNav({
  menu,
  fallbackMenu,
  getUrl,
  titleRewrites,
  close,
  cart,
}: {
  menu: HeaderProps['header']['menu'];
  fallbackMenu: typeof FALLBACK_HEADER_MENU;
  getUrl: (url: string) => string;
  titleRewrites: Record<string, string>;
  close: () => void;
  cart?: Promise<CartApiQueryFragment | null>;
}) {
  const [subMenu, setSubMenu] = useState<string | null>(null);
  const [cartExpanded, setCartExpanded] = useState(false);

  // Build mobile nav items from CMS + hardcoded
  const HIDDEN_MOBILE = new Set(['Contact', 'About', 'Home']);
  const cmsItems = (menu || fallbackMenu).items
    .filter((item) => item.url && !HIDDEN_MOBILE.has(item.title))
    .map((item) => ({
      title: titleRewrites[item.title] || item.title,
      url: getUrl(item.url!),
      children: NAV_CHILDREN[titleRewrites[item.title] || item.title],
    }));

  const mobileItems: NavItem[] = [
    ...cmsItems,
    {title: 'About', url: '/about', children: NAV_CHILDREN['About']},
    {title: 'Resources', url: '/resources', children: NAV_CHILDREN['Resources']},
    {title: 'Support', url: '/support', children: NAV_CHILDREN['Support']},
  ];

  const activeParent = subMenu
    ? mobileItems.find((item) => item.title === subMenu)
    : null;

  const navFont = "'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'}}>
      {/* Sliding container */}
      <div
        style={{
          display: 'flex',
          width: '200%',
          flex: 1,
          transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          transform: subMenu ? 'translateX(-50%)' : 'translateX(0)',
          minHeight: 0,
        }}
      >
        {/* Main menu panel */}
        <div style={{width: '50%', display: 'flex', flexDirection: 'column', minHeight: 0}}>
          {/* Top Actions (Design CTA, Account, Cart, Order History, Search) */}
          <div style={{padding: '16px 24px 8px', flexShrink: 0}}>
            {/* Custom Token CTA — primary conversion */}
            <NavLink
              to="/custom-token"
              onClick={close}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px 20px',
                marginBottom: '8px',
                background: 'var(--color-accent, #B8764F)',
                borderRadius: '12px',
                color: '#000',
                textDecoration: 'none',
                fontFamily: navFont,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Design Your Token
            </NavLink>
            {/* Account & Cart row */}
            <div style={{display: 'flex', gap: '8px'}}>
              <NavLink
                to="/account"
                onClick={close}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flex: 1,
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontFamily: navFont,
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Account
              </NavLink>
              <MobileCartQuickView
                cart={cart}
                expanded={cartExpanded}
                onToggle={() => setCartExpanded((prev) => !prev)}
                close={close}
                navFont={navFont}
              />
            </div>
            {/* Order History link */}
            <NavLink
              to="/account/orders"
              onClick={close}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                padding: '14px 20px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: navFont,
                fontSize: '0.9375rem',
                fontWeight: 500,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Order History
            </NavLink>
            <MobileSearchInput navFont={navFont} close={close} />
          </div>

          {/* Nav items */}
          <nav role="navigation" style={{flex: 1, overflowY: 'auto', padding: '0 24px'}}>
            {mobileItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              if (hasChildren) {
                return (
                  <button
                    key={item.title}
                    onClick={() => setSubMenu(item.title)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '18px 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.7)',
                      fontFamily: navFont,
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      textAlign: 'left',
                    }}
                  >
                    {item.title}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              }
              return (
                <NavLink
                  key={item.title}
                  prefetch="intent"
                  to={item.url}
                  onClick={close}
                  style={{
                    display: 'block',
                    padding: '18px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontFamily: navFont,
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  }}
                >
                  {item.title}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sub-menu panel */}
        <div style={{width: '50%', display: 'flex', flexDirection: 'column', minHeight: 0}}>
          {activeParent && (
            <>
              {/* Back button */}
              <div style={{padding: '16px 24px 0'}}>
                <button
                  onClick={() => setSubMenu(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    padding: '8px 0',
                    fontFamily: navFont,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>

              <nav role="navigation" style={{flex: 1, overflowY: 'auto', padding: '8px 24px 0'}}>
                {/* Parent overview link */}
                <NavLink
                  prefetch="intent"
                  to={activeParent.url}
                  onClick={close}
                  style={{
                    display: 'block',
                    padding: '18px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontFamily: navFont,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                  }}
                >
                  {activeParent.title}
                </NavLink>

                {/* Children */}
                {activeParent.children!.map((child) => (
                  <NavLink
                    key={child.url}
                    prefetch="intent"
                    to={child.url}
                    onClick={close}
                    style={{
                      display: 'block',
                      padding: '16px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{display: 'block', color: 'rgba(255,255,255,0.7)', fontFamily: navFont, fontSize: '0.9375rem', fontWeight: 500}}>
                      {child.title}
                    </span>
                    {child.description && (
                      <span style={{display: 'block', color: 'rgba(255,255,255,0.3)', fontFamily: navFont, fontSize: '0.8125rem', marginTop: '3px'}}>
                        {child.description}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopNavItem({item}: {item: NavItem}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChildren = item.children && item.children.length > 0;
  const navigate = useNavigate();

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasChildren) setOpen(true);
  }, [hasChildren]);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!hasChildren) {
    return (
      <NavLink
        prefetch="intent"
        to={item.url}
        className="text-sm font-medium transition-colors"
        style={({isActive}) => ({color: isActive ? '#fff' : 'rgba(255,255,255,0.85)'})}
      >
        {item.title}
      </NavLink>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => navigate(item.url)}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
        style={{color: open ? '#fff' : 'rgba(255,255,255,0.85)'}}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.title}
        <ChevronDownIcon
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: `translateX(-50%) translateY(${open ? '0' : '-4px'})`,
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        <div
          style={{
            background: 'rgba(18, 18, 20, 0.85)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '8px',
            minWidth: '220px',
          }}
        >
          {/* Parent link */}
          <NavLink
            prefetch="intent"
            to={item.url}
            end
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
            style={{color: 'rgba(255,255,255,0.4)'}}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            All {item.title}
          </NavLink>

          {/* Divider */}
          <div style={{height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 16px'}} />

          {/* Children */}
          {item.children!.map((child) => (
            <NavLink
              key={child.url}
              prefetch="intent"
              to={child.url}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-lg transition-colors group"
              style={{color: 'rgba(255,255,255,0.75)'}}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
              }}
            >
              <span className="block text-sm font-medium">{child.title}</span>
              {child.description && (
                <span
                  className="block text-xs mt-0.5"
                  style={{color: 'rgba(255,255,255,0.4)'}}
                >
                  {child.description}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="flex items-center gap-4" role="navigation">
      <NavLink
        prefetch="intent"
        to="/custom-token"
        className="hidden lg:inline-flex items-center justify-center h-9 px-4 rounded-full bg-accent text-black text-sm font-semibold hover:bg-accent/90 transition-colors"
      >
        Design Your Token
      </NavLink>
      <HeaderMenuMobileToggle />
      <div className="hidden lg:flex items-center gap-5">
        <SearchToggle />
        <CartToggle cart={cart} />
        <NavLink
          prefetch="intent"
          to="/account"
          className="text-white/70 hover:text-white transition-colors p-2"
          style={{color: 'rgba(255,255,255,0.7)'}}
          aria-label="Account"
        >
          <AccountIcon />
        </NavLink>
      </div>
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="lg:hidden text-white/70 hover:text-white transition-colors p-2"
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
      className="text-white/70 hover:text-white transition-colors p-2"
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
      className="relative text-white/70 hover:text-white transition-colors p-2"
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
        <span className="absolute -top-1 -right-1 bg-accent text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
