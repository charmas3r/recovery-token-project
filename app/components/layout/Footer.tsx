import {Suspense, useState, useEffect} from 'react';
import {Await, NavLink, Link, useFetcher} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <FooterContent
            menu={footer?.menu}
            shop={header.shop}
            primaryDomainUrl={header.shop.primaryDomain?.url}
            publicStoreDomain={publicStoreDomain}
          />
        )}
      </Await>
    </Suspense>
  );
}

const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: [
      {label: 'All Tokens', to: '/collections'},
      {label: 'Color Printed', to: '/collections/color-printed'},
      {label: 'Skullz & Flowerz', to: '/collections/skullz-flowerz'},
      {label: 'Gift Sets', to: '/collections/gift-sets'},
    ],
  },
  {
    title: 'Company',
    links: [
      {label: 'About', to: '/about'},
      {label: 'Our Story', to: '/about'},
      {label: 'Reviews', to: '/reviews'},
      {label: 'Blog', to: '/blogs'},
    ],
  },
  {
    title: 'Support',
    links: [
      {label: 'Contact', to: '/contact'},
      {label: 'FAQ', to: '/support/faq'},
      {label: 'Shipping & Returns', to: '/support/shipping-returns'},
      {label: 'Track Order', to: '/account/orders'},
    ],
  },
  {
    title: 'Legal',
    links: [
      {label: 'Privacy Policy', to: '/policies/privacy-policy'},
      {label: 'Refund Policy', to: '/policies/refund-policy'},
      {label: 'Shipping Policy', to: '/policies/shipping-policy'},
      {label: 'Terms of Service', to: '/policies/terms-of-service'},
    ],
  },
];

function FooterContent({
  menu,
  shop,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu?: FooterQuery['menu'];
  shop: HeaderQuery['shop'];
  primaryDomainUrl?: string;
  publicStoreDomain: string;
}) {
  const [email, setEmail] = useState('');
  const fetcher = useFetcher<{success?: boolean; error?: string}>();
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;
  const hasError = fetcher.data?.error;

  useEffect(() => {
    if (isSuccess) {
      setEmail('');
    }
  }, [isSuccess]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit(
      {email, consent: 'true'},
      {method: 'POST', action: '/newsletter'},
    );
  };

  return (
    <footer className="bg-black text-white">
      {/* Top separator line */}
      <div
        className="h-px"
        style={{background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)'}}
      />

      <div className="container-standard" style={{paddingTop: '5rem', paddingBottom: '2rem'}}>
        {/* Main grid: brand left, link columns right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8" style={{marginBottom: '4rem'}}>

          {/* Left column — brand + socials */}
          <div className="lg:col-span-3">
            <Link to="/" className="inline-block mb-5">
              <span
                className="font-display text-xl font-bold text-white"
                style={{letterSpacing: '-0.01em'}}
              >
                {shop.name}
              </span>
            </Link>

            <p style={{fontSize: '0.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', maxWidth: '16rem'}}>
              Celebrating every step of your recovery journey with meaningful, hand-crafted milestone tokens.
            </p>

            {/* Social icons */}
            <div className="flex gap-3" style={{marginBottom: '1.75rem'}}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)'}}
                aria-label="Twitter / X"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)'}}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)'}}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </div>

            {/* Newsletter removed for now */}
          </div>

          {/* Right columns — link groups */}
          <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3
                  className="font-display font-semibold text-white"
                  style={{fontSize: '0.875rem', marginBottom: '1.25rem'}}
                >
                  {column.title}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm transition-colors duration-200 inline-block"
                        style={{color: 'rgba(255,255,255,0.4)'}}
                        onMouseEnter={(e) => {e.currentTarget.style.color = 'rgba(255,255,255,0.8)';}}
                        onMouseLeave={(e) => {e.currentTarget.style.color = 'rgba(255,255,255,0.4)';}}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}
        >
          <p style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)'}}>
            © {new Date().getFullYear()} {shop.name}. All rights reserved.
          </p>
          <FooterLegalMenu
            menu={menu}
            primaryDomainUrl={primaryDomainUrl}
            publicStoreDomain={publicStoreDomain}
          />
        </div>
      </div>
    </footer>
  );
}

function FooterLegalMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu?: FooterQuery['menu'];
  primaryDomainUrl?: string;
  publicStoreDomain: string;
}) {
  const menuItems = menu?.items || FALLBACK_FOOTER_MENU.items;

  return (
    <nav className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2" role="navigation">
      {menuItems.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          (primaryDomainUrl && item.url.includes(primaryDomainUrl))
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a
            href={url}
            key={item.id}
            rel="noopener noreferrer"
            target="_blank"
            style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)'}}
            className="transition-colors duration-200 whitespace-nowrap hover:text-white/60"
          >
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            to={url}
            style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)'}}
            className="transition-colors duration-200 whitespace-nowrap hover:text-white/60"
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/* ==========================================
 * Social Media Icons
 * ========================================== */

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{color: 'rgba(255,255,255,0.5)'}}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{color: 'rgba(255,255,255,0.5)'}}
    >
      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{color: 'rgba(255,255,255,0.5)'}}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
