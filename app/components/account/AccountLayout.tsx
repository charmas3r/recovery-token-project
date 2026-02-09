/**
 * AccountLayout Component - Design System
 * 
 * Account page layout with sidebar navigation
 * @see .cursor/skills/design-system/SKILL.md
 */

import {NavLink} from 'react-router';
import {AccountNav} from './AccountNav';

interface AccountLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading?: string;
}

export function AccountLayout({children, heading, subheading}: AccountLayoutProps) {
  return (
    <div className="bg-surface min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:w-[280px] flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 sticky top-24">
              <AccountNav />
            </div>
          </aside>
          
          {/* Mobile Nav */}
          <div className="lg:hidden">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-black/5 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <MobileNavLink to="/account" end>Dashboard</MobileNavLink>
                <MobileNavLink to="/account/orders">Orders</MobileNavLink>
                <MobileNavLink to="/account/circle">Circle</MobileNavLink>
                <MobileNavLink to="/account/wishlist">Wishlist</MobileNavLink>
                <MobileNavLink to="/account/profile">Profile</MobileNavLink>
                <MobileNavLink to="/account/addresses">Addresses</MobileNavLink>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-black/5">
              {/* Page Header */}
              <div className="mb-8 pb-6 border-b border-black/5">
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                  {heading}
                </h1>
                {subheading && (
                  <p className="mt-3 text-body-lg text-secondary">{subheading}</p>
                )}
              </div>
              
              {/* Page Content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Mobile nav link component
function MobileNavLink({
  to,
  children,
  end,
}: {
  to: string;
  children: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({isActive}) =>
        `px-4 py-2 rounded-lg text-body-sm font-medium whitespace-nowrap transition-colors ${
          isActive
            ? 'bg-accent text-white'
            : 'bg-surface text-secondary hover:bg-accent/10 hover:text-accent'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
