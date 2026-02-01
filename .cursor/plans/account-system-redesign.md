# Feature: Account System Redesign

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Transform the existing scaffold account pages into a design-system-compliant, premium experience. The account area will feature a clean sidebar navigation, styled order cards, formatted forms, and proper visual hierarchy matching the rest of the site.

## User Story

As a **returning customer**
I want to **view my order history, manage my profile, and update my addresses in a beautiful, easy-to-use interface**
So that **I can track my recovery milestones and manage my account with confidence**

## Problem Statement

The current account pages use default Hydrogen scaffold styling with:
- Basic HTML with no design system tokens
- `<br />` and `&nbsp;` for spacing
- Unstyled `<fieldset>` elements
- Inline styles for navigation
- No visual hierarchy or card layouts
- No mobile responsiveness

This creates a jarring experience when users navigate from the beautifully designed homepage/PDP to basic, unstyled account pages.

## Solution Statement

Redesign all account pages to follow the established design system patterns with:
- **Account Layout**: Sidebar navigation + main content area
- **Dashboard**: Welcome message, quick stats, recent orders preview
- **Orders List**: Styled order cards with status badges
- **Order Detail**: Formatted order with items, addresses, totals
- **Profile**: Styled form with proper validation feedback
- **Addresses**: Address cards with edit/delete actions

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium-High
**Primary Systems Affected**: 
- `app/routes/($locale).account.tsx` - Layout wrapper
- `app/routes/($locale).account._index.tsx` - Dashboard
- `app/routes/($locale).account.orders._index.tsx` - Orders list
- `app/routes/($locale).account.orders.$id.tsx` - Order detail
- `app/routes/($locale).account.profile.tsx` - Profile form
- `app/routes/($locale).account.addresses.tsx` - Address management

**Dependencies**: 
- Existing design system tokens
- Button, Input components from `~/components/ui`
- Customer Account API queries (already implemented)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

**Current Account Routes (to redesign):**
- `app/routes/($locale).account.tsx` - Layout with basic nav
- `app/routes/($locale).account._index.tsx` - Redirects to orders (will become dashboard)
- `app/routes/($locale).account.orders._index.tsx` - Unstyled order list
- `app/routes/($locale).account.orders.$id.tsx` - Unstyled order detail
- `app/routes/($locale).account.profile.tsx` - Unstyled profile form
- `app/routes/($locale).account.addresses.tsx` - Unstyled address forms

**Design System:**
- `DESIGN-SYSTEM.md` - Full pattern documentation
- `.cursor/skills/design-system/SKILL.md` - Typography, colors, spacing tokens
- `app/styles/tailwind.css` - Design token definitions
- `app/components/ui/Button.tsx` - Button styling reference
- `app/components/ui/Input.tsx` - Input component reference
- `app/components/ui/Card.tsx` - Card compound component

**Homepage/PDP Patterns:**
- `app/routes/($locale)._index.tsx` - Section layouts, eyebrow patterns
- `app/routes/($locale).products.$handle.tsx` - Two-column layout pattern

**Existing Account Components:**
- `app/components/layout/Header.tsx` - Account icon in header
- `app/components/layout/PageLayout.tsx` - Page wrapper

### Files to Create

- `app/components/account/AccountLayout.tsx` - Sidebar + content wrapper
- `app/components/account/AccountNav.tsx` - Sidebar navigation
- `app/components/account/OrderCard.tsx` - Order summary card
- `app/components/account/AddressCard.tsx` - Address display card

### Files to Modify

- `app/routes/($locale).account.tsx` - Use new AccountLayout
- `app/routes/($locale).account._index.tsx` - Create dashboard view
- `app/routes/($locale).account.orders._index.tsx` - Use OrderCard
- `app/routes/($locale).account.orders.$id.tsx` - Styled detail page
- `app/routes/($locale).account.profile.tsx` - Styled form
- `app/routes/($locale).account.addresses.tsx` - Use AddressCard

---

## DESIGN PATTERNS

### Account Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (existing)                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌────────────────────────────────────┐   │
│  │ Sidebar  │  │ Main Content                        │   │
│  │          │  │                                     │   │
│  │ Dashboard│  │ Page Title                          │   │
│  │ Orders   │  │ ──────────────────────              │   │
│  │ Profile  │  │                                     │   │
│  │ Addresses│  │ Content...                          │   │
│  │          │  │                                     │   │
│  │ Sign Out │  │                                     │   │
│  └──────────┘  └────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘

Mobile: Sidebar becomes horizontal tabs or accordion
```

### Typography Hierarchy

```tsx
// Page heading
<h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
  Welcome back, {firstName}
</h1>

// Section heading
<h2 className="font-display text-xl font-bold text-primary mb-4">
  Recent Orders
</h2>

// Card title
<h3 className="font-display text-lg font-bold text-primary">
  Order #1234
</h3>
```

### Order Card Design

```
┌────────────────────────────────────────────────┐
│ Order #1234              Fulfilled ●           │
│ January 15, 2026                               │
│────────────────────────────────────────────────│
│ 🖼️ 1 Year Token (Bronze)                       │
│ 🖼️ 6 Month Token (Silver)                      │
│────────────────────────────────────────────────│
│ Total: $89.00              [View Details →]    │
└────────────────────────────────────────────────┘
```

### Address Card Design

```
┌────────────────────────────────────────────────┐
│ 🏠 Home                          ★ Default     │
│────────────────────────────────────────────────│
│ John Smith                                      │
│ 123 Main Street                                │
│ New York, NY 10001                             │
│ United States                                  │
│────────────────────────────────────────────────│
│ [Edit]                              [Delete]   │
└────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION PLAN

### Phase 1: Account Components
Create reusable account components.

**Tasks:**
1. Create `AccountNav` sidebar navigation component
2. Create `AccountLayout` wrapper with sidebar + content
3. Create `OrderCard` for order summaries
4. Create `AddressCard` for address display

### Phase 2: Account Layout & Dashboard
Update the main account layout and create dashboard.

**Tasks:**
1. Update `($locale).account.tsx` to use AccountLayout
2. Create dashboard in `($locale).account._index.tsx`
3. Add quick stats and recent orders preview

### Phase 3: Orders Pages
Redesign order list and detail pages.

**Tasks:**
1. Redesign `($locale).account.orders._index.tsx` with OrderCard
2. Redesign `($locale).account.orders.$id.tsx` with proper layout

### Phase 4: Profile & Addresses
Redesign profile and address management.

**Tasks:**
1. Redesign `($locale).account.profile.tsx` with styled form
2. Redesign `($locale).account.addresses.tsx` with AddressCard

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Task 1: CREATE `app/components/account/AccountNav.tsx`

- **IMPLEMENT**: Sidebar navigation for account pages
- **PATTERN**: Use NavLink with active states
- **IMPORTS**: 
  ```tsx
  import {NavLink, Form} from 'react-router';
  import {Package, User, MapPin, LogOut, LayoutDashboard} from 'lucide-react';
  ```

**Implementation:**

```tsx
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
```

- **VALIDATE**: `npm run typecheck`

---

### Task 2: CREATE `app/components/account/AccountLayout.tsx`

- **IMPLEMENT**: Wrapper with sidebar and main content area
- **PATTERN**: Responsive sidebar (hidden on mobile, shown in sheet)

**Implementation:**

```tsx
/**
 * AccountLayout Component - Design System
 * 
 * Account page layout with sidebar navigation
 * @see .cursor/skills/design-system/SKILL.md
 */

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
          {/* Sidebar - Hidden on mobile, could add mobile nav later */}
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
import {NavLink} from 'react-router';

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
```

- **VALIDATE**: `npm run typecheck`

---

### Task 3: CREATE `app/components/account/OrderCard.tsx`

- **IMPLEMENT**: Order summary card for orders list
- **PATTERN**: Card with status badge and item preview

**Implementation:**

```tsx
/**
 * OrderCard Component - Design System
 * 
 * Order summary card for account orders list
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Link} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import type {OrderItemFragment} from 'customer-accountapi.generated';
import {ChevronRight} from 'lucide-react';

interface OrderCardProps {
  order: OrderItemFragment;
  fulfillmentStatus?: string;
}

export function OrderCard({order, fulfillmentStatus}: OrderCardProps) {
  const orderUrl = `/account/orders/${btoa(order.id)}`;
  const orderDate = new Date(order.processedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="bg-white rounded-xl border border-black/5 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
        <div>
          <Link 
            to={orderUrl}
            className="font-display text-lg font-bold text-primary hover:text-accent transition-colors"
          >
            Order #{order.number}
          </Link>
          <p className="text-body-sm text-secondary mt-0.5">{orderDate}</p>
        </div>
        <OrderStatusBadge 
          financialStatus={order.financialStatus} 
          fulfillmentStatus={fulfillmentStatus}
        />
      </div>
      
      {/* Items Preview */}
      <div className="px-5 py-4 space-y-3">
        {order.lineItems?.nodes?.slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            {item.image && (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                <Image
                  data={item.image}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-primary font-medium truncate">
                {item.title}
              </p>
              {item.variantTitle && item.variantTitle !== 'Default Title' && (
                <p className="text-caption text-secondary truncate">
                  {item.variantTitle}
                </p>
              )}
            </div>
            <span className="text-body-sm text-secondary">×{item.quantity}</span>
          </div>
        ))}
        {order.lineItems?.nodes && order.lineItems.nodes.length > 2 && (
          <p className="text-caption text-secondary">
            +{order.lineItems.nodes.length - 2} more items
          </p>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-5 py-4 bg-surface/50 flex items-center justify-between">
        <div>
          <span className="text-body-sm text-secondary">Total: </span>
          <span className="font-display font-bold text-primary">
            <Money data={order.totalPrice} />
          </span>
        </div>
        <Link
          to={orderUrl}
          className="inline-flex items-center gap-1 text-body-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function OrderStatusBadge({
  financialStatus,
  fulfillmentStatus,
}: {
  financialStatus?: string;
  fulfillmentStatus?: string;
}) {
  // Determine status and color
  let status = fulfillmentStatus || financialStatus || 'Processing';
  let colorClass = 'bg-surface text-secondary';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('fulfilled') || statusLower.includes('paid')) {
    colorClass = 'bg-success/10 text-success';
    status = fulfillmentStatus || 'Fulfilled';
  } else if (statusLower.includes('pending') || statusLower.includes('unfulfilled')) {
    colorClass = 'bg-warning/10 text-warning';
    status = 'Processing';
  } else if (statusLower.includes('cancelled') || statusLower.includes('refunded')) {
    colorClass = 'bg-error/10 text-error';
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-caption font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
```

- **VALIDATE**: `npm run typecheck`

---

### Task 4: CREATE `app/components/account/AddressCard.tsx`

- **IMPLEMENT**: Address display card with actions
- **PATTERN**: Card with edit/delete buttons

**Implementation:**

```tsx
/**
 * AddressCard Component - Design System
 * 
 * Address display card for account addresses
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Form} from 'react-router';
import type {AddressFragment} from 'customer-accountapi.generated';
import {MapPin, Star, Pencil, Trash2} from 'lucide-react';
import {Button} from '~/components/ui/Button';

interface AddressCardProps {
  address: AddressFragment;
  isDefault?: boolean;
  onEdit?: () => void;
}

export function AddressCard({address, isDefault, onEdit}: AddressCardProps) {
  return (
    <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="font-display font-bold text-primary">
            {address.firstName} {address.lastName}
          </span>
        </div>
        {isDefault && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-caption font-medium">
            <Star className="w-3 h-3 fill-current" />
            Default
          </span>
        )}
      </div>
      
      {/* Address Content */}
      <div className="px-5 py-4 text-body-sm text-secondary space-y-0.5">
        {address.company && <p>{address.company}</p>}
        <p>{address.address1}</p>
        {address.address2 && <p>{address.address2}</p>}
        <p>
          {address.city}, {address.zoneCode} {address.zip}
        </p>
        <p>{address.territoryCode}</p>
        {address.phoneNumber && (
          <p className="pt-2">{address.phoneNumber}</p>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-5 py-3 bg-surface/50 flex items-center gap-3">
        <Button
          variant="tertiary"
          size="sm"
          onClick={onEdit}
          className="!px-3"
        >
          <Pencil className="w-4 h-4 mr-1.5" />
          Edit
        </Button>
        <Form method="DELETE" action="/account/addresses">
          <input type="hidden" name="addressId" value={address.id} />
          <Button
            type="submit"
            variant="tertiary"
            size="sm"
            className="!px-3 !text-error hover:!bg-error/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </Form>
      </div>
    </div>
  );
}
```

- **VALIDATE**: `npm run typecheck`

---

### Task 5: UPDATE `app/routes/($locale).account.tsx`

- **IMPLEMENT**: Use new AccountLayout component
- **KEEP**: Existing loader logic for customer data

**Replace component with:**

```tsx
import {
  data as remixData,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {AccountLayout} from '~/components/account/AccountLayout';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayoutRoute() {
  const {customer} = useLoaderData<typeof loader>();

  return <Outlet context={{customer}} />;
}
```

- **NOTE**: We're removing the heading from the layout route itself - each page will set its own heading via AccountLayout
- **VALIDATE**: `npm run typecheck`

---

### Task 6: UPDATE `app/routes/($locale).account._index.tsx`

- **IMPLEMENT**: Dashboard with welcome message and quick stats
- **PATTERN**: Use AccountLayout with dashboard content

**Replace entire file with:**

```tsx
import {Link, useOutletContext} from 'react-router';
import type {CustomerFragment} from 'customer-accountapi.generated';
import {AccountLayout} from '~/components/account/AccountLayout';
import {Button} from '~/components/ui/Button';
import {Package, MapPin, User, ChevronRight} from 'lucide-react';

export const meta = () => {
  return [{title: 'My Account'}];
};

export default function AccountDashboard() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  
  const firstName = customer.firstName || 'there';
  const memberSince = customer.createdAt 
    ? new Date(customer.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : null;

  return (
    <AccountLayout 
      heading={`Welcome back, ${firstName}`}
      subheading="Manage your account and track your recovery journey"
    >
      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <QuickStatCard
          icon={<Package className="w-5 h-5" />}
          label="Total Orders"
          value={customer.orders?.nodes?.length?.toString() || '0'}
        />
        <QuickStatCard
          icon={<MapPin className="w-5 h-5" />}
          label="Saved Addresses"
          value={customer.addresses?.nodes?.length?.toString() || '0'}
        />
        <QuickStatCard
          icon={<User className="w-5 h-5" />}
          label="Member Since"
          value={memberSince || 'Today'}
        />
      </div>
      
      {/* Quick Links */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-primary">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <QuickLinkCard
            to="/account/orders"
            icon={<Package className="w-6 h-6" />}
            title="View Orders"
            description="Track your orders and view order history"
          />
          <QuickLinkCard
            to="/account/profile"
            icon={<User className="w-6 h-6" />}
            title="Edit Profile"
            description="Update your name and account details"
          />
          <QuickLinkCard
            to="/account/addresses"
            icon={<MapPin className="w-6 h-6" />}
            title="Manage Addresses"
            description="Add or edit your shipping addresses"
          />
          <QuickLinkCard
            to="/collections"
            icon={<Package className="w-6 h-6" />}
            title="Continue Shopping"
            description="Browse our collection of recovery tokens"
          />
        </div>
      </div>
    </AccountLayout>
  );
}

function QuickStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-5 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-3">
        {icon}
      </div>
      <div className="font-display text-2xl font-bold text-primary mb-1">
        {value}
      </div>
      <div className="text-body-sm text-secondary">{label}</div>
    </div>
  );
}

function QuickLinkCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-xl border border-black/5 hover:border-accent/20 hover:bg-surface/50 transition-all duration-200 group"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-primary group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-body-sm text-secondary">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-secondary group-hover:text-accent transition-colors" />
    </Link>
  );
}
```

- **VALIDATE**: `npm run typecheck && npm run dev`

---

### Task 7: UPDATE `app/routes/($locale).account.orders._index.tsx`

- **IMPLEMENT**: Redesigned orders list with OrderCard
- **KEEP**: Existing loader and filter logic

**Replace entire file with:**

```tsx
import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/layout/PaginatedResourceSection';
import {AccountLayout} from '~/components/account/AccountLayout';
import {OrderCard} from '~/components/account/OrderCard';
import {Button} from '~/components/ui/Button';
import {Input} from '~/components/ui/Input';
import {Search, X, Package} from 'lucide-react';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <AccountLayout
      heading="Your Orders"
      subheading="Track your orders and view your purchase history"
    >
      {/* Search Form */}
      <OrderSearchForm currentFilters={filters} />
      
      {/* Orders List */}
      {orders?.nodes.length ? (
        <div className="mt-6">
          <PaginatedResourceSection connection={orders}>
            {({node: order}) => {
              const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
              return (
                <div className="mb-4">
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    fulfillmentStatus={fulfillmentStatus}
                  />
                </div>
              );
            }}
          </PaginatedResourceSection>
        </div>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </AccountLayout>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
        <Package className="w-8 h-8 text-secondary" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="font-display text-xl font-bold text-primary mb-2">
            No orders found
          </h3>
          <p className="text-body text-secondary mb-6">
            No orders match your search criteria.
          </p>
          <Link to="/account/orders">
            <Button variant="secondary">Clear Filters</Button>
          </Link>
        </>
      ) : (
        <>
          <h3 className="font-display text-xl font-bold text-primary mb-2">
            No orders yet
          </h3>
          <p className="text-body text-secondary mb-6">
            You haven't placed any orders yet. Start shopping to celebrate your milestones!
          </p>
          <Link to="/collections">
            <Button variant="primary">Browse Tokens</Button>
          </Link>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-surface rounded-xl p-4"
      aria-label="Search orders"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Search by order #"
            aria-label="Order number"
            defaultValue={currentFilters.name || ''}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <Input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Search by confirmation #"
            aria-label="Confirmation number"
            defaultValue={currentFilters.confirmationNumber || ''}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="secondary"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
```

- **VALIDATE**: `npm run typecheck && npm run dev`

---

### Task 8: UPDATE `app/routes/($locale).account.orders.$id.tsx`

- **IMPLEMENT**: Redesigned order detail page
- **KEEP**: Existing loader logic

**Replace entire file with:**

```tsx
import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {AccountLayout} from '~/components/account/AccountLayout';
import {Button} from '~/components/ui/Button';
import {ArrowLeft, ExternalLink, Package, MapPin, CreditCard} from 'lucide-react';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;
  const lineItems = order.lineItems.nodes;
  const discountApplications = order.discountApplications.nodes;
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<typeof firstDiscount, {__typename: 'MoneyV2'}>)
      : null;
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (firstDiscount as Extract<typeof firstDiscount, {__typename: 'PricingPercentageValue'}>).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  
  const orderDate = new Date(order.processedAt!).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AccountLayout
      heading={`Order ${order.name}`}
      subheading={`Placed on ${orderDate}`}
    >
      {/* Back Link */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-body-sm text-secondary hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Order Status */}
      <div className="bg-surface rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-body-sm text-secondary">Status</p>
            <p className="font-display font-bold text-primary">{fulfillmentStatus}</p>
          </div>
        </div>
        {order.confirmationNumber && (
          <div>
            <p className="text-body-sm text-secondary">Confirmation</p>
            <p className="font-display font-bold text-primary">{order.confirmationNumber}</p>
          </div>
        )}
        <a
          href={order.statusPageUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2"
        >
          <Button variant="secondary" size="sm">
            Track Order
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <h2 className="font-display text-lg font-bold text-primary mb-4">
          Items Ordered
        </h2>
        <div className="space-y-3">
          {lineItems.map((lineItem, index) => (
            <OrderLineItem key={index} lineItem={lineItem} />
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-surface rounded-xl p-5 mb-6">
        <h2 className="font-display text-lg font-bold text-primary mb-4">
          Order Summary
        </h2>
        <div className="space-y-2">
          {((discountValue && discountValue.amount) || discountPercentage) && (
            <div className="flex justify-between text-body-sm">
              <span className="text-secondary">Discount</span>
              <span className="text-success font-medium">
                {discountPercentage ? (
                  `-${discountPercentage}%`
                ) : (
                  discountValue && <>-<Money data={discountValue} /></>
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between text-body-sm">
            <span className="text-secondary">Subtotal</span>
            <span className="text-primary"><Money data={order.subtotal!} /></span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-secondary">Tax</span>
            <span className="text-primary"><Money data={order.totalTax!} /></span>
          </div>
          <div className="flex justify-between text-body font-bold pt-2 border-t border-black/5">
            <span className="text-primary">Total</span>
            <span className="text-primary"><Money data={order.totalPrice!} /></span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-primary">
              Shipping Address
            </h2>
          </div>
          {order.shippingAddress ? (
            <address className="text-body-sm text-secondary not-italic space-y-0.5">
              <p className="font-medium text-primary">{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted && (
                <p>{order.shippingAddress.formatted}</p>
              )}
              {order.shippingAddress.formattedArea && (
                <p>{order.shippingAddress.formattedArea}</p>
              )}
            </address>
          ) : (
            <p className="text-body-sm text-secondary">No shipping address</p>
          )}
        </div>

        <div className="bg-surface rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-primary">
              Payment
            </h2>
          </div>
          <p className="text-body-sm text-secondary">
            {order.financialStatus}
          </p>
        </div>
      </div>
    </AccountLayout>
  );
}

function OrderLineItem({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <div className="flex gap-4 bg-white rounded-lg p-4 border border-black/5">
      {lineItem.image && (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0">
          <Image
            data={lineItem.image}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-primary">{lineItem.title}</h3>
        {lineItem.variantTitle && lineItem.variantTitle !== 'Default Title' && (
          <p className="text-body-sm text-secondary">{lineItem.variantTitle}</p>
        )}
        <p className="text-body-sm text-secondary mt-1">Qty: {lineItem.quantity}</p>
      </div>
      <div className="text-right">
        <p className="font-display font-bold text-primary">
          <Money data={lineItem.price!} />
        </p>
      </div>
    </div>
  );
}
```

- **VALIDATE**: `npm run typecheck && npm run dev`

---

### Task 9: UPDATE `app/routes/($locale).account.profile.tsx`

- **IMPLEMENT**: Redesigned profile form
- **KEEP**: Existing action logic

**Replace entire file with:**

```tsx
import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';
import {AccountLayout} from '~/components/account/AccountLayout';
import {Button} from '~/components/ui/Button';
import {Input} from '~/components/ui/Input';
import {User, Mail, CheckCircle, AlertCircle} from 'lucide-react';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!mutationData?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: mutationData?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const isSubmitting = state !== 'idle';

  return (
    <AccountLayout
      heading="Your Profile"
      subheading="Update your personal information"
    >
      <Form method="PUT" className="max-w-lg">
        {/* Success Message */}
        {action?.customer && !action?.error && (
          <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <p className="text-body-sm text-success">
              Your profile has been updated successfully.
            </p>
          </div>
        )}
        
        {/* Error Message */}
        {action?.error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
            <p className="text-body-sm text-error">{action.error}</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-body-sm font-medium text-primary mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Enter your first name"
              defaultValue={customer.firstName ?? ''}
              minLength={2}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-body-sm font-medium text-primary mb-2">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Enter your last name"
              defaultValue={customer.lastName ?? ''}
              minLength={2}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-primary mb-2">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                value={customer.emailAddress?.emailAddress ?? ''}
                disabled
                className="w-full !bg-surface !cursor-not-allowed"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            </div>
            <p className="mt-1.5 text-caption text-secondary">
              Email cannot be changed. Contact support if you need assistance.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t border-black/5">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </AccountLayout>
  );
}
```

- **VALIDATE**: `npm run typecheck && npm run dev`

---

### Task 10: UPDATE `app/routes/($locale).account.addresses.tsx`

- **IMPLEMENT**: Redesigned addresses page with AddressCard
- **KEEP**: Existing action logic and AddressForm
- **NOTE**: This is a larger file - we'll modernize the layout while keeping the form logic

**Replace entire file with:**

```tsx
import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {AccountLayout} from '~/components/account/AccountLayout';
import {Button} from '~/components/ui/Button';
import {Input} from '~/components/ui/Input';
import {Plus, MapPin, Star, CheckCircle, AlertCircle} from 'lucide-react';
import {useState} from 'react';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {status: 401},
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        try {
          const {data: mutationData, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (mutationData?.customerAddressCreate?.userErrors?.length) {
            throw new Error(mutationData?.customerAddressCreate?.userErrors[0].message);
          }

          if (!mutationData?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: mutationData?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {status: 400},
            );
          }
          return data(
            {error: {[addressId]: error}},
            {status: 400},
          );
        }
      }

      case 'PUT': {
        try {
          const {data: mutationData, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (mutationData?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(mutationData?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!mutationData?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {status: 400},
            );
          }
          return data(
            {error: {[addressId]: error}},
            {status: 400},
          );
        }
      }

      case 'DELETE': {
        try {
          const {data: mutationData, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (mutationData?.customerAddressDelete?.userErrors?.length) {
            throw new Error(mutationData?.customerAddressDelete?.userErrors[0].message);
          }

          if (!mutationData?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {status: 400},
            );
          }
          return data(
            {error: {[addressId]: error}},
            {status: 400},
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {status: 405},
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {status: 400},
      );
    }
    return data(
      {error},
      {status: 400},
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <AccountLayout
      heading="Your Addresses"
      subheading="Manage your shipping addresses"
    >
      {/* Add New Address Button */}
      {!showNewForm && (
        <Button
          variant="secondary"
          onClick={() => setShowNewForm(true)}
          className="mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      )}

      {/* New Address Form */}
      {showNewForm && (
        <div className="mb-8 p-6 bg-surface rounded-xl">
          <h2 className="font-display text-lg font-bold text-primary mb-4">
            Add New Address
          </h2>
          <NewAddressForm onCancel={() => setShowNewForm(false)} />
        </div>
      )}

      {/* Existing Addresses */}
      {addresses.nodes.length > 0 ? (
        <div className="space-y-6">
          <h2 className="font-display text-lg font-bold text-primary">
            Saved Addresses
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.nodes.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                defaultAddress={defaultAddress}
              />
            ))}
          </div>
        </div>
      ) : (
        !showNewForm && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
              <MapPin className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-display text-xl font-bold text-primary mb-2">
              No addresses saved
            </h3>
            <p className="text-body text-secondary mb-6">
              Add a shipping address to make checkout faster.
            </p>
            <Button variant="primary" onClick={() => setShowNewForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        )
      )}
    </AccountLayout>
  );
}

function NewAddressForm({onCancel}: {onCancel: () => void}) {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="flex gap-3 mt-6">
          <Button
            type="submit"
            variant="primary"
            formMethod="POST"
            disabled={stateForMethod('POST') !== 'idle'}
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating...' : 'Create Address'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </AddressForm>
  );
}

function AddressCard({
  address,
  defaultAddress,
}: {
  address: AddressFragment;
  defaultAddress: CustomerFragment['defaultAddress'];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isDefault = defaultAddress?.id === address.id;

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-black/5 p-5">
        <h3 className="font-display font-bold text-primary mb-4">Edit Address</h3>
        <AddressForm
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div className="flex gap-3 mt-6">
              <Button
                type="submit"
                variant="primary"
                formMethod="PUT"
                disabled={stateForMethod('PUT') !== 'idle'}
              >
                {stateForMethod('PUT') !== 'idle' ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </AddressForm>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="font-display font-bold text-primary">
            {address.firstName} {address.lastName}
          </span>
        </div>
        {isDefault && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-caption font-medium">
            <Star className="w-3 h-3 fill-current" />
            Default
          </span>
        )}
      </div>

      {/* Address Content */}
      <div className="px-5 py-4 text-body-sm text-secondary space-y-0.5">
        {address.company && <p>{address.company}</p>}
        <p>{address.address1}</p>
        {address.address2 && <p>{address.address2}</p>}
        <p>
          {address.city}, {address.zoneCode} {address.zip}
        </p>
        <p>{address.territoryCode}</p>
        {address.phoneNumber && <p className="pt-2">{address.phoneNumber}</p>}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-surface/50 flex items-center gap-3">
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
        <Form method="DELETE">
          <input type="hidden" name="addressId" value={address.id} />
          <Button
            type="submit"
            variant="tertiary"
            size="sm"
            className="!text-error hover:!bg-error/10"
          >
            Delete
          </Button>
        </Form>
      </div>
    </div>
  );
}

function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId}>
      <input type="hidden" name="addressId" defaultValue={addressId} />
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`firstName-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            First Name *
          </label>
          <Input
            id={`firstName-${addressId}`}
            name="firstName"
            type="text"
            autoComplete="given-name"
            defaultValue={address?.firstName ?? ''}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor={`lastName-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            Last Name *
          </label>
          <Input
            id={`lastName-${addressId}`}
            name="lastName"
            type="text"
            autoComplete="family-name"
            defaultValue={address?.lastName ?? ''}
            required
            className="w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`company-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            Company
          </label>
          <Input
            id={`company-${addressId}`}
            name="company"
            type="text"
            autoComplete="organization"
            defaultValue={address?.company ?? ''}
            className="w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`address1-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            Address Line 1 *
          </label>
          <Input
            id={`address1-${addressId}`}
            name="address1"
            type="text"
            autoComplete="address-line1"
            defaultValue={address?.address1 ?? ''}
            required
            className="w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`address2-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            Address Line 2
          </label>
          <Input
            id={`address2-${addressId}`}
            name="address2"
            type="text"
            autoComplete="address-line2"
            defaultValue={address?.address2 ?? ''}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor={`city-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            City *
          </label>
          <Input
            id={`city-${addressId}`}
            name="city"
            type="text"
            autoComplete="address-level2"
            defaultValue={address?.city ?? ''}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor={`zoneCode-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            State / Province *
          </label>
          <Input
            id={`zoneCode-${addressId}`}
            name="zoneCode"
            type="text"
            autoComplete="address-level1"
            defaultValue={address?.zoneCode ?? ''}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor={`zip-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            ZIP / Postal Code *
          </label>
          <Input
            id={`zip-${addressId}`}
            name="zip"
            type="text"
            autoComplete="postal-code"
            defaultValue={address?.zip ?? ''}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor={`territoryCode-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            Country Code *
          </label>
          <Input
            id={`territoryCode-${addressId}`}
            name="territoryCode"
            type="text"
            autoComplete="country"
            defaultValue={address?.territoryCode ?? ''}
            required
            maxLength={2}
            placeholder="US"
            className="w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`phoneNumber-${addressId}`} className="block text-body-sm font-medium text-primary mb-1.5">
            Phone
          </label>
          <Input
            id={`phoneNumber-${addressId}`}
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''}
            placeholder="+16135551111"
            className="w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="defaultAddress"
              defaultChecked={isDefaultAddress}
              className="w-4 h-4 rounded border-black/20 text-accent focus:ring-accent"
            />
            <span className="text-body-sm text-primary">Set as default address</span>
          </label>
        </div>
      </div>

      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}
```

- **VALIDATE**: `npm run typecheck && npm run dev`

---

## TESTING STRATEGY

### Manual Testing

1. **Account Dashboard**:
   - Navigate to `/account` when logged in
   - Verify welcome message shows customer name
   - Verify quick stats display correctly
   - Test all quick action links

2. **Orders List**:
   - Navigate to `/account/orders`
   - Verify OrderCard displays correctly
   - Test search functionality
   - Test pagination if many orders

3. **Order Detail**:
   - Click on an order to view details
   - Verify all order information displays
   - Test "Track Order" link
   - Verify back navigation

4. **Profile**:
   - Navigate to `/account/profile`
   - Update first/last name
   - Verify success message
   - Verify email is read-only

5. **Addresses**:
   - Navigate to `/account/addresses`
   - Add new address
   - Edit existing address
   - Delete address
   - Set default address

6. **Responsive Design**:
   - Test all pages on mobile
   - Verify mobile navigation works
   - Check touch targets are sufficient

---

## VALIDATION COMMANDS

```bash
npm run typecheck
npm run lint
npm run build
npm run dev
```

---

## ACCEPTANCE CRITERIA

- [ ] Account layout uses sidebar navigation on desktop
- [ ] Mobile shows horizontal scrolling nav tabs
- [ ] Dashboard shows welcome message and quick stats
- [ ] Orders list uses OrderCard component
- [ ] Order detail shows all order information
- [ ] Profile form styled with design system
- [ ] Address management with AddressCard
- [ ] All pages use design system tokens
- [ ] No TypeScript errors
- [ ] Responsive on all breakpoints
- [ ] Consistent with homepage/PDP design language

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed
- [ ] All validation commands executed
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met
