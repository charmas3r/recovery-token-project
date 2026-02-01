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
      <div className="container-standard py-8 md:py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block">
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
                <MobileNavLink to="/account/profile">Profile</MobileNavLink>
                <MobileNavLink to="/account/addresses">Addresses</MobileNavLink>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <main>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-black/5">
              {/* Page Header */}
              <div className="mb-8 pb-6 border-b border-black/5">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
                  {heading}
                </h1>
                {subheading && (
                  <p className="mt-2 text-body text-secondary">{subheading}</p>
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
