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

  return (
    <AccountLayout 
      heading={`Welcome back, ${firstName}`}
      subheading="Manage your account and track your recovery journey"
    >
      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <QuickStatCard
          icon={<MapPin className="w-5 h-5" />}
          label="Saved Addresses"
          value={customer.addresses?.nodes?.length?.toString() || '0'}
        />
        <QuickStatCard
          icon={<User className="w-5 h-5" />}
          label="Account Status"
          value="Active"
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
