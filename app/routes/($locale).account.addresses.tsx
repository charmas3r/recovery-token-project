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
import {Plus, MapPin, Star, AlertCircle} from 'lucide-react';
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
