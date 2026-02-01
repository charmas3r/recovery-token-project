/**
 * AccountNav Component - Design System
 * 
 * Sidebar navigation for account pages
 * @see .cursor/skills/design-system/SKILL.md
 */

import {NavLink, Form} from 'react-router';
import {Package, User, MapPin, LogOut, LayoutDashboard} from 'lucide-react';

const navItems = [
  {to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true},
  {to: '/account/orders', label: 'Orders', icon: Package},
  {to: '/account/profile', label: 'Profile', icon: User},
  {to: '/account/addresses', label: 'Addresses', icon: MapPin},
];

export function AccountNav() {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({isActive}) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-body font-medium transition-all duration-200 ${
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-secondary hover:bg-surface hover:text-primary'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </NavLink>
      ))}
      
      {/* Sign Out */}
      <Form method="POST" action="/account/logout" className="pt-4 border-t border-black/5 mt-4">
        <button
          type="submit"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-body font-medium text-secondary hover:bg-surface hover:text-error transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </Form>
    </nav>
  );
}
