import {Suspense, useState, useEffect, useRef, useCallback} from 'react';
import {Await, NavLink, useAsyncValue, useNavigate} from 'react-router';
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
        <NavLink
          prefetch="intent"
          to="/"
          end
          className="font-display text-xl font-bold text-white uppercase tracking-wide hover:text-accent transition-colors"
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
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <nav className="flex-1 px-6 py-8" role="navigation">
          <div className="space-y-1">
            {(menu || FALLBACK_HEADER_MENU).items.filter((item) => item.url && item.title !== 'Contact' && item.title !== 'About').map((item, index) => {
              const url = getUrl(item.url!);
              return (
                <NavLink
                  end
                  key={item.id}
                  onClick={close}
                  prefetch="intent"
                  to={url}
                  className={({isActive}) =>
                    `group flex items-center justify-between py-4 border-b border-white/[0.08] transition-all duration-200 ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`
                  }
                  style={{animationDelay: `${index * 50}ms`}}
                >
                  {({isActive}) => (
                    <>
                      <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {TITLE_REWRITES[item.title] || item.title}
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white group-hover:translate-x-1'}`}
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
                `group flex items-center justify-between py-4 border-b border-white/[0.08] transition-all duration-200 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              {({isActive}) => (
                <>
                  <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    Resources
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white group-hover:translate-x-1'}`}
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
              to="/about"
              className={({isActive}) =>
                `group flex items-center justify-between py-4 border-b border-white/[0.08] transition-all duration-200 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              {({isActive}) => (
                <>
                  <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    About
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white group-hover:translate-x-1'}`}
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
              to="/reviews"
              className={({isActive}) =>
                `group flex items-center justify-between py-4 border-b border-white/[0.08] transition-all duration-200 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              {({isActive}) => (
                <>
                  <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    Reviews
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white group-hover:translate-x-1'}`}
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
                `group flex items-center justify-between py-4 border-b border-white/[0.08] transition-all duration-200 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              {({isActive}) => (
                <>
                  <span className={`font-display text-2xl tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    Support
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white group-hover:translate-x-1'}`}
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
        <div className="border-t border-white/[0.08] px-6 py-6 bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <NavLink
              to="/account"
              onClick={close}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/70 hover:border-white/[0.15] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="font-medium">Account</span>
            </NavLink>
            <NavLink
              to="/search"
              onClick={close}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/70 hover:border-white/[0.15] hover:text-white transition-colors"
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
    {title: 'Reviews', url: '/reviews'},
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
    <nav className="flex items-center gap-6" role="navigation">
      <HeaderMenuMobileToggle />
      <div className="hidden lg:flex items-center gap-6">
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
