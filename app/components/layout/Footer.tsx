import {Suspense, useState} from 'react';
import {Await, NavLink, Link} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {FadeUp, StaggerContainer, StaggerItem} from '~/components/ui/Animations';

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
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <footer className="bg-primary text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container-standard relative z-10 pt-16 md:pt-20 pb-8">
        {/* Main footer content */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10 mb-12" staggerDelay={0.1}>
          {/* Brand column - spans 4 cols on large screens */}
          <StaggerItem className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6">
              <div className="font-display text-2xl font-bold text-white hover:text-accent transition-colors duration-200">
                {shop.name}
              </div>
            </Link>
            <p className="!text-white/80 text-[15px] leading-relaxed mb-6 pr-4">
              Celebrating every step of your recovery journey with meaningful, hand-crafted milestone tokens.
            </p>
            {/* Social links */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent transition-colors duration-200 flex items-center justify-center"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent transition-colors duration-200 flex items-center justify-center"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent transition-colors duration-200 flex items-center justify-center"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>
            </div>
          </StaggerItem>

          {/* Shop column - spans 2 cols */}
          <StaggerItem className="lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-white mb-6">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/collections"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/bronze-tokens"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  Bronze Tokens
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/custom-tokens"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  Custom Engraving
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/gift-sets"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  Gift Sets
                </Link>
              </li>
            </ul>
          </StaggerItem>

          {/* Support column - spans 2 cols */}
          <StaggerItem className="lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-white mb-6">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/pages/contact"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/faq"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/shipping"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/returns"
                  className="!text-white/70 text-[15px] hover:!text-accent transition-colors duration-200 inline-block"
                >
                  Returns
                </Link>
              </li>
            </ul>
          </StaggerItem>

          {/* Newsletter column - spans 4 cols */}
          <StaggerItem className="lg:col-span-4">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              Join Our Community
            </h3>
            <p className="!text-white/80 text-[15px] leading-relaxed mb-6">
              Get stories, updates, and special offers delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 pr-32 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-accent text-white text-sm font-semibold rounded-md hover:bg-accent/90 transition-colors duration-200 shadow-sm"
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </StaggerItem>
        </StaggerContainer>

        {/* Footer bottom */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="!text-white/60 text-sm">
              © {new Date().getFullYear()} {shop.name}. All rights reserved.
            </p>

            {/* Legal links */}
            <FooterMenu
              menu={menu}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterMenu({
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
    <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2" role="navigation">
      {menuItems.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
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
            className="!text-white/60 hover:!text-accent text-sm transition-colors duration-200 whitespace-nowrap"
          >
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            to={url}
            className={({isActive}) =>
              `text-sm transition-colors duration-200 whitespace-nowrap ${
                isActive ? '!text-accent font-semibold' : '!text-white/60 hover:!text-accent'
              }`
            }
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
