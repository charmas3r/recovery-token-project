import {Link, useLoaderData, useOutletContext} from 'react-router';
import type {Route} from './+types/account._index';
import type {CustomerFragment} from 'customer-accountapi.generated';
import {AccountLayout} from '~/components/account/AccountLayout';
import {CUSTOMER_METAFIELDS_QUERY} from '~/graphql/customer-account/CustomerMetafieldsQuery';
import {
  calculateDaysSober,
  getNextMilestone,
  getRelationshipLabel,
  parseRecoveryCircle,
  type RecoveryCircleMember,
} from '~/lib/recoveryCircle';
import {Package, MapPin, User, Users, ChevronRight, ShoppingBag, CheckCircle, Award, Heart} from 'lucide-react';

export const meta = () => {
  return [{title: 'My Account'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  customerAccount.handleAuthStatus();
  try {
    const {data: metafieldsData} = await customerAccount.query(
      CUSTOMER_METAFIELDS_QUERY,
      {variables: {language: customerAccount.i18n.language}},
    );
    const metafields = metafieldsData?.customer?.metafields ?? [];
    const sobrietyDate = metafields?.find((m: any) => m?.key === 'sobriety_date')?.value ?? '';
    const circleRaw = metafields?.find((m: any) => m?.key === 'recovery_circle')?.value ?? null;
    const circle = parseRecoveryCircle(circleRaw);
    return {sobrietyDate, circle};
  } catch {
    return {sobrietyDate: '', circle: [] as RecoveryCircleMember[]};
  }
}

export default function AccountDashboard() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {sobrietyDate, circle} = useLoaderData<typeof loader>();
  const firstName = customer.firstName || 'there';
  const daysSober = sobrietyDate ? calculateDaysSober(sobrietyDate) : null;
  const nextMilestone = sobrietyDate ? getNextMilestone(sobrietyDate) : null;

  return (
    <AccountLayout
      heading={`Welcome back, ${firstName}`}
      subheading="Manage your account and track your recovery journey"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        {daysSober !== null ? (
          <QuickStatCard icon={<Award className="w-5 h-5" />} label="Days Sober" value={daysSober.toLocaleString()} valueColor="text-accent" />
        ) : (
          <QuickStatCard icon={<Award className="w-5 h-5" />} label="Recovery Journey" value="Set Up" valueColor="text-accent" isLink to="/account/profile" />
        )}
        {nextMilestone ? (
          <QuickStatCard icon={<CheckCircle className="w-5 h-5" />} label={`Next: ${nextMilestone.label}`} value={`${nextMilestone.daysUntil}d`} valueColor="text-green-600" />
        ) : (
          <QuickStatCard icon={<User className="w-5 h-5" />} label="Account Status" value="Active" valueColor="text-green-600" />
        )}
        <QuickStatCard icon={<ShoppingBag className="w-5 h-5" />} label="Orders" value="View All" isLink to="/account/orders" />
        <QuickStatCard icon={<MapPin className="w-5 h-5" />} label="Saved Addresses" value={customer.addresses?.nodes?.length?.toString() || '0'} />
      </div>

      {/* Recovery Circle Summary */}
      <RecoveryCircleSection circle={circle} />

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-xl lg:text-2xl font-bold text-primary mb-6">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
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
            icon={<ShoppingBag className="w-6 h-6" />}
            title="Continue Shopping"
            description="Browse our collection of recovery tokens"
          />
        </div>
      </div>
    </AccountLayout>
  );
}

function RecoveryCircleSection({circle}: {circle: RecoveryCircleMember[]}) {
  if (circle.length === 0) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl lg:text-2xl font-bold text-primary">
            Your Recovery Circle
          </h2>
        </div>
        <div className="rounded-xl border border-black/5 bg-surface/50 p-6 lg:p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-display text-lg font-bold text-primary mb-2">
            Track milestones for the people you care about
          </h3>
          <p className="text-body text-secondary max-w-md mx-auto mb-6 leading-relaxed">
            Your Recovery Circle lets you track recovery milestones for the people
            you care about. Use nicknames — no personal data is stored.
          </p>
          <Link
            to="/account/circle"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors min-h-[44px]"
          >
            Set Up Circle
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Show up to 4 members in the summary
  const displayMembers = circle.slice(0, 4);
  const remaining = circle.length - displayMembers.length;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl lg:text-2xl font-bold text-primary">
            Your Recovery Circle
          </h2>
          <span className="text-caption text-secondary">
            {circle.length} {circle.length === 1 ? 'member' : 'members'}
          </span>
        </div>
        <Link
          to="/account/circle"
          className="text-body-sm font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
        >
          Manage Circle
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {displayMembers.map((member) => {
          const days = member.cleanDate ? calculateDaysSober(member.cleanDate) : null;
          const initial = member.name.charAt(0).toUpperCase();
          return (
            <Link
              key={member.id}
              to="/account/circle"
              className="rounded-xl border border-black/5 bg-white p-4 hover:border-accent/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-base font-bold text-accent">
                    {initial}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-primary truncate group-hover:text-accent transition-colors">
                    {member.name}
                  </p>
                  {member.relationship && (
                    <p className="text-caption text-secondary truncate">
                      {getRelationshipLabel(member.relationship)}
                    </p>
                  )}
                </div>
              </div>
              {days !== null && (
                <div className="text-body-sm font-medium text-accent">
                  {days.toLocaleString()} days sober
                </div>
              )}
            </Link>
          );
        })}
      </div>
      {remaining > 0 && (
        <div className="mt-3 text-center">
          <Link
            to="/account/circle"
            className="text-body-sm text-secondary hover:text-accent transition-colors"
          >
            +{remaining} more {remaining === 1 ? 'member' : 'members'}
          </Link>
        </div>
      )}
    </div>
  );
}

function QuickStatCard({
  icon,
  label,
  value,
  valueColor = 'text-primary',
  isLink = false,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  isLink?: boolean;
  to?: string;
}) {
  const content = (
    <div className={`bg-surface rounded-xl p-4 lg:p-6 text-center h-full ${isLink ? 'hover:bg-surface/80 transition-colors cursor-pointer' : ''}`}>
      <div className="inline-flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-accent/10 text-accent mb-3">
        {icon}
      </div>
      <div className={`font-display text-xl lg:text-2xl font-bold ${valueColor} mb-1`}>
        {value}
      </div>
      <div className="text-body-sm lg:text-body text-secondary">{label}</div>
    </div>
  );

  if (isLink && to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
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
      className="flex items-start gap-4 lg:gap-5 p-5 lg:p-6 rounded-xl border border-black/5 hover:border-accent/30 hover:bg-surface/50 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base lg:text-lg font-bold text-primary group-hover:text-accent transition-colors mb-1">
          {title}
        </h3>
        <p className="text-body-sm text-secondary leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="flex-shrink-0 w-5 h-5 text-secondary group-hover:text-accent transition-colors mt-1" />
    </Link>
  );
}
