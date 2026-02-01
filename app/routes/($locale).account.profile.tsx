import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {CUSTOMER_METAFIELDS_SET_MUTATION} from '~/graphql/customer-account/CustomerMetafieldsMutation';
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
import {CheckCircle, AlertCircle, Calendar, Heart, Mail, Clock} from 'lucide-react';

export type ActionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  section?: string;
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
  const section = form.get('section')?.toString();

  try {
    // Handle Personal Information Update
    if (section === 'personal') {
      const customer: CustomerUpdateInput = {};
      const validInputKeys = ['firstName', 'lastName', 'phoneNumber'] as const;
      
      for (const [key, value] of form.entries()) {
        if (!validInputKeys.includes(key as any)) continue;
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

      if (errors?.length || mutationData?.customerUpdate?.userErrors?.length) {
        throw new Error(
          mutationData?.customerUpdate?.userErrors?.[0]?.message || errors?.[0]?.message || 'Update failed'
        );
      }

      return data({
        success: true,
        message: 'Personal information updated successfully',
        section: 'personal',
      });
    }

    // Handle Recovery Journey Update (Metafields)
    if (section === 'recovery') {
      const {data: customerData} = await customerAccount.query(`#graphql
        query GetCustomerId($language: LanguageCode) @inContext(language: $language) {
          customer {
            id
          }
        }
      `, {
        variables: {
          language: customerAccount.i18n.language,
        },
      });

      const customerId = customerData?.customer?.id;
      if (!customerId) throw new Error('Customer ID not found');

      const metafields = [];
      
      const sobrietyDate = form.get('sobriety_date')?.toString();
      const recoveryProgram = form.get('recovery_program')?.toString();
      const milestoneReminders = form.get('milestone_reminders')?.toString();

      if (sobrietyDate) {
        metafields.push({
          ownerId: customerId,
          namespace: 'custom',
          key: 'sobriety_date',
          value: sobrietyDate,
          type: 'date',
        });
      }

      if (recoveryProgram) {
        metafields.push({
          ownerId: customerId,
          namespace: 'custom',
          key: 'recovery_program',
          value: recoveryProgram,
          type: 'single_line_text_field',
        });
      }

      if (milestoneReminders) {
        metafields.push({
          ownerId: customerId,
          namespace: 'custom',
          key: 'milestone_reminders',
          value: milestoneReminders,
          type: 'boolean',
        });
      }

      if (metafields.length > 0) {
        const {data: metafieldsData, errors} = await customerAccount.mutate(
          CUSTOMER_METAFIELDS_SET_MUTATION,
          {
            variables: {
              metafields,
              language: customerAccount.i18n.language,
            },
          },
        );

        if (errors?.length || metafieldsData?.metafieldsSet?.userErrors?.length) {
          throw new Error(
            metafieldsData?.metafieldsSet?.userErrors?.[0]?.message || errors?.[0]?.message || 'Update failed'
          );
        }
      }

      return data({
        success: true,
        message: 'Recovery journey updated successfully',
        section: 'recovery',
      });
    }

    return data({error: 'Invalid section'}, {status: 400});
  } catch (error: any) {
    return data(
      {
        success: false,
        error: error.message || 'Update failed',
        section,
      },
      {status: 400},
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<typeof action>();
  const customer = account?.customer;
  
  // Get metafield values
  const getMetafield = (key: string) => {
    return customer?.metafields?.find((m: any) => m.key === key)?.value;
  };
  
  const sobrietyDate = getMetafield('sobriety_date');
  const recoveryProgram = getMetafield('recovery_program');
  const milestoneReminders = getMetafield('milestone_reminders');
  
  // Calculate profile completion
  const calculateCompletion = () => {
    let completed = 0;
    const total = 5;
    
    if (customer?.firstName) completed++;
    if (customer?.lastName) completed++;
    if (customer?.phoneNumber?.phoneNumber) completed++;
    if (sobrietyDate) completed++;
    if (recoveryProgram) completed++;
    
    return Math.round((completed / total) * 100);
  };
  
  // Calculate days in recovery
  const calculateDaysInRecovery = () => {
    if (!sobrietyDate) return null;
    const start = new Date(sobrietyDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const completion = calculateCompletion();
  const daysInRecovery = calculateDaysInRecovery();
  const memberSince = customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  }) : null;

  return (
    <AccountLayout
      heading="Your Profile"
      subheading="Manage your personal information and recovery journey"
    >
      {/* Success Message */}
      {action?.success && (
        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-body text-success">
            {action.message}
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {action?.error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-body text-error">{action.error}</p>
        </div>
      )}

      {/* Profile Completion */}
      <div className="mb-8 p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Profile Completion</h3>
            <p className="text-body-sm text-secondary mt-1">Complete your profile to get the most out of your account</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-accent">{completion}%</div>
          </div>
        </div>
        <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-accent h-full rounded-full transition-all duration-500"
            style={{width: `${completion}%`}}
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <PersonalInformationSection customer={customer} isSubmitting={state !== 'idle'} />
        
        {/* Recovery Journey */}
        <RecoveryJourneySection 
          sobrietyDate={sobrietyDate}
          recoveryProgram={recoveryProgram}
          milestoneReminders={milestoneReminders}
          isSubmitting={state !== 'idle'}
        />
        
        {/* Account Summary */}
        <AccountSummarySection 
          memberSince={memberSince}
          daysInRecovery={daysInRecovery}
        />
      </div>
    </AccountLayout>
  );
}

function PersonalInformationSection({
  customer,
  isSubmitting,
}: {
  customer: any;
  isSubmitting: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-black/5 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-primary">Personal Information</h2>
          <p className="text-body-sm text-secondary">Update your name and contact details</p>
        </div>
      </div>

      <Form method="PUT">
        <input type="hidden" name="section" value="personal" />
        
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="block text-body font-medium text-primary mb-2">
                First Name *
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your first name"
                defaultValue={customer?.firstName ?? ''}
                required
                minLength={2}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-body font-medium text-primary mb-2">
                Last Name *
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
                defaultValue={customer?.lastName ?? ''}
                required
                minLength={2}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-body font-medium text-primary mb-2">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 123-4567"
              defaultValue={customer?.phoneNumber?.phoneNumber ?? ''}
              className="w-full"
            />
            <p className="text-caption text-secondary mt-2">
              We'll use this for order updates and milestone reminders (if enabled)
            </p>
          </div>

          <div>
            <label className="block text-body font-medium text-primary mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-black/5">
              <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-body text-primary">{customer?.emailAddress?.emailAddress}</p>
                <p className="text-caption text-secondary mt-0.5">
                  Email is managed through your Shopify account
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-black/5">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  );
}

function RecoveryJourneySection({
  sobrietyDate,
  recoveryProgram,
  milestoneReminders,
  isSubmitting,
}: {
  sobrietyDate?: string;
  recoveryProgram?: string;
  milestoneReminders?: string;
  isSubmitting: boolean;
}) {
  return (
    <div className="bg-gradient-to-br from-accent/5 to-white rounded-xl border border-accent/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-primary">Recovery Journey</h2>
          <p className="text-body-sm text-secondary">Track your milestones and celebrate your progress</p>
        </div>
      </div>

      <Form method="PUT">
        <input type="hidden" name="section" value="recovery" />
        
        <div className="space-y-5">
          <div>
            <label htmlFor="sobriety_date" className="block text-body font-medium text-primary mb-2">
              Sobriety Start Date
            </label>
            <Input
              id="sobriety_date"
              name="sobriety_date"
              type="date"
              defaultValue={sobrietyDate ?? ''}
              className="w-full"
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-caption text-secondary mt-2">
              This helps us calculate your milestones and recommend the right tokens
            </p>
          </div>

          <div>
            <label htmlFor="recovery_program" className="block text-body font-medium text-primary mb-2">
              Recovery Program
            </label>
            <select
              id="recovery_program"
              name="recovery_program"
              defaultValue={recoveryProgram ?? ''}
              className="w-full px-4 py-3 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-body text-primary bg-white"
            >
              <option value="">Select a program</option>
              <option value="AA">Alcoholics Anonymous (AA)</option>
              <option value="NA">Narcotics Anonymous (NA)</option>
              <option value="SMART">SMART Recovery</option>
              <option value="Celebrate Recovery">Celebrate Recovery</option>
              <option value="Refuge Recovery">Refuge Recovery</option>
              <option value="Other">Other</option>
              <option value="None">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="milestone_reminders"
                defaultChecked={milestoneReminders === 'true'}
                className="mt-1 w-5 h-5 rounded border-black/20 text-accent focus:ring-accent"
              />
              <div className="flex-1">
                <span className="text-body font-medium text-primary group-hover:text-accent transition-colors">
                  Enable Milestone Reminders
                </span>
                <p className="text-caption text-secondary mt-1">
                  Get notified when you're approaching important sobriety milestones (30, 60, 90 days, etc.)
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-accent/20">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto !bg-accent"
          >
            {isSubmitting ? 'Saving...' : 'Save Recovery Journey'}
          </Button>
        </div>
      </Form>
    </div>
  );
}

function AccountSummarySection({
  memberSince,
  daysInRecovery,
}: {
  memberSince: string | null;
  daysInRecovery: number | null;
}) {
  return (
    <div className="bg-gradient-to-br from-primary to-surface-dark rounded-xl p-6 text-white">
      <h2 className="font-display text-xl font-bold mb-6">Account Summary</h2>
      
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-caption text-white/60 mb-1">Member Since</div>
            <div className="font-display text-lg font-bold">{memberSince || 'N/A'}</div>
          </div>
        </div>

        {daysInRecovery !== null ? (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-caption text-white/60 mb-1">Days in Recovery</div>
              <div className="font-display text-lg font-bold text-accent">{daysInRecovery} 🎉</div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-caption text-white/60 mb-1">Recovery Journey</div>
              <div className="text-body-sm text-white/80">Not set</div>
            </div>
          </div>
        )}
      </div>

      {daysInRecovery === null && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
          <p className="text-body-sm text-white/80">
            💡 Add your sobriety start date above to see your recovery progress and get milestone reminders!
          </p>
        </div>
      )}
    </div>
  );
}
