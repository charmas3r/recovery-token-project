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
import {CheckCircle, AlertCircle} from 'lucide-react';

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

          {/* Note: Email field removed as it's managed via Shopify's Customer Account system */}
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
